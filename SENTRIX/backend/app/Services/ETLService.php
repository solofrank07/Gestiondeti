<?php

namespace App\Services;

use App\Helpers\GeoHelper;
use App\Models\EtlImport;
use App\Models\OfficialReport;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ETLService
{
    private const REQUIRED_COLUMNS = ['title', 'latitude', 'longitude', 'incident_date'];
    private const COLUMN_ALIASES = [
        'lat' => 'latitude', 'latitud' => 'latitude',
        'lng' => 'longitude', 'lon' => 'longitude', 'longitud' => 'longitude',
        'fecha' => 'incident_date', 'date' => 'incident_date', 'fecha_incidente' => 'incident_date',
        'titulo' => 'title', 'descripcion' => 'description',
        'tipo_delito' => 'crime_type', 'delito' => 'crime_type',
        'severidad' => 'severity', 'fuente' => 'source',
    ];

    public function __construct(
        private RiskScoreService $riskScoreService,
    ) {}

    public function importFromCsv(UploadedFile $file, User $user): array
    {
        $import = EtlImport::create([
            'source'    => 'csv_import',
            'filename'  => $file->getClientOriginalName(),
            'status'    => 'processing',
            'user_id'   => $user->id,
            'started_at'=> now(),
        ]);

        try {
            $result = $this->processCsv($file, $import);
            $import->update([
                'status'          => 'completed',
                'completed_at'    => now(),
                'imported_count'  => $result['imported'],
                'error_count'     => count($result['errors']),
                'skipped_count'   => $result['skipped'],
                'total_rows'      => $result['imported'] + count($result['errors']) + $result['skipped'],
                'errors'          => array_slice($result['errors'], 0, 100),
                'summary'         => [
                    'sources_found' => $result['sources_found'] ?? [],
                    'date_range'    => $result['date_range'] ?? null,
                ],
            ]);
            return $result;
        } catch (\Throwable $e) {
            $import->update(['status' => 'failed', 'completed_at' => now()]);
            Log::error("ETL CSV import failed: {$e->getMessage()}", ['import_id' => $import->id]);
            throw $e;
        }
    }

    public function importFromExternalApi(string $source, array $data, User $user): array
    {
        $import = EtlImport::create([
            'source'    => $source,
            'status'    => 'processing',
            'user_id'   => $user->id,
            'started_at'=> now(),
        ]);

        try {
            $imported = 0;
            $errors = [];
            $skipped = 0;

            DB::beginTransaction();
            foreach (array_chunk($data, 200) as $chunk) {
                foreach ($chunk as $item) {
                    $normalized = $this->normalizeRow($item);
                    if (!$normalized) {
                        $skipped++;
                        continue;
                    }

                    if ($this->isDuplicate($normalized)) {
                        $skipped++;
                        continue;
                    }

                    try {
                        OfficialReport::create([
                            'external_id'  => $item['id'] ?? uniqid("{$source}_"),
                            'source'       => $source,
                            'title'        => $normalized['title'],
                            'description'  => $normalized['description'] ?? '',
                            'latitude'     => $normalized['latitude'],
                            'longitude'    => $normalized['longitude'],
                            'incident_date'=> $normalized['incident_date'],
                            'severity'     => $normalized['severity'] ?? null,
                            'raw_data'     => $item,
                            'imported_at'  => now(),
                        ]);
                        $imported++;
                    } catch (\Exception $e) {
                        $errors[] = ['item_id' => $item['id'] ?? null, 'error' => $e->getMessage()];
                    }
                }
            }
            DB::commit();

            $import->update([
                'status'         => 'completed',
                'completed_at'   => now(),
                'imported_count' => $imported,
                'error_count'    => count($errors),
                'skipped_count'  => $skipped,
                'total_rows'     => count($data),
                'errors'         => array_slice($errors, 0, 100),
            ]);

            return ['imported' => $imported, 'errors' => $errors, 'skipped' => $skipped, 'total' => count($data)];
        } catch (\Throwable $e) {
            DB::rollBack();
            $import->update(['status' => 'failed', 'completed_at' => now()]);
            throw $e;
        }
    }

    public function fetchFromSource(string $source): array
    {
        $config = config("sentrix.etl.sources.{$source}");
        if (!$config || !($config['enabled'] ?? false)) {
            throw new \InvalidArgumentException("Fuente '{$source}' no habilitada");
        }

        $endpoint = rtrim($config['base_url'], '/') . '/api/reportes';
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . ($config['api_key'] ?? ''),
            'Accept' => 'application/json',
        ])->get($endpoint, ['limit' => 1000]);

        if (!$response->successful()) {
            throw new \RuntimeException("Error al consultar {$source}: {$response->status()}");
        }

        return $response->json()['data'] ?? $response->json() ?? [];
    }

    public function getHistory(int $limit = 50): array
    {
        return EtlImport::with('user')
            ->latest()
            ->take($limit)
            ->get()
            ->toArray();
    }

    public function getImportDetail(int $id): ?EtlImport
    {
        return EtlImport::with('user')->find($id);
    }

    private function processCsv(UploadedFile $file, EtlImport $import): array
    {
        $path = $file->store('etl-imports');
        $fullPath = storage_path("app/{$path}");

        $encoding = mb_detect_encoding(file_get_contents($fullPath), ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
        if ($encoding && $encoding !== 'UTF-8') {
            $content = mb_convert_encoding(file_get_contents($fullPath), 'UTF-8', $encoding);
            file_put_contents($fullPath, $content);
        }

        $stream = fopen($fullPath, 'r');
        $rawHeaders = fgetcsv($stream);
        if (!$rawHeaders) {
            fclose($stream);
            throw new \RuntimeException('CSV vacío o sin cabeceras');
        }

        $headers = array_map(fn($h) => $this->resolveColumn(trim($h)), $rawHeaders);

        $missing = array_diff(self::REQUIRED_COLUMNS, $headers);
        if (!empty($missing)) {
            fclose($stream);
            throw new \RuntimeException('Columnas requeridas faltantes: ' . implode(', ', $missing));
        }

        $imported = 0;
        $errors = [];
        $skipped = 0;
        $total = 0;
        $sourcesFound = [];
        $dates = [];

        DB::beginTransaction();
        try {
            $batch = [];
            while (($row = fgetcsv($stream)) !== false) {
                $total++;
                $data = array_combine($headers, $row);

                $validator = Validator::make($data, [
                    'title'         => 'required|string|max:200',
                    'description'   => 'nullable|string',
                    'latitude'      => 'required|numeric|between:-90,90',
                    'longitude'     => 'required|numeric|between:-180,180',
                    'incident_date' => 'required|date',
                    'severity'      => 'nullable|string|max:20',
                    'source'        => 'nullable|string|max:100',
                ]);

                if ($validator->fails()) {
                    $errors[] = ['row' => $total + 1, 'errors' => $validator->errors()->toArray()];
                    continue;
                }

                if ($this->isDuplicate($data)) {
                    $skipped++;
                    continue;
                }

                if (!empty($data['source'])) $sourcesFound[$data['source']] = true;
                if (!empty($data['incident_date'])) $dates[] = $data['incident_date'];

                $batch[] = [
                    'external_id'  => $data['external_id'] ?? uniqid('csv_'),
                    'source'       => $data['source'] ?? 'csv_import',
                    'title'        => $data['title'],
                    'description'  => $data['description'] ?? '',
                    'latitude'     => $data['latitude'],
                    'longitude'    => $data['longitude'],
                    'incident_date'=> $data['incident_date'],
                    'severity'     => $data['severity'] ?? null,
                    'imported_at'  => now(),
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];

                if (count($batch) >= 500) {
                    OfficialReport::insert($batch);
                    $imported += count($batch);
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                OfficialReport::insert($batch);
                $imported += count($batch);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($stream);
            throw $e;
        }

        fclose($stream);

        return [
            'imported'     => $imported,
            'errors'       => $errors,
            'skipped'      => $skipped,
            'total'        => $total,
            'sources_found'=> array_keys($sourcesFound),
            'date_range'   => !empty($dates) ? [min($dates), max($dates)] : null,
        ];
    }

    private function resolveColumn(string $name): string
    {
        $lower = mb_strtolower(trim($name));
        return self::COLUMN_ALIASES[$lower] ?? $lower;
    }

    private function normalizeRow(array $item): ?array
    {
        $normalized = [];
        foreach ($item as $key => $value) {
            $resolved = $this->resolveColumn((string) $key);
            $normalized[$resolved] = $value;
        }

        if (empty($normalized['title']) || empty($normalized['latitude']) || empty($normalized['longitude'])) {
            return null;
        }

        return $normalized;
    }

    private function isDuplicate(array $data): bool
    {
        $hours = config('sentrix.etl.dedup_window_hours', 24);
        $since = now()->subHours($hours);

        return OfficialReport::where('title', $data['title'])
            ->where('latitude', $data['latitude'])
            ->where('longitude', $data['longitude'])
            ->where('incident_date', $data['incident_date'])
            ->where('imported_at', '>=', $since)
            ->exists();
    }
}
