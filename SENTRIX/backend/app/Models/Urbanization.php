<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Urbanization extends Model
{
    protected $fillable = [
        'population_center_id', 'name', 'type',
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

    public function populationCenter(): BelongsTo
    {
        return $this->belongsTo(PopulationCenter::class);
    }

    public function sectors(): HasMany
    {
        return $this->hasMany(Sector::class);
    }
}
