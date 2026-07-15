<?php

namespace App\Models;

use App\Interfaces\HeatmapCacheRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\App;

class Report extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'crime_type_id', 'category_id', 'status_id',
        'title', 'description', 'latitude', 'longitude', 'address',
        'incident_date', 'priority', 'source', 'reporter_ip',
        'is_verified', 'verified_at', 'verified_by', 'radius', 'is_anonymous',
        'auto_approved', 'promoted_hotspot_id',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'incident_date' => 'datetime',
            'is_verified' => 'boolean',
            'verified_at' => 'datetime',
            'rejected_at' => 'datetime',
            'auto_approved' => 'boolean',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        $invalidate = fn(self $report) => self::invalidateHeatmapCache($report);

        static::saved($invalidate);
        static::deleted($invalidate);
    }

    private static function invalidateHeatmapCache(self $report): void
    {
        $cacheRepo = App::make(HeatmapCacheRepositoryInterface::class);
        $cacheRepo->clearByZoneBounds(
            (float) $report->latitude,
            (float) $report->longitude,
            5
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function crimeType(): BelongsTo
    {
        return $this->belongsTo(CrimeType::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(ReportStatus::class, 'status_id');
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function promotedHotspot(): BelongsTo
    {
        return $this->belongsTo(RiskZone::class, 'promoted_hotspot_id');
    }
}
