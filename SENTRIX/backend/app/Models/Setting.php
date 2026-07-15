<?php

namespace App\Models;

use App\Enums\SettingType;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group', 'description', 'type', 'is_public'];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'type' => SettingType::class,
        ];
    }
}
