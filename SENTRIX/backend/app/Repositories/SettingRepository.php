<?php

namespace App\Repositories;

use App\Interfaces\SettingRepositoryInterface;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;

class SettingRepository extends BaseRepository implements SettingRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Setting());
    }

    public function findByKey(string $key): ?Setting
    {
        return $this->model->where('key', $key)->first();
    }

    public function getByGroup(string $group): Collection
    {
        return $this->model->where('group', $group)->get();
    }

    public function getPublicSettings(): Collection
    {
        return $this->model->where('is_public', true)->get();
    }

    public function setValue(string $key, mixed $value): Setting
    {
        return $this->model->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
