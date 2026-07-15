<?php

namespace App\Interfaces;

use App\Models\Report;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ReportRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUser(int $userId): Collection;
    public function findByDateRange(string $start, string $end): Collection;
    public function findByLocation(float $lat, float $lng, float $radiusKm, bool $onlyApproved = false): Collection;
    public function getPendingVerification(): Collection;
    public function getByPriority(string $priority): Collection;
    public function getStatistics(array $filters = []): array;
    public function getCrimeTypeDistribution(array $filters = []): array;
    public function getReportsByPeriod(string $period, ?string $from = null, ?string $to = null): array;
    public function getReportsByProvince(int $regionId): Collection;
    public function getReportsByDistrict(int $provinceId): Collection;
    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator;
    public function verify(int $id, int $verifiedBy): Report;
    public function reject(int $id, int $reviewedBy): Report;
}
