<?php

namespace App\Repositories;

use App\Interfaces\HeatmapCacheRepositoryInterface;
use App\Models\HeatmapCache;
use Illuminate\Support\Collection;

class HeatmapCacheRepository extends BaseRepository implements HeatmapCacheRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new HeatmapCache());
    }

    public function findByBounds(float $north, float $south, float $east, float $west, int $zoom): ?HeatmapCache
    {
        return $this->model
            ->where('north', $north)
            ->where('south', $south)
            ->where('east', $east)
            ->where('west', $west)
            ->where('zoom_level', $zoom)
            ->where('expires_at', '>', now())
            ->first();
    }

    public function findByTile(int $zoom, int $x, int $y, ?string $filtersHash = null): ?HeatmapCache
    {
        $q = $this->model
            ->where('zoom_level', $zoom)
            ->where('tile_x', $x)
            ->where('tile_y', $y)
            ->where('expires_at', '>', now());

        if ($filtersHash) {
            $q->where('filters_hash', $filtersHash);
        }

        return $q->first();
    }

    public function clearExpired(): int
    {
        return $this->model->where('expires_at', '<=', now())->delete();
    }

    public function clearByZoneBounds(float $lat, float $lng, float $radiusKm): int
    {
        $latDelta = $radiusKm / 111;
        $lngDelta = $radiusKm / (111 * cos(deg2rad($lat)));

        return $this->model
            ->where('north', '>=', $lat - $latDelta)
            ->where('south', '<=', $lat + $latDelta)
            ->where('east', '>=', $lng - $lngDelta * 2)
            ->where('west', '<=', $lng + $lngDelta * 2)
            ->delete();
    }

    public function getLeastAccessed(int $limit = 50): Collection
    {
        return $this->model
            ->orderBy('hit_count')
            ->limit($limit)
            ->get();
    }

    public function recordHit(HeatmapCache $cache): void
    {
        $cache->increment('hit_count');
        $cache->update(['last_accessed_at' => now()]);
    }
}
