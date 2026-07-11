<?php

namespace App\Repositories;

use App\Interfaces\RegionRepositoryInterface;
use App\Models\Region;
use App\Models\Province;
use App\Models\District;
use Illuminate\Database\Eloquent\Collection;

class RegionRepository extends BaseRepository implements RegionRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Region());
    }

    public function getWithProvinces(int $id): ?Region
    {
        return $this->model->with('provinces')->find($id);
    }

    public function getActiveRegions(): Collection
    {
        return $this->model->where('is_active', true)->get();
    }

    public function getProvincesByRegion(int $regionId): Collection
    {
        return Province::where('region_id', $regionId)->where('is_active', true)->get();
    }

    public function getDistrictsByProvince(int $provinceId): Collection
    {
        return District::where('province_id', $provinceId)->where('is_active', true)->get();
    }

    public function findProvinceById(int $id): ?Province
    {
        return Province::find($id);
    }

    public function findDistrictById(int $id): ?District
    {
        return District::find($id);
    }
}
