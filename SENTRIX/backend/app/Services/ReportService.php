<?php

namespace App\Services;

use App\Interfaces\ReportRepositoryInterface;
use App\Interfaces\RiskZoneRepositoryInterface;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class ReportService
{
    public function __construct(
        private ReportRepositoryInterface $reportRepo,
        private RiskZoneRepositoryInterface $riskZoneRepo,
        private MediaService $mediaService,
    ) {}

    public function create(array $data, User $user): Report
    {
        $data['user_id'] = $user->id;
        $data['description'] = $data['description'] ?? 'Sin descripcion';
        $data['title'] = $data['title'] ?? 'Reporte';
        $report = $this->reportRepo->create($data);
        $this->riskZoneRepo->findByLocation($data['latitude'], $data['longitude'], 0.5);
        return $report->load(['crimeType', 'category', 'status']);
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

    public function getNearby(float $lat, float $lng, float $radiusKm = 1): Collection
    {
        return $this->reportRepo->findByLocation($lat, $lng, $radiusKm);
    }

    public function verify(int $id, int $verifiedBy): Report
    {
        return $this->reportRepo->verify($id, $verifiedBy);
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
