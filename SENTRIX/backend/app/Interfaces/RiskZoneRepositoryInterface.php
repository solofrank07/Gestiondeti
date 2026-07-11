<?php

namespace App\Interfaces;

use App\Models\RiskZone;
use Illuminate\Database\Eloquent\Collection;

interface RiskZoneRepositoryInterface extends BaseRepositoryInterface
{
    public function findByLocation(float $lat, float $lng, float $radiusKm): Collection;
    public function findByRiskLevel(int $levelId): Collection;
    public function getCriticalZones(int $limit = 10): Collection;
    public function updateScore(int $id, float $score, int $levelId): RiskZone;
    public function getActiveZones(): Collection;
    public function getZonesInBounds(float $north, float $south, float $east, float $west): Collection;
}
