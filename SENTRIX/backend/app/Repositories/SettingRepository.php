<?php

namespace App\Repositories;

use App\Enums\SettingType;
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
        $setting = $this->model->updateOrCreate(['key' => $key], ['value' => $value]);

        // Cast value based on the setting's type column
        $type = $setting->type ?? 'string';
        $casted = match ($type) {
            SettingType::Integer->value => (int) $value,
            SettingType::Float->value   => (float) $value,
            SettingType::Boolean->value => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            SettingType::Json->value    => is_string($value) ? json_decode($value, true) : $value,
            default                     => (string) $value,
        };

        if ($casted !== $value) {
            $setting->update(['value' => is_bool($casted) ? ($casted ? 'true' : 'false') : (string) $casted]);
        }

        return $setting->fresh();
    }
}
