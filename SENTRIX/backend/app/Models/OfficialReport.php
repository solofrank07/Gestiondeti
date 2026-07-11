<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficialReport extends Model
{
    protected $fillable = [
        'external_id', 'source', 'crime_type_id',
        'title', 'description', 'latitude', 'longitude',
        'incident_date', 'severity', 'status', 'raw_data', 'imported_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'incident_date' => 'datetime',
            'raw_data' => 'json',
            'imported_at' => 'datetime',
        ];
    }

    public function crimeType(): BelongsTo
    {
        return $this->belongsTo(CrimeType::class);
    }
}
