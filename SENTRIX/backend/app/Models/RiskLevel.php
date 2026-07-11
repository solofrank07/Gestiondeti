<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RiskLevel extends Model
{
    protected $fillable = ['name', 'slug', 'min_score', 'max_score', 'color', 'description'];

    protected function casts(): array
    {
        return [
            'min_score' => 'integer',
            'max_score' => 'integer',
        ];
    }

    public function riskZones(): HasMany
    {
        return $this->hasMany(RiskZone::class);
    }

    public function riskHistories(): HasMany
    {
        return $this->hasMany(RiskHistory::class);
    }
}
