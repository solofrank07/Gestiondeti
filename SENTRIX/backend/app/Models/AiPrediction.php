<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AiPrediction extends Model
{
    protected $table = 'ai_predictions';

    protected $fillable = [
        'type', 'predictable_type', 'predictable_id',
        'prediction', 'confidence', 'features', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'prediction' => 'json',
            'features' => 'json',
            'confidence' => 'decimal:2',
            'expires_at' => 'datetime',
        ];
    }

    public function predictable(): MorphTo
    {
        return $this->morphTo();
    }
}
