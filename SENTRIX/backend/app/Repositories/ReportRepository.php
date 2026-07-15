<?php

namespace App\Repositories;

use App\Interfaces\ReportRepositoryInterface;
use App\Models\Report;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ReportRepository extends BaseRepository implements ReportRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Report());
    }

    public function findByUser(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->latest()->get();
    }

    public function findByDateRange(string $start, string $end): Collection
    {
        return $this->model->whereBetween('incident_date', [$start, $end])->get();
    }

    public function findByLocation(float $lat, float $lng, float $radiusKm, bool $onlyApproved = false): Collection
    {
        $latDelta = $radiusKm / 111;
        $lngDelta = $radiusKm / (111 * cos(deg2rad($lat)));
        $query = $this->model
            ->whereBetween('latitude', [$lat - $latDelta, $lat + $latDelta])
            ->whereBetween('longitude', [$lng - $lngDelta, $lng + $lngDelta]);

        if ($onlyApproved) {
            $query->where('is_verified', true);
        }

        return $query->get();
    }

    public function getPendingVerification(): Collection
    {
        return $this->model->where('is_verified', false)->latest()->get();
    }

    public function getByPriority(string $priority): Collection
    {
        return $this->model->where('priority', $priority)->latest()->get();
    }

    public function getStatistics(array $filters = []): array
    {
        $query = $this->buildFilteredQuery($filters);

        return [
            'total' => (clone $query)->count(),
            'by_priority' => (clone $query)->selectRaw('priority, count(*) as total')->groupBy('priority')->pluck('total', 'priority')->toArray(),
            'by_status' => (clone $query)->selectRaw('status_id, count(*) as total')->groupBy('status_id')->pluck('total', 'status_id')->toArray(),
            'by_crime_type' => (clone $query)->selectRaw('crime_type_id, count(*) as total')->groupBy('crime_type_id')->pluck('total', 'crime_type_id')->toArray(),
            'verified' => (clone $query)->where('is_verified', true)->count(),
            'pending' => (clone $query)->where('is_verified', false)->count(),
        ];
    }

    public function getCrimeTypeDistribution(array $filters = []): array
    {
        $query = $this->buildFilteredQuery($filters);
        return $query
            ->selectRaw('crime_types.name, crime_types.slug, count(*) as total')
            ->join('crime_types', 'reports.crime_type_id', '=', 'crime_types.id')
            ->groupBy('crime_types.name', 'crime_types.slug')
            ->orderByDesc('total')
            ->get()
            ->toArray();
    }

    public function getReportsByPeriod(string $period, ?string $from = null, ?string $to = null): array
    {
        $query = $this->model->query();
        if ($from) $query->whereDate('incident_date', '>=', $from);
        if ($to) $query->whereDate('incident_date', '<=', $to);

        $format = match ($period) {
            'week'   => 'IYYY-IW',
            'month'  => 'YYYY-MM',
            'year'   => 'YYYY',
            default  => 'YYYY-MM-DD',
        };

        return $query
            ->selectRaw("TO_CHAR(incident_date, '{$format}') as period, count(*) as total")
            ->whereNotNull('incident_date')
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->toArray();
    }

    public function getReportsByProvince(int $regionId): Collection
    {
        return $this->model
            ->selectRaw('provinces.name, count(*) as total')
            ->join('users', 'reports.user_id', '=', 'users.id')
            ->join('provinces', 'users.province_id', '=', 'provinces.id')
            ->where('provinces.region_id', $regionId)
            ->groupBy('provinces.name')
            ->get();
    }

    public function getReportsByDistrict(int $provinceId): Collection
    {
        return $this->model
            ->selectRaw('districts.name, count(*) as total')
            ->join('users', 'reports.user_id', '=', 'users.id')
            ->join('districts', 'users.district_id', '=', 'districts.id')
            ->where('districts.province_id', $provinceId)
            ->groupBy('districts.name')
            ->get();
    }

    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->where('user_id', $userId)->latest()->paginate($perPage);
    }

    public function verify(int $id, int $verifiedBy): Report
    {
        $report = $this->findOrFail($id);
        $report->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => $verifiedBy,
        ]);
        return $report->fresh();
    }

    public function findAllAdmin(?string $status = null, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->with(['crimeType', 'category', 'status', 'user']);

        if ($status === 'pending') {
            $query->where('is_verified', false)
                ->where(fn($q) => $q->whereDoesntHave('status')
                    ->orWhereHas('status', fn($s) => $s->where('slug', '!=', 'rechazado')));
        } elseif ($status === 'verified') {
            $query->where('is_verified', true);
        } elseif ($status === 'rejected') {
            $query->whereHas('status', fn($q) => $q->where('slug', 'rechazado'));
        }

        return $query->latest()->paginate($perPage);
    }

    public function reject(int $id, int $reviewedBy): Report
    {
        $report = $this->findOrFail($id);
        $report->update([
            'rejected_at' => now(),
            'verified_by' => $reviewedBy,
        ]);
        return $report->fresh();
    }

    private function buildFilteredQuery(array $filters): \Illuminate\Database\Eloquent\Builder
    {
        $query = $this->model->query();
        if (!empty($filters['from'])) $query->whereDate('incident_date', '>=', $filters['from']);
        if (!empty($filters['to'])) $query->whereDate('incident_date', '<=', $filters['to']);
        if (!empty($filters['province_id'])) $query->whereHas('user', fn($q) => $q->where('province_id', $filters['province_id']));
        if (!empty($filters['district_id'])) $query->whereHas('user', fn($q) => $q->where('district_id', $filters['district_id']));
        return $query;
    }
}
