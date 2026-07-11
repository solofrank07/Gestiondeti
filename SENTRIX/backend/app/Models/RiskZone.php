<?php

namespace App\Models;

use App\Interfaces\HeatmapCacheRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\App;

class RiskZone extends Model
{
    protected $fillable = [
        'sector_id', 'name', 'description', 'risk_score', 'risk_level_id',
        'latitude', 'longitude', 'crime_count', 'citizen_reports_count',
        'official_reports_count', 'boundaries', 'radius_meters',
        'area_km2', 'calculated_at', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'risk_score' => 'decimal:2',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'crime_count' => 'integer',
            'citizen_reports_count' => 'integer',
            'official_reports_count' => 'integer',
            'boundaries' => 'json',
            'radius_meters' => 'decimal:2',
            'area_km2' => 'decimal:2',
            'calculated_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        $invalidate = fn(self $zone) => self::invalidateHeatmapCache($zone);

        static::saved($invalidate);
        static::deleted($invalidate);
    }

    private static function invalidateHeatmapCache(self $zone): void
    {
        $cacheRepo = App::make(HeatmapCacheRepositoryInterface::class);
        $cacheRepo->clearByZoneBounds(
            (float) $zone->latitude,
            (float) $zone->longitude,
            ($zone->radius_meters ?? 500) / 1000 + 2
        );
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function riskLevel(): BelongsTo
    {
        return $this->belongsTo(RiskLevel::class);
    }

    public function polygons(): HasMany
    {
        return $this->hasMany(Polygon::class);
    }

    public function riskHistory(): HasMany
    {
        return $this->hasMany(RiskHistory::class);
    }

    public function geofenceLogs(): HasMany
    {
        return $this->hasMany(GeofenceLog::class);
    }
}
