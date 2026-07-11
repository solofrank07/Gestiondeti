<?php

namespace App\Services;

use App\Interfaces\RiskZoneRepositoryInterface;
use App\Interfaces\RegionRepositoryInterface;

class MapService
{
    public function __construct(
        private RiskZoneRepositoryInterface $riskZoneRepo,
        private RegionRepositoryInterface $regionRepo,
    ) {}

    public function getRiskZones(float $north, float $south, float $east, float $west): array
    {
        $zones = $this->riskZoneRepo->getZonesInBounds($north, $south, $east, $west);
        return $zones->map(fn($z) => [
            'id' => $z->id,
            'name' => $z->name,
            'risk_score' => $z->risk_score,
            'risk_level' => $z->riskLevel?->slug,
            'color' => $z->riskLevel?->color,
            'latitude' => (float) $z->latitude,
            'longitude' => (float) $z->longitude,
            'radius' => (float) $z->radius_meters,
            'polygons' => $z->polygons->map(fn($p) => [
                'points' => $p->points->map(fn($pt) => [
                    'lat' => (float) $pt->latitude,
                    'lng' => (float) $pt->longitude,
                ]),
                'fill_color' => $p->fill_color,
                'fill_opacity' => $p->fill_opacity,
                'stroke_width' => $p->stroke_width,
            ]),
        ])->toArray();
    }

    public function getClusters(float $north, float $south, float $east, float $west, int $zoom): array
    {
        $zones = $this->riskZoneRepo->getZonesInBounds($north, $south, $east, $west);
        $gridSize = max(1, pow(2, 18 - $zoom));
        $clusters = [];

        foreach ($zones as $zone) {
            $cellX = (int) (($zone->longitude - $west) / ($east - $west) * $gridSize);
            $cellY = (int) (($zone->latitude - $south) / ($north - $south) * $gridSize);
            $key = "{$cellX}:{$cellY}";
            if (!isset($clusters[$key])) {
                $clusters[$key] = ['count' => 0, 'total_score' => 0, 'lat' => 0, 'lng' => 0];
            }
            $clusters[$key]['count']++;
            $clusters[$key]['total_score'] += $zone->risk_score;
            $clusters[$key]['lat'] += $zone->latitude;
            $clusters[$key]['lng'] += $zone->longitude;
        }

        return array_values(array_map(fn($c) => [
            'latitude' => round($c['lat'] / $c['count'], 7),
            'longitude' => round($c['lng'] / $c['count'], 7),
            'count' => $c['count'],
            'avg_risk_score' => round($c['total_score'] / $c['count'], 2),
        ], $clusters));
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
