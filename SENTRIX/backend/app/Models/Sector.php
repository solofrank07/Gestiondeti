<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sector extends Model
{
    protected $fillable = [
        'urbanization_id', 'name', 'code',
        'latitude', 'longitude', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_active' => 'boolean',
        ];
    }

    public function urbanization(): BelongsTo
    {
        return $this->belongsTo(Urbanization::class);
    }

    public function riskZones(): HasMany
    {
        return $this->hasMany(RiskZone::class);
    }
}
