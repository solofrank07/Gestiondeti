<?php

namespace App\Services;

use App\Interfaces\RiskZoneRepositoryInterface;
use App\Interfaces\RegionRepositoryInterface;

class MapService
{
    private const CACHE_DIR = 'cache';
    private const ZONES_FILE = 'risk-zones.json';
    private const VERSION_FILE = 'risk-zones-version.txt';

    public function __construct(
        private RiskZoneRepositoryInterface $riskZoneRepo,
        private RegionRepositoryInterface $regionRepo,
    ) {}

    // ── Cache version ──────────────────────────────────────────

    public static function getRiskZonesCacheVersion(): int
    {
        $path = self::versionPath();
        if (!file_exists($path)) {
            $tmp = $path . '.tmp.' . getmypid();
            @file_put_contents($tmp, '0');
            @rename($tmp, $path);
            return 0;
        }
        return (int) file_get_contents($path);
    }

    public static function bumpRiskZonesCacheVersion(): void
    {
        $v = self::getRiskZonesCacheVersion() + 1;
        $tmp = self::versionPath() . '.tmp.' . getmypid();
        @file_put_contents($tmp, (string) $v);
        @rename($tmp, self::versionPath());
        // Rebuild JSON file so next request serves fresh data
        self::buildJsonCache();
    }

    // ── JSON file build ────────────────────────────────────────

    public static function buildJsonCache(): void
    {
        $repo = app(RiskZoneRepositoryInterface::class);
        $zones = $repo->getActiveZonesWithPolygons();
        $data = $zones->map(fn($z) => [
            'id' => $z->id,
            'name' => $z->name,
            'risk_score' => (float) $z->risk_score,
            'risk_level' => $z->riskLevel?->slug,
            'color' => $z->riskLevel?->color,
            'latitude' => (float) $z->latitude,
            'longitude' => (float) $z->longitude,
            'radius' => (float) $z->radius_meters,
            'polygons' => $z->polygons->map(fn($p) => [
                'points' => $p->points->map(fn($pt) => [
                    'lat' => (float) $pt->latitude,
                    'lng' => (float) $pt->longitude,
                ])->all(),
                'fill_color' => $p->fill_color,
                'fill_opacity' => $p->fill_opacity,
                'stroke_width' => $p->stroke_width,
            ])->all(),
        ])->all();

        $dir = self::cacheDir();
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        // Write to temp + rename → atomic on ext4/xfs, previene lecturas parciales
        $tmp = self::zonesPath() . '.tmp.' . getmypid();
        @file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE));
        @rename($tmp, self::zonesPath());
    }

    // ── Read from JSON ─────────────────────────────────────────

    public function getRiskZones(float $north, float $south, float $east, float $west): array
    {
        $path = self::zonesPath();
        if (!file_exists($path)) {
            self::buildJsonCache();
        }

        $all = json_decode(file_get_contents($path), true) ?? [];

        return array_values(array_filter($all, fn($z) =>
            $z['latitude'] >= $south && $z['latitude'] <= $north &&
            $z['longitude'] >= $west && $z['longitude'] <= $east
        ));
    }

    public function getClusters(float $north, float $south, float $east, float $west, int $zoom): array
    {
        $path = self::zonesPath();
        if (!file_exists($path)) {
            self::buildJsonCache();
        }
        $all = json_decode(file_get_contents($path), true) ?? [];

        // Filter by bounds
        $filtered = array_filter($all, fn($z) =>
            $z['latitude'] >= $south && $z['latitude'] <= $north &&
            $z['longitude'] >= $west && $z['longitude'] <= $east
        );

        $gridSize = max(1, pow(2, 18 - $zoom));
        $clusters = [];

        foreach ($filtered as $zone) {
            $cellX = (int) (($zone['longitude'] - $west) / ($east - $west) * $gridSize);
            $cellY = (int) (($zone['latitude'] - $south) / ($north - $south) * $gridSize);
            $key = "{$cellX}:{$cellY}";
            if (!isset($clusters[$key])) {
                $clusters[$key] = ['count' => 0, 'total_score' => 0, 'lat' => 0, 'lng' => 0];
            }
            $clusters[$key]['count']++;
            $clusters[$key]['total_score'] += $zone['risk_score'];
            $clusters[$key]['lat'] += $zone['latitude'];
            $clusters[$key]['lng'] += $zone['longitude'];
        }

        return array_values(array_map(fn($c) => [
            'latitude' => round($c['lat'] / $c['count'], 7),
            'longitude' => round($c['lng'] / $c['count'], 7),
            'count' => $c['count'],
            'avg_risk_score' => round($c['total_score'] / $c['count'], 2),
        ], $clusters));
    }

    // ── Helpers ────────────────────────────────────────────────

    private static function cacheDir(): string
    {
        return storage_path('app/' . self::CACHE_DIR);
    }

    private static function zonesPath(): string
    {
        return self::cacheDir() . '/' . self::ZONES_FILE;
    }

    private static function versionPath(): string
    {
        return self::cacheDir() . '/' . self::VERSION_FILE;
    }

    public function getRegions(): array
    {
        return $this->regionRepo->getActiveRegions()->toArray();
    }

    public function getProvinces(int $regionId): array
    {
        return $this->regionRepo->getProvincesByRegion($regionId)->toArray();
    }

    public function getDistricts(int $provinceId): array
    {
        return $this->regionRepo->getDistrictsByProvince($provinceId)->toArray();
    }
}
