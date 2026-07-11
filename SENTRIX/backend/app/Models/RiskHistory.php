<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiskHistory extends Model
{
    protected $table = 'risk_history';

    protected $fillable = [
        'risk_zone_id', 'risk_score', 'risk_level_id',
        'crime_count', 'reports_count',
        'factors_breakdown', 'calculated_at',
    ];

    protected function casts(): array
    {
        return [
            'risk_score' => 'decimal:2',
            'crime_count' => 'integer',
            'reports_count' => 'integer',
            'factors_breakdown' => 'json',
            'calculated_at' => 'datetime',
        ];
    }

    public function riskZone(): BelongsTo
    {
        return $this->belongsTo(RiskZone::class);
    }

    public function riskLevel(): BelongsTo
    {
        return $this->belongsTo(RiskLevel::class);
    }
}
