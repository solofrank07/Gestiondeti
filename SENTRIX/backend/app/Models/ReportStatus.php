<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportStatus extends Model
{
    protected $table = 'report_status';

    protected $fillable = ['name', 'slug', 'description', 'color'];

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'status_id');
    }
}
