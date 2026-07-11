<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrimeType extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'severity_weight',
        'icon', 'color', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'severity_weight' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
