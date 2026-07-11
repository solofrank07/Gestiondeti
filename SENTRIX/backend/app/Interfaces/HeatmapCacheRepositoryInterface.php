<?php

namespace App\Interfaces;

use App\Models\HeatmapCache;
use Illuminate\Support\Collection;

interface HeatmapCacheRepositoryInterface extends BaseRepositoryInterface
{
    public function findByBounds(float $north, float $south, float $east, float $west, int $zoom): ?HeatmapCache;
    public function findByTile(int $zoom, int $x, int $y, ?string $filtersHash = null): ?HeatmapCache;
    public function clearExpired(): int;
    public function clearByZoneBounds(float $lat, float $lng, float $radiusKm): int;
    public function getLeastAccessed(int $limit = 50): Collection;
    public function recordHit(HeatmapCache $cache): void;
}
