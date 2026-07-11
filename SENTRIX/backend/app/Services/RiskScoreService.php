<?php

namespace App\Services;

use App\Enums\RiskLevel;
use App\Helpers\GeoHelper;
use App\Interfaces\ReportRepositoryInterface;
use App\Interfaces\RiskZoneRepositoryInterface;
use App\Models\RiskZone;

class RiskScoreService
{
    private const WEIGHT_CRIME_COUNT = 0.15;
    private const WEIGHT_SEVERITY = 0.20;
    private const WEIGHT_RECURRENCE = 0.15;
    private const WEIGHT_TIME = 0.10;
    private const WEIGHT_TREND = 0.10;
    private const WEIGHT_DENSITY = 0.05;
    private const WEIGHT_CITIZEN_REPORTS = 0.15;
    private const WEIGHT_PROXIMITY = 0.05;
    private const WEIGHT_POPULATION = 0.05;

    public function __construct(
        private ReportRepositoryInterface $reportRepo,
        private RiskZoneRepositoryInterface $riskZoneRepo,
    ) {}

    public function calculate(RiskZone $zone): float
    {
        $reports = $this->reportRepo->findByLocation(
            $zone->latitude,
            $zone->longitude,
            $zone->radius_meters / 1000
        );

        $score = 0;
        $score += $this->calculateCrimeCountScore($reports->count()) * self::WEIGHT_CRIME_COUNT;
        $score += $this->calculateSeverityScore($reports) * self::WEIGHT_SEVERITY;
        $score += $this->calculateRecurrenceScore($reports) * self::WEIGHT_RECURRENCE;
        $score += $this->calculateTimeScore($reports) * self::WEIGHT_TIME;
        $score += $this->calculateTrendScore($zone) * self::WEIGHT_TREND;
        $score += $this->calculateDensityScore($reports) * self::WEIGHT_DENSITY;
        $score += $this->calculateCitizenReportScore($zone) * self::WEIGHT_CITIZEN_REPORTS;
        $score += $this->calculateProximityScore($zone) * self::WEIGHT_PROXIMITY;
        $score += $this->calculatePopulationScore($zone) * self::WEIGHT_POPULATION;

        return round(min($score * 100, 100), 2);
    }

    private function calculateCrimeCountScore(int $count): float
    {
        return match (true) {
            $count >= 100 => 1.0,
            $count >= 50  => 0.8,
            $count >= 20  => 0.6,
            $count >= 10  => 0.4,
            $count >= 5   => 0.2,
            $count >= 1   => 0.1,
            default       => 0.0,
        };
    }

    private function calculateSeverityScore($reports): float
    {
        $totalWeight = $reports->sum(fn($r) => $r->crimeType?->severity_weight ?? 5);
        $count = max($reports->count(), 1);
        $avg = $totalWeight / $count;
        return $avg / 10;
    }

    private function calculateRecurrenceScore($reports): float
    {
        if ($reports->count() < 2) return 0.1;

        $grouped = $reports->groupBy(fn($r) => $r->incident_date?->format('Y-m-d'));
        $days = max($grouped->count(), 1);
        $avgPerDay = $reports->count() / $days;

        $recurrenceBonus = 0;
        if ($avgPerDay >= 1) {
            $recurrenceBonus = min(($avgPerDay - 1) / 5, 0.3);
        }

        return min($avgPerDay / 10 + $recurrenceBonus, 1);
    }

    private function calculateTimeScore($reports): float
    {
        $nightCount = $reports->filter(fn($r) => $r->incident_date && (
            $r->incident_date->hour >= 19 || $r->incident_date->hour <= 5
        ))->count();
        $total = max($reports->count(), 1);
        return $nightCount / $total;
    }

    private function calculateTrendScore(RiskZone $zone): float
    {
        $history = $zone->riskHistory()->latest()->take(30)->get();
        if ($history->count() < 2) return 0.5;

        $recent = $history->take(7)->avg('risk_score') ?? 0;
        $older = $history->skip(7)->take(23)->avg('risk_score') ?? 0;

        if ($older == 0) return $recent > 0 ? 0.6 : 0.5;

        $trend = ($recent - $older) / $older;
        return max(0, min(1, 0.5 + $trend));
    }

    private function calculateDensityScore($reports): float
    {
        $total = $reports->count();
        return match (true) {
            $total >= 200 => 1.0,
            $total >= 100 => 0.8,
            $total >= 50  => 0.6,
            $total >= 20  => 0.4,
            $total >= 10  => 0.2,
            default       => 0.0,
        };
    }

    private function calculateCitizenReportScore(RiskZone $zone): float
    {
        $count = $zone->citizen_reports_count;
        return match (true) {
            $count >= 50  => 1.0,
            $count >= 20  => 0.8,
            $count >= 10  => 0.6,
            $count >= 5   => 0.4,
            $count >= 1   => 0.2,
            default       => 0.0,
        };
    }

    private function calculateProximityScore(RiskZone $zone): float
    {
        $criticalLocations = config('sentrix.critical_locations', []);

        if (empty($criticalLocations)) return 0.5;

        $closest = null;
        foreach ($criticalLocations as $loc) {
            $dist = GeoHelper::calculateDistance(
                $zone->latitude, $zone->longitude,
                $loc['lat'], $loc['lng']
            );
            if ($closest === null || $dist < $closest) {
                $closest = $dist;
            }
        }

        if ($closest === null) return 0.5;

        return match (true) {
            $closest <= 100   => 1.0,
            $closest <= 300   => 0.8,
            $closest <= 500   => 0.6,
            $closest <= 1000  => 0.4,
            $closest <= 2000  => 0.2,
            default           => 0.0,
        };
    }

    private function calculatePopulationScore(RiskZone $zone): float
    {
        $area = $zone->area_km2 ?? 0.01;
        $populationDensity = ($zone->population ?? 0) / $area;

        return match (true) {
            $populationDensity >= 10000 => 1.0,
            $populationDensity >= 5000  => 0.8,
            $populationDensity >= 2000  => 0.6,
            $populationDensity >= 1000  => 0.4,
            $populationDensity >= 500   => 0.2,
            default                    => 0.0,
        };
    }
}
