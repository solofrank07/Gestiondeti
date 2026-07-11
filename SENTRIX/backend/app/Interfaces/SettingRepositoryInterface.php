<?php

namespace App\Interfaces;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;

interface SettingRepositoryInterface extends BaseRepositoryInterface
{
    public function findByKey(string $key): ?Setting;
    public function getByGroup(string $group): Collection;
    public function getPublicSettings(): Collection;
    public function setValue(string $key, mixed $value): Setting;
}
