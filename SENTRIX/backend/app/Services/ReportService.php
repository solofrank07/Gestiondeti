<?php

namespace App\Services;

use App\Interfaces\ReportRepositoryInterface;
use App\Models\Report;
use App\Models\ReportStatus;
use App\Models\User;
use App\Notifications\ReportVerified;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ReportService
{
    public function __construct(
        private ReportRepositoryInterface $reportRepo,
        private HotspotService $hotspotService,
        private MediaService $mediaService,
    ) {}

    public function create(array $data, User $user): Report
    {
        $data['user_id'] = $user->id;
        $data['reporter_ip'] = request()->ip();
        $data['description'] = $data['description'] ?? 'Sin descripcion';
        $data['title'] = $data['title'] ?? 'Reporte';
        $report = $this->reportRepo->create($data);

        $nearbyHotspot = $this->hotspotService->isHotspot((float) $report->latitude, (float) $report->longitude);

        if ($nearbyHotspot) {
            $report->update([
                'status_id' => $this->resolveStatusId('verificado'),
                'is_verified' => true,
                'verified_at' => now(),
                'auto_approved' => true,
            ]);
            $this->hotspotService->promoteToHotspot($report, $nearbyHotspot);
        } else {
            $report->update(['status_id' => $this->resolveStatusId('pendiente')]);
        }

        return $report->fresh(['crimeType', 'category', 'status']);
    }

    private function resolveStatusId(string $slug): ?int
    {
        return Cache::remember('report_status_id:' . $slug, 86400, function () use ($slug) {
            return ReportStatus::where('slug', $slug)->value('id');
        });
    }

    public function update(int $id, array $data): Report
    {
        return $this->reportRepo->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->reportRepo->delete($id);
    }

    public function findById(int $id): ?Report
    {
        return $this->reportRepo->find($id);
    }

    public function getByUser(int $userId): Collection
    {
        return $this->reportRepo->findByUser($userId);
    }

    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->reportRepo->paginateByUser($userId, $perPage);
    }

    public function getNearby(float $lat, float $lng, float $radiusKm = 1, bool $onlyApproved = false): Collection
    {
        // Mismo criterio que MapService::getRiskZones: TTL corto, solo
        // amortigua polls repetidos sobre el mismo viewport. Se cachea el
        // array plano (no los modelos Eloquent: el driver "database"
        // rompe al deserializar objetos) y se rehidrata sin ir a la BD.
        $key = sprintf('reports:nearby:%s:%s:%s:%s', round($lat, 3), round($lng, 3), round($radiusKm, 2), $onlyApproved ? 1 : 0);

        $rows = Cache::remember($key, 900, function () use ($lat, $lng, $radiusKm, $onlyApproved) {
            return $this->reportRepo->findByLocation($lat, $lng, $radiusKm, $onlyApproved)->toArray();
        });

        return Report::hydrate($rows);
    }

    public function verify(int $id, int $verifiedBy): Report
    {
        $report = $this->reportRepo->verify($id, $verifiedBy);
        $report->update([
            'status_id' => $this->resolveStatusId('verificado'),
            'auto_approved' => false,
        ]);

        $nearbyHotspot = $this->hotspotService->isHotspot((float) $report->latitude, (float) $report->longitude);
        $this->hotspotService->promoteToHotspot($report, $nearbyHotspot);

        $report->user->notify(new ReportVerified($report->id));

        return $report->fresh(['crimeType', 'category', 'status']);
    }

    public function reject(int $id, int $reviewedBy): Report
    {
        $report = $this->reportRepo->reject($id, $reviewedBy);
        $report->update([
            'status_id' => $this->resolveStatusId('rechazado'),
            'auto_approved' => false,
        ]);

        return $report->fresh(['crimeType', 'category', 'status']);
    }

    public function attachMedia(Report $report, UploadedFile $file, string $type = 'image'): void
    {
        $this->mediaService->attach($report, $file, $type);
    }

    public function getStatistics(array $filters = []): array
    {
        return $this->reportRepo->getStatistics($filters);
    }

    public function getReportsByProvince(int $regionId): Collection
    {
        return $this->reportRepo->getReportsByProvince($regionId);
    }

    public function getReportsByDistrict(int $provinceId): Collection
    {
        return $this->reportRepo->getReportsByDistrict($provinceId);
    }
}
