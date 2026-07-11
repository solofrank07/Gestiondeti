<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EtlImport extends Model
{
    protected $table = 'etl_imports';

    protected $fillable = [
        'source', 'filename', 'status',
        'total_rows', 'imported_count', 'error_count', 'skipped_count',
        'errors', 'summary', 'user_id', 'started_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'total_rows' => 'integer',
            'imported_count' => 'integer',
            'error_count' => 'integer',
            'skipped_count' => 'integer',
            'errors' => 'json',
            'summary' => 'json',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
