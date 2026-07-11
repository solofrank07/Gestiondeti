<?php

namespace App\Services;

use App\Interfaces\ReportRepositoryInterface;
use App\Interfaces\RiskZoneRepositoryInterface;

class DashboardService
{
    public function __construct(
        private ReportRepositoryInterface $reportRepo,
        private RiskZoneRepositoryInterface $riskZoneRepo,
    ) {}

    public function getSummary(): array
    {
        $stats = $this->reportRepo->getStatistics();
        $criticalZones = $this->riskZoneRepo->getCriticalZones(5);

        $total = $stats['total'] ?? 0;
        $verified = $stats['verified'] ?? 0;
        $pending = $stats['pending'] ?? 0;
        $verificationRate = $total > 0 ? round(($verified / $total) * 100, 1) : 0;

        return [
            'total_reports'       => $total,
            'verified_reports'    => $verified,
            'pending_reports'     => $pending,
            'verification_rate'   => $verificationRate,
            'critical_zones_count'=> $criticalZones->count(),
            'active_zones_count'  => $this->riskZoneRepo->getActiveZones()->count(),
            'critical_zones'      => $criticalZones->map(fn($z) => [
                'id'         => $z->id,
                'name'       => $z->name,
                'risk_score' => $z->risk_score,
                'level'      => $z->riskLevel?->name,
                'latitude'   => (float) $z->latitude,
                'longitude'  => (float) $z->longitude,
            ]),
        ];
    }

    public function getStatistics(array $filters = []): array
    {
        return $this->reportRepo->getStatistics($filters);
    }

    public function getCrimeTypeDistribution(array $filters = []): array
    {
        return $this->reportRepo->getCrimeTypeDistribution($filters);
    }

    public function getReportsByPeriod(string $period = 'day', ?string $from = null, ?string $to = null): array
    {
        return $this->reportRepo->getReportsByPeriod($period, $from, $to);
    }

    public function getZoneStatistics(): array
    {
        $total = $this->riskZoneRepo->getActiveZones();
        $zones = $this->riskZoneRepo->getCriticalZones(999);

        $byLevel = $total->groupBy(fn($z) => $z->riskLevel?->slug ?? 'unknown')
            ->map(fn($group, $level) => [
                'level' => $level,
                'count' => $group->count(),
                'avg_score' => round($group->avg('risk_score'), 2),
            ])->values()->toArray();

        $avgScore = $total->avg('risk_score');
        $maxScore = $total->max('risk_score');

        return [
            'total_zones'    => $total->count(),
            'avg_risk_score' => round($avgScore, 2),
            'max_risk_score' => round($maxScore, 2),
            'by_level'       => $byLevel,
        ];
    }

    public function getFullDashboard(array $filters = []): array
    {
        $period = $filters['period'] ?? 'day';
        $from = $filters['from'] ?? now()->subDays(30)->toDateString();
        $to = $filters['to'] ?? now()->toDateString();
        $filtersForStats = array_filter([
            'from' => $from,
            'to' => $to,
            'province_id' => $filters['province_id'] ?? null,
            'district_id' => $filters['district_id'] ?? null,
        ]);

        return [
            'summary'       => $this->getSummary(),
            'statistics'    => $this->getStatistics($filtersForStats),
            'evolution'     => $this->getReportsByPeriod($period, $from, $to),
            'crime_types'   => $this->getCrimeTypeDistribution($filtersForStats),
            'zone_stats'    => $this->getZoneStatistics(),
            'provinces'     => $this->getReportsByProvince(1),
        ];
    }

    public function getReportsByProvince(int $regionId): array
    {
        return $this->reportRepo->getReportsByProvince($regionId)->toArray();
    }

    public function getReportsByDistrict(int $provinceId): array
    {
        return $this->reportRepo->getReportsByDistrict($provinceId)->toArray();
    }

    public function getEvolution(int $days = 30): array
    {
        $start = now()->subDays($days);
        $reports = $this->reportRepo->findByDateRange($start->toDateString(), now()->toDateString());
        return $reports->groupBy(fn($r) => $r->incident_date?->format('Y-m-d'))
            ->map(fn($group, $date) => ['date' => $date, 'count' => $group->count()])
            ->values()
            ->toArray();
    }
}
