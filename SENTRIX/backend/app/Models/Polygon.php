<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Polygon extends Model
{
    protected $fillable = [
        'risk_zone_id', 'name', 'color',
        'stroke_width', 'fill_color', 'fill_opacity', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'stroke_width' => 'decimal:1',
            'fill_opacity' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function riskZone(): BelongsTo
    {
        return $this->belongsTo(RiskZone::class);
    }

    public function points(): HasMany
    {
        return $this->hasMany(PolygonPoint::class);
    }
}
