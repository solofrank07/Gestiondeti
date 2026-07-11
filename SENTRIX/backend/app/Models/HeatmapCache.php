<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeatmapCache extends Model
{
    protected $table = 'heatmap_cache';

    protected $fillable = [
        'hash', 'north', 'south', 'east', 'west',
        'zoom_level', 'tile_x', 'tile_y', 'data', 'grid_config',
        'point_count', 'hit_count', 'filters_hash', 'expires_at',
        'last_accessed_at',
    ];

    protected function casts(): array
    {
        return [
            'north' => 'decimal:7',
            'south' => 'decimal:7',
            'east' => 'decimal:7',
            'west' => 'decimal:7',
            'zoom_level' => 'integer',
            'tile_x' => 'integer',
            'tile_y' => 'integer',
            'data' => 'json',
            'grid_config' => 'json',
            'point_count' => 'integer',
            'hit_count' => 'integer',
            'expires_at' => 'datetime',
            'last_accessed_at' => 'datetime',
        ];
    }
}
