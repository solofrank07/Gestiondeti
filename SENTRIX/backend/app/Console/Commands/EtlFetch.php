<?php

namespace App\Console\Commands;

use App\Services\ETLService;
use App\Models\User;
use Illuminate\Console\Command;

class EtlFetch extends Command
{
    protected $signature = 'etl:fetch {source : Source name (ministerio-interior, inei)}';
    protected $description = 'Fetch and import data from an external ETL source';

    public function handle(ETLService $etlService): int
    {
        $source = $this->argument('source');
        $validSources = ['ministerio-interior', 'inei'];

        if (!in_array($source, $validSources)) {
            $this->error("Fuente inválida. Usa: " . implode(', ', $validSources));
            return Command::FAILURE;
        }

        try {
            $this->info("Fetching data from: {$source}...");
            $data = $etlService->fetchFromSource($source);
            $this->info("Fetched " . count($data) . " records.");

            if (empty($data)) {
                $this->warn("No data returned from source.");
                return Command::SUCCESS;
            }

            // Use the first admin user for attribution, or null
            $admin = User::whereHas('roles', fn($q) => $q->where('name', 'Administrador'))->first();

            $result = $etlService->importFromExternalApi($source, $data, $admin);

            $this->info("Import completed: {$result['imported']} imported, {$result['skipped']} skipped.");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
