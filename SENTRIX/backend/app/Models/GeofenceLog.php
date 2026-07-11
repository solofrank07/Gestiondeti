<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeofenceLog extends Model
{
    protected $fillable = [
        'user_id', 'risk_zone_id', 'event',
        'latitude', 'longitude', 'distance_to_center',
        'notification_sent', 'event_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'distance_to_center' => 'decimal:2',
            'notification_sent' => 'json',
            'event_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function riskZone(): BelongsTo
    {
        return $this->belongsTo(RiskZone::class);
    }
}
