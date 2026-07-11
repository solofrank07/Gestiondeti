<?php

namespace App\Repositories;

use App\Interfaces\RiskZoneRepositoryInterface;
use App\Models\RiskZone;
use Illuminate\Database\Eloquent\Collection;

class RiskZoneRepository extends BaseRepository implements RiskZoneRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new RiskZone());
    }

    public function findByLocation(float $lat, float $lng, float $radiusKm): Collection
    {
        $latDelta = $radiusKm / 111;
        $lngDelta = $radiusKm / (111 * cos(deg2rad($lat)));
        return $this->model
            ->with('riskLevel')
            ->whereBetween('latitude', [$lat - $latDelta, $lat + $latDelta])
            ->whereBetween('longitude', [$lng - $lngDelta, $lng + $lngDelta])
            ->where('is_active', true)
            ->get();
    }

    public function findByRiskLevel(int $levelId): Collection
    {
        return $this->model->where('risk_level_id', $levelId)->where('is_active', true)->get();
    }

    public function getCriticalZones(int $limit = 10): Collection
    {
        return $this->model
            ->with('riskLevel')
            ->where('is_active', true)
            ->orderByDesc('risk_score')
            ->limit($limit)
            ->get();
    }

    public function updateScore(int $id, float $score, int $levelId): RiskZone
    {
        $zone = $this->findOrFail($id);
        $zone->update([
            'risk_score' => $score,
            'risk_level_id' => $levelId,
            'calculated_at' => now(),
        ]);
        return $zone->fresh();
    }

    public function getActiveZones(): Collection
    {
        return $this->model->with('riskLevel')->where('is_active', true)->get();
    }

    public function getZonesInBounds(float $north, float $south, float $east, float $west): Collection
    {
        return $this->model
            ->with('riskLevel')
            ->whereBetween('latitude', [$south, $north])
            ->whereBetween('longitude', [$west, $east])
            ->where('is_active', true)
            ->get();
    }
}
