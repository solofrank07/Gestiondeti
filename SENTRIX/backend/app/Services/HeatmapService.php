<?php

namespace App\Services;

use App\Helpers\GeoHelper;
use App\Interfaces\HeatmapCacheRepositoryInterface;
use App\Interfaces\RiskZoneRepositoryInterface;
use App\Models\HeatmapCache;
use App\Models\RiskHistory;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class HeatmapService
{
    private const ZOOM_GRID_SIZES = [
        1  => 4,   2  => 6,   3  => 8,   4  => 10,
        5  => 14,  6  => 18,  7  => 24,  8  => 32,
        9  => 44,  10 => 60,  11 => 80,  12 => 110,
        13 => 150, 14 => 200, 15 => 270, 16 => 360,
        17 => 480, 18 => 640, 19 => 850, 20 => 1100,
    ];

    private const ZOOM_BANDWIDTH_KM = [
        1  => 100, 2  => 80,  3  => 60,  4  => 45,
        5  => 30,  6  => 20,  7  => 14,  8  => 10,
        9  => 7,   10 => 5,   11 => 3.5, 12 => 2.5,
        13 => 1.8, 14 => 1.3, 15 => 0.9, 16 => 0.6,
        17 => 0.4, 18 => 0.3, 19 => 0.2, 20 => 0.15,
    ];

    private const CACHE_TTL_MINUTES = 15;

    public function __construct(
        private RiskZoneRepositoryInterface $riskZoneRepo,
        private HeatmapCacheRepositoryInterface $cacheRepo,
        private RiskScoreService $riskScoreService,
    ) {}

    public function getHeatmapData(
        float $north, float $south, float $east, float $west,
        int $zoom, ?string $filtersHash = null
    ): array {
        $hash = $this->buildHash($north, $south, $east, $west, $zoom, $filtersHash);
        $cached = $this->cacheRepo->findByBounds($north, $south, $east, $west, $zoom);
        if ($cached) {
            $this->cacheRepo->recordHit($cached);
            return $cached->data;
        }

        $grid = $this->computeKdeGrid($north, $south, $east, $west, $zoom);

        $this->cacheRepo->create([
            'hash' => $hash,
            'north' => $north,
            'south' => $south,
            'east' => $east,
            'west' => $west,
            'zoom_level' => $zoom,
            'data' => $grid,
            'grid_config' => [
                'grid_size' => self::ZOOM_GRID_SIZES[$zoom] ?? 60,
                'bandwidth_km' => self::ZOOM_BANDWIDTH_KM[$zoom] ?? 5,
            ],
            'point_count' => count($grid),
            'expires_at' => now()->addMinutes(self::CACHE_TTL_MINUTES),
        ]);

        return $grid;
    }

    public function getHeatmapByTile(int $zoom, int $x, int $y, ?string $filtersHash = null): array
    {
        $cached = $this->cacheRepo->findByTile($zoom, $x, $y, $filtersHash);
        if ($cached) {
            $this->cacheRepo->recordHit($cached);
            return $cached->data;
        }

        [$north, $south, $east, $west] = $this->tileToBounds($zoom, $x, $y);
        $grid = $this->computeKdeGrid($north, $south, $east, $west, $zoom);

        $this->cacheRepo->create([
            'hash' => md5("tile_{$zoom}_{$x}_{$y}_" . ($filtersHash ?? '')),
            'north' => $north,
            'south' => $south,
            'east' => $east,
            'west' => $west,
            'zoom_level' => $zoom,
            'tile_x' => $x,
            'tile_y' => $y,
            'filters_hash' => $filtersHash,
            'data' => $grid,
            'grid_config' => [
                'grid_size' => self::ZOOM_GRID_SIZES[$zoom] ?? 60,
                'bandwidth_km' => self::ZOOM_BANDWIDTH_KM[$zoom] ?? 5,
            ],
            'point_count' => count($grid),
            'expires_at' => now()->addMinutes(self::CACHE_TTL_MINUTES),
        ]);

        return $grid;
    }

    public function computeKdeGrid(
        float $north, float $south, float $east, float $west, int $zoom
    ): array {
        $gridSize = self::ZOOM_GRID_SIZES[$zoom] ?? 60;
        $bandwidthKm = self::ZOOM_BANDWIDTH_KM[$zoom] ?? 5;
        $bandwidthMeters = $bandwidthKm * 1000;

        $latStep = ($north - $south) / $gridSize;
        $lngStep = ($east - $west) / $gridSize;

        $zones = $this->riskZoneRepo->getZonesInBounds($north, $south, $east, $west);
        $zoneData = $zones->map(fn($z) => [
            'lat' => (float) $z->latitude,
            'lng' => (float) $z->longitude,
            'weight' => $z->risk_score / 100,
        ])->toArray();

        if (empty($zoneData)) {
            return [];
        }

        $grid = [];
        $maxDensity = 0;

        for ($i = 0; $i < $gridSize; $i++) {
            for ($j = 0; $j < $gridSize; $j++) {
                $cellLat = $south + ($i + 0.5) * $latStep;
                $cellLng = $west + ($j + 0.5) * $lngStep;

                $density = 0;
                foreach ($zoneData as $zone) {
                    $dist = GeoHelper::calculateDistance($cellLat, $cellLng, $zone['lat'], $zone['lng']);
                    if ($dist <= $bandwidthMeters * 3) {
                        $kernel = exp(-0.5 * ($dist / $bandwidthMeters) ** 2);
                        $density += $zone['weight'] * $kernel;
                    }
                }

                if ($density > 0) {
                    $scaledScore = round($density * 100, 2);
                    $grid[] = [
                        'lat' => round($cellLat, 6),
                        'lng' => round($cellLng, 6),
                        'score' => min($scaledScore, 100),
                        'level' => \App\Enums\RiskLevel::fromScore((int) $scaledScore)->value,
                        'weight' => round($scaledScore / 100, 4),
                    ];
                    if ($scaledScore > $maxDensity) {
                        $maxDensity = $scaledScore;
                    }
                }
            }
        }

        if ($maxDensity > 0 && $maxDensity < 100) {
            $scale = 100 / $maxDensity;
            foreach ($grid as &$point) {
                $point['score'] = round(min($point['score'] * $scale, 100), 2);
                $point['weight'] = round($point['score'] / 100, 4);
            }
        }

        return $grid;
    }

    public function recalculateAll(): void
    {
        $zones = $this->riskZoneRepo->getActiveZones();
        foreach ($zones as $zone) {
            $score = $this->riskScoreService->calculate($zone);
            $level = \App\Enums\RiskLevel::fromScore((int) $score);
            $levelModel = \App\Models\RiskLevel::where('slug', $level->value)->first();
            if ($levelModel) {
                $this->riskZoneRepo->updateScore($zone->id, $score, $levelModel->id);
                RiskHistory::create([
                    'risk_zone_id' => $zone->id,
                    'risk_score' => $score,
                    'risk_level_id' => $levelModel->id,
                    'crime_count' => $zone->crime_count ?? 0,
                    'reports_count' => ($zone->citizen_reports_count ?? 0) + ($zone->official_reports_count ?? 0),
                    'calculated_at' => now(),
                ]);
            }
        }
        $this->cacheRepo->clearExpired();

        // Clear dashboard cache
        app(DashboardService::class)->clearCache();
        // Clear heatmap tile cache
        Cache::forget('heatmap:tiles:*');
    }

    public function invalidateCacheForZone(float $lat, float $lng, float $radiusMeters): int
    {
        return $this->cacheRepo->clearByZoneBounds($lat, $lng, $radiusMeters / 1000);
    }

    public function prewarmPopularTiles(int $regionId = 1): void
    {
        $regions = config('sentrix.heatmap.prewarm_regions', []);

        // Use regionId to select region, default to first available
        $regionKey = array_keys($regions)[$regionId - 1] ?? null;
        if (!$regionKey || !isset($regions[$regionKey])) {
            Log::warning("No prewarm config for region ID {$regionId}");
            return;
        }

        $region = $regions[$regionKey];
        $popularZooms = $region['zooms'] ?? [10, 12, 14];

        foreach ($popularZooms as $zoom) {
            $range = $region['tiles'][$zoom] ?? null;
            if (!$range) continue;
            for ($x = $range['x'][0]; $x <= $range['x'][1]; $x++) {
                for ($y = $range['y'][0]; $y <= $range['y'][1]; $y++) {
                    try {
                        $this->getHeatmapByTile($zoom, $x, $y);
                    } catch (\Throwable $e) {
                        Log::warning("Failed to prewarm tile {$zoom}/{$x}/{$y}: {$e->getMessage()}");
                    }
                }
            }
        }
    }

    private function tileToBounds(int $zoom, int $x, int $y): array
    {
        $n = 2 ** $zoom;
        $lon1 = $x / $n * 360 - 180;
        $lon2 = ($x + 1) / $n * 360 - 180;
        $lat1 = rad2deg(atan(sinh(pi() * (1 - 2 * $y / $n))));
        $lat2 = rad2deg(atan(sinh(pi() * (1 - 2 * ($y + 1) / $n))));
        return [max($lat1, $lat2), min($lat1, $lat2), max($lon1, $lon2), min($lon1, $lon2)];
    }

    private function buildHash(float $north, float $south, float $east, float $west, int $zoom, ?string $filtersHash = null): string
    {
        $parts = [$north, $south, $east, $west, $zoom];
        if ($filtersHash) {
            $parts[] = $filtersHash;
        }
        return md5(implode('_', $parts));
    }
}
