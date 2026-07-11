<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PolygonPoint extends Model
{
    protected $fillable = ['polygon_id', 'order', 'latitude', 'longitude'];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function polygon(): BelongsTo
    {
        return $this->belongsTo(Polygon::class);
    }
}
