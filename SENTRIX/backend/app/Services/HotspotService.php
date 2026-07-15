<?php

namespace App\Services;

use App\Helpers\GeoHelper;
use App\Interfaces\RiskZoneRepositoryInterface;
use App\Models\Report;
use App\Models\RiskLevel;
use App\Models\RiskZone;

class HotspotService
{
    public function __construct(
        private RiskZoneRepositoryInterface $riskZoneRepo,
    ) {}

    /**
     * Busca un RiskZone activo dentro del radio de proximidad configurado.
     * Devuelve el mas cercano, o null si no hay ninguno cerca.
     */
    public function isHotspot(float $lat, float $lng): ?RiskZone
    {
        $thresholdMeters = config('hotspots.proximity_threshold_meters');
        $candidates = $this->riskZoneRepo->findByLocation($lat, $lng, $thresholdMeters / 1000);

        $closest = null;
        $closestDistance = null;

        foreach ($candidates as $zone) {
            $distance = GeoHelper::calculateDistance($lat, $lng, (float) $zone->latitude, (float) $zone->longitude);
            if ($distance <= $thresholdMeters && ($closestDistance === null || $distance < $closestDistance)) {
                $closest = $zone;
                $closestDistance = $distance;
            }
        }

        return $closest;
    }

    public function promoteToHotspot(Report $report, ?RiskZone $existingHotspot): RiskZone
    {
        if ($existingHotspot) {
            $existingHotspot->increment('incident_count');
            $existingHotspot->refresh();
            $existingHotspot->update([
                'risk_level_id' => $this->resolveRiskLevelId($existingHotspot->incident_count),
                'last_incident_at' => now(),
            ]);
            $report->update(['promoted_hotspot_id' => $existingHotspot->id]);
            return $existingHotspot;
        }

        $hotspot = RiskZone::create([
            'name' => "Zona detectada — {$report->address}",
            'latitude' => $report->latitude,
            'longitude' => $report->longitude,
            'radius_meters' => $report->radius ?? config('hotspots.default_hotspot_radius_meters'),
            'incident_count' => 1,
            'risk_level_id' => $this->resolveRiskLevelId(1),
            'auto_generated' => true,
            'is_active' => true,
            'last_incident_at' => now(),
        ]);
        $report->update(['promoted_hotspot_id' => $hotspot->id]);

        return $hotspot;
    }

    private function resolveRiskLevelId(int $incidentCount): ?int
    {
        return RiskLevel::where('slug', $this->classify($incidentCount))->value('id');
    }

    private function classify(int $incidentCount): string
    {
        foreach (config('hotspots.classification_tiers') as $slug => $range) {
            if ($incidentCount >= $range['min'] && ($range['max'] === null || $incidentCount <= $range['max'])) {
                return $slug;
            }
        }
        return 'medio';
    }
}
