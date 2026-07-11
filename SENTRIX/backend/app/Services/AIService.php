<?php

namespace App\Services;

use App\Helpers\GeoHelper;
use App\Models\AiPrediction;
use App\Models\Report;
use App\Models\RiskZone;
use App\Repositories\ReportRepository;
use App\Repositories\RiskZoneRepository;
use Illuminate\Support\Facades\DB;

class AIService
{
    private const CLUSTER_RADIUS_METERS = 300;
    private const MIN_CLUSTER_SIZE = 3;
    private const FORECAST_PERIODS = 7;
    private const TREND_SENSITIVITY = 0.3;

    public function __construct(
        private ReportRepository $reportRepo,
        private RiskZoneRepository $riskZoneRepo,
    ) {}

    public function classifyReport(Report $report): array
    {
        $cached = $this->getCached('classification', $report);
        if ($cached) return $cached;

        $features = $this->extractReportFeatures($report);
        $priority = $this->predictPriority($features);
        $isFalse = $this->detectAnomaly($report, $features);

        $result = [
            'priority'       => $priority,
            'is_suspicious'  => $isFalse,
            'confidence'     => $isFalse ? 0.6 : 0.85,
            'suggested_category' => $features['hour'] >= 19 || $features['hour'] <= 5 ? 'nocturno' : 'diurno',
            'features'       => $features,
        ];

        $this->cachePrediction('classification', $report, $result, 0.85, $features);
        return $result;
    }

    public function detectPatterns(array $reports): array
    {
        $patterns = [];

        $hourDist = $this->hourlyDistribution($reports);
        $dowDist = $this->dayOfWeekDistribution($reports);
        $clusters = $this->spatialClusters($reports);
        $trend = $this->analyzeTrend($reports);

        if ($hourDist) {
            $peakHour = array_search(max($hourDist), $hourDist);
            $patterns[] = [
                'type'        => 'hourly_peak',
                'label'       => "Pico a las {$peakHour}:00",
                'confidence'  => round($hourDist[$peakHour] / array_sum($hourDist), 2),
                'detail'      => "{$hourDist[$peakHour]} incidentes en la hora pico",
            ];
        }

        if ($dowDist) {
            $peakDay = array_search(max($dowDist), $dowDist);
            $days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            $patterns[] = [
                'type'       => 'day_peak',
                'label'      => "Pico los {$days[$peakDay]}",
                'confidence' => round($dowDist[$peakDay] / array_sum($dowDist), 2),
                'detail'     => "{$dowDist[$peakDay]} incidentes en día pico",
            ];
        }

        foreach ($clusters as $i => $cluster) {
            if ($cluster['count'] >= self::MIN_CLUSTER_SIZE) {
                $patterns[] = [
                    'type'       => 'hotspot',
                    'label'      => "Cluster {$i}: {$cluster['count']} incidentes",
                    'confidence' => round(min($cluster['count'] / 10, 1), 2),
                    'detail'     => "Radio ~" . round(self::CLUSTER_RADIUS_METERS) . "m",
                    'latitude'   => $cluster['lat'],
                    'longitude'  => $cluster['lng'],
                    'count'      => $cluster['count'],
                ];
            }
        }

        if ($trend) {
            $patterns[] = [
                'type'       => $trend['slope'] > 0 ? 'increasing' : 'decreasing',
                'label'      => $trend['slope'] > 0 ? 'Tendencia al alza' : 'Tendencia a la baja',
                'confidence' => round(abs($trend['slope']) / max(abs($trend['slope']), 0.1), 2),
                'detail'     => "Pendiente: " . round($trend['slope'], 4) . " reportes/día",
                'slope'      => round($trend['slope'], 4),
                'r2'         => round($trend['r2'], 3),
            ];
        }

        return ['patterns' => $patterns, 'total_patterns' => count($patterns)];
    }

    public function predictRiskScore(RiskZone $zone): array
    {
        $cached = $this->getCached('risk_forecast', $zone);
        if ($cached) return $cached;

        $history = $zone->riskHistory()
            ->orderBy('calculated_at')
            ->get()
            ->pluck('risk_score')
            ->toArray();

        if (count($history) < 2) {
            return [
                'current_score' => $zone->risk_score,
                'forecast'      => [],
                'trend'         => 'insufficient_data',
                'confidence'    => 0.3,
            ];
        }

        $forecast = $this->exponentialSmooth($history, 0.3, self::FORECAST_PERIODS);
        $slope = $this->linearSlope($history);
        $lastScore = end($history);
        $nextPredicted = end($forecast);

        $trend = match (true) {
            $slope > self::TREND_SENSITIVITY => 'increasing',
            $slope < -self::TREND_SENSITIVITY => 'decreasing',
            default => 'stable',
        };

        $daysUntilCritical = null;
        if ($trend === 'increasing' && $nextPredicted > $lastScore) {
            $dailyIncrease = ($nextPredicted - $lastScore);
            if ($dailyIncrease > 0) {
                $needed = 80 - $lastScore;
                $daysUntilCritical = ceil($needed / $dailyIncrease);
            }
        }

        $result = [
            'current_score'       => round($lastScore, 2),
            'previous_score'      => round($history[count($history) - 2] ?? $lastScore, 2),
            'forecast'            => array_map(fn($v) => round($v, 2), $forecast),
            'trend'               => $trend,
            'slope'               => round($slope, 4),
            'confidence'          => round(min(0.5 + count($history) * 0.01, 0.9), 2),
            'days_until_critical' => $daysUntilCritical,
            'will_be_critical'    => $daysUntilCritical !== null && $daysUntilCritical <= 30,
        ];

        $this->cachePrediction('risk_forecast', $zone, $result, $result['confidence']);
        return $result;
    }

    public function recommendSafeRoute(float $fromLat, float $fromLng, float $toLat, float $toLng): array
    {
        $zones = $this->riskZoneRepo->getActiveZones();
        if ($zones->isEmpty()) {
            return [
                'route' => [
                    ['lat' => $fromLat, 'lng' => $fromLng],
                    ['lat' => $toLat, 'lng' => $toLng],
                ],
                'total_distance' => round(GeoHelper::calculateDistance($fromLat, $fromLng, $toLat, $toLng), 0),
                'risk_score' => 0,
                'message' => 'Sin zonas de riesgo — ruta directa segura.',
            ];
        }

        $directDistance = GeoHelper::calculateDistance($fromLat, $fromLng, $toLat, $toLng);
        $directRisk = $this->calculateRouteRisk($fromLat, $fromLng, $toLat, $toLng, $zones);
        $bufferDistance = max($directDistance * 0.15, 200);

        if ($directRisk < 0.3) {
            return [
                'route' => [
                    ['lat' => $fromLat, 'lng' => $fromLng],
                    ['lat' => $toLat, 'lng' => $toLng],
                ],
                'total_distance' => round($directDistance, 0),
                'risk_score' => round($directRisk, 2),
                'message' => 'Ruta directa segura.',
            ];
        }

        $midLat = ($fromLat + $toLat) / 2;
        $midLng = ($fromLng + $toLng) / 2;
        $perpendiculars = [
            ['lat' => $midLat + 0.01, 'lng' => $midLng + 0.01],
            ['lat' => $midLat - 0.01, 'lng' => $midLng - 0.01],
            ['lat' => $midLat + 0.015, 'lng' => $midLng - 0.01],
            ['lat' => $midLat - 0.01, 'lng' => $midLng + 0.015],
        ];

        $bestRoute = null;
        $bestRisk = INF;

        foreach ($perpendiculars as $wp) {
            $routeRisk = $this->calculateRouteRisk($fromLat, $fromLng, $wp['lat'], $wp['lng'], $zones)
                + $this->calculateRouteRisk($wp['lat'], $wp['lng'], $toLat, $toLng, $zones);
            if ($routeRisk < $bestRisk) {
                $bestRisk = $routeRisk;
                $bestRoute = [
                    ['lat' => $fromLat, 'lng' => $fromLng],
                    $wp,
                    ['lat' => $toLat, 'lng' => $toLng],
                ];
            }
        }

        $detourDistance = 0;
        for ($i = 0; $i < count($bestRoute) - 1; $i++) {
            $detourDistance += GeoHelper::calculateDistance(
                $bestRoute[$i]['lat'], $bestRoute[$i]['lng'],
                $bestRoute[$i + 1]['lat'], $bestRoute[$i + 1]['lng']
            );
        }

        return [
            'route'          => $bestRoute,
            'total_distance' => round($detourDistance, 0),
            'risk_score'     => round($bestRisk, 2),
            'message'        => $bestRisk < $directRisk
                ? 'Ruta alternativa más segura encontrada.'
                : 'No se encontró ruta más segura.',
        ];
    }

    public function detectFalseReport(Report $report): array
    {
        $cached = $this->getCached('classification', $report);
        if ($cached && isset($cached['is_suspicious'])) {
            return [
                'is_false'   => $cached['is_suspicious'],
                'confidence' => $cached['confidence'],
                'reasons'    => $cached['reasons'] ?? [],
            ];
        }

        $features = $this->extractReportFeatures($report);
        $reasons = [];

        $descLen = strlen($report->description ?? '');
        if ($descLen < 10) {
            $reasons[] = 'Descripción demasiado corta';
        }
        if ($descLen > 5000) {
            $reasons[] = 'Descripción excesivamente larga';
        }

        $userReportCount = Report::where('user_id', $report->user_id)->count();
        if ($userReportCount > 20 && $report->incident_date?->isToday()) {
            $reasons[] = 'Usuario con múltiples reportes hoy';
        }

        $similarCount = Report::where('title', $report->title)
            ->where('latitude', $report->latitude)
            ->where('longitude', $report->longitude)
            ->where('created_at', '>=', now()->subDay())
            ->count();
        if ($similarCount > 3) {
            $reasons[] = 'Reporte duplicado detectado';
        }

        if ($features['hour'] >= 1 && $features['hour'] <= 4 && $userReportCount > 5) {
            $reasons[] = 'Reporte en horario nocturno sospechoso';
        }

        $isFalse = count($reasons) >= 2;
        $confidence = $isFalse ? min(0.5 + count($reasons) * 0.15, 0.9) : 0.1;

        return [
            'is_false'   => $isFalse,
            'confidence' => round($confidence, 2),
            'reasons'    => $reasons,
        ];
    }

    public function predictCriticalZones(): array
    {
        $zones = $this->riskZoneRepo->getActiveZones();
        $predictions = [];

        foreach ($zones as $zone) {
            $forecast = $this->predictRiskScore($zone);

            if ($forecast['will_be_critical']) {
                $predictions[] = [
                    'zone_id'             => $zone->id,
                    'zone_name'           => $zone->name,
                    'current_score'       => $forecast['current_score'],
                    'predicted_score'     => end($forecast['forecast']),
                    'days_until_critical' => $forecast['days_until_critical'],
                    'trend'               => $forecast['trend'],
                    'confidence'          => $forecast['confidence'],
                ];
            }
        }

        usort($predictions, fn($a, $b) => ($a['days_until_critical'] ?? 999) <=> ($b['days_until_critical'] ?? 999));

        return [
            'predictions'       => $predictions,
            'total_at_risk'     => count($predictions),
            'as_of'             => now()->toIso8601String(),
        ];
    }

    private function extractReportFeatures(Report $report): array
    {
        return [
            'hour'         => $report->incident_date?->hour ?? now()->hour,
            'day_of_week'  => $report->incident_date?->dayOfWeek ?? now()->dayOfWeek,
            'month'        => $report->incident_date?->month ?? now()->month,
            'is_weekend'   => in_array($report->incident_date?->dayOfWeek ?? 0, [0, 6]),
            'description_len' => strlen($report->description ?? ''),
            'has_coordinates' => $report->latitude && $report->longitude,
        ];
    }

    private function predictPriority(array $features): string
    {
        $score = 0;
        if ($features['hour'] >= 19 || $features['hour'] <= 5) $score += 2;
        if ($features['is_weekend']) $score += 1;
        if (!$features['has_coordinates']) $score += 1;

        return match (true) {
            $score >= 3 => 'alta',
            $score >= 2 => 'media',
            default     => 'baja',
        };
    }

    private function detectAnomaly(Report $report, array $features): bool
    {
        if ($features['description_len'] < 10) return true;
        if ($features['description_len'] > 5000) return true;

        $recentByUser = Report::where('user_id', $report->user_id)
            ->where('created_at', '>=', now()->subDay())
            ->count();
        if ($recentByUser > 10) return true;

        return false;
    }

    private function hourlyDistribution(array $reports): array
    {
        $dist = array_fill(0, 24, 0);
        foreach ($reports as $r) {
            $h = $r->incident_date?->hour;
            if ($h !== null) $dist[$h]++;
        }
        return $dist;
    }

    private function dayOfWeekDistribution(array $reports): array
    {
        $dist = array_fill(0, 7, 0);
        foreach ($reports as $r) {
            $d = $r->incident_date?->dayOfWeek;
            if ($d !== null) $dist[$d]++;
        }
        return $dist;
    }

    private function spatialClusters(array $reports): array
    {
        $assigned = [];
        $clusters = [];

        foreach ($reports as $i => $a) {
            if (in_array($i, $assigned)) continue;
            $cluster = ['lat' => (float) $a->latitude, 'lng' => (float) $a->longitude, 'count' => 1, 'members' => [$i]];

            foreach ($reports as $j => $b) {
                if ($i === $j || in_array($j, $assigned)) continue;
                $dist = GeoHelper::calculateDistance(
                    (float) $a->latitude, (float) $a->longitude,
                    (float) $b->latitude, (float) $b->longitude
                );
                if ($dist <= self::CLUSTER_RADIUS_METERS) {
                    $cluster['lat'] += (float) $b->latitude;
                    $cluster['lng'] += (float) $b->longitude;
                    $cluster['count']++;
                    $cluster['members'][] = $j;
                    $assigned[] = $j;
                }
            }

            if ($cluster['count'] > 1) {
                $cluster['lat'] /= $cluster['count'];
                $cluster['lng'] /= $cluster['count'];
                $clusters[] = $cluster;
            }
            $assigned[] = $i;
        }

        return $clusters;
    }

    private function analyzeTrend(array $reports): ?array
    {
        $daily = $reports->groupBy(fn($r) => $r->incident_date?->format('Y-m-d'))
            ->map(fn($g) => $g->count())
            ->toArray();

        if (count($daily) < 3) return null;

        $days = array_keys($daily);
        $values = array_values($daily);
        $n = count($values);
        $xMean = ($n - 1) / 2;
        $yMean = array_sum($values) / $n;

        $num = 0;
        $den = 0;
        foreach ($values as $i => $y) {
            $num += ($i - $xMean) * ($y - $yMean);
            $den += ($i - $xMean) ** 2;
        }

        $slope = $den > 0 ? $num / $den : 0;
        $intercept = $yMean - $slope * $xMean;

        $ssRes = 0;
        $ssTot = 0;
        foreach ($values as $i => $y) {
            $yPred = $intercept + $slope * $i;
            $ssRes += ($y - $yPred) ** 2;
            $ssTot += ($y - $yMean) ** 2;
        }
        $r2 = $ssTot > 0 ? 1 - ($ssRes / $ssTot) : 0;

        return ['slope' => $slope, 'intercept' => $intercept, 'r2' => $r2];
    }

    private function exponentialSmooth(array $data, float $alpha, int $periods): array
    {
        $smoothed = [$data[0]];
        for ($i = 1; $i < count($data); $i++) {
            $smoothed[] = $alpha * $data[$i] + (1 - $alpha) * $smoothed[$i - 1];
        }

        $lastSmoothed = end($smoothed);
        $avgChange = 0;
        $changes = count($data) > 1 ? count($data) - 1 : 1;
        for ($i = 1; $i < count($smoothed); $i++) {
            $avgChange += ($smoothed[$i] - $smoothed[$i - 1]) / $changes;
        }

        $forecast = [];
        for ($i = 1; $i <= $periods; $i++) {
            $lastSmoothed += $avgChange;
            $forecast[] = max(0, min(100, $lastSmoothed));
        }

        return $forecast;
    }

    private function linearSlope(array $values): float
    {
        $n = count($values);
        if ($n < 2) return 0;
        $xMean = ($n - 1) / 2;
        $yMean = array_sum($values) / $n;
        $num = 0;
        $den = 0;
        foreach ($values as $i => $y) {
            $num += ($i - $xMean) * ($y - $yMean);
            $den += ($i - $xMean) ** 2;
        }
        return $den > 0 ? $num / $den : 0;
    }

    private function calculateRouteRisk(float $fromLat, float $fromLng, float $toLat, float $toLng, $zones): float
    {
        $midLat = ($fromLat + $toLat) / 2;
        $midLng = ($fromLng + $toLng) / 2;
        $totalRisk = 0;

        foreach ($zones as $zone) {
            $dist = GeoHelper::calculateDistance($midLat, $midLng, (float) $zone->latitude, (float) $zone->longitude);
            $effectiveRadius = ($zone->radius_meters ?? 500) * $this->getRiskMultiplier($zone);
            if ($dist <= $effectiveRadius * 2) {
                $totalRisk += ($zone->risk_score / 100) * (1 - $dist / ($effectiveRadius * 2));
            }
        }

        return min($totalRisk, 1);
    }

    private function getRiskMultiplier($zone): float
    {
        $level = $zone->riskLevel?->slug ?? 'medio';
        return match ($level) {
            'critico' => 2.5, 'alto' => 2.0, 'medio' => 1.5,
            'bajo' => 1.0, default => 0.8,
        };
    }

    private function getCached(string $type, $entity): ?array
    {
        $prediction = AiPrediction::where('type', $type)
            ->where('predictable_type', get_class($entity))
            ->where('predictable_id', $entity->id)
            ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->first();

        return $prediction?->prediction;
    }

    private function cachePrediction(string $type, $entity, array $prediction, float $confidence, ?array $features = null): void
    {
        AiPrediction::updateOrCreate(
            [
                'type'             => $type,
                'predictable_type' => get_class($entity),
                'predictable_id'   => $entity->id,
            ],
            [
                'prediction' => $prediction,
                'confidence' => $confidence,
                'features'   => $features,
                'expires_at' => now()->addHours(6),
            ]
        );
    }
}
