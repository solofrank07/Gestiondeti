<?php

namespace App\Interfaces;

use App\Models\Region;
use App\Models\Province;
use App\Models\District;
use Illuminate\Database\Eloquent\Collection;

interface RegionRepositoryInterface extends BaseRepositoryInterface
{
    public function getWithProvinces(int $id): ?Region;
    public function getActiveRegions(): Collection;
    public function getProvincesByRegion(int $regionId): Collection;
    public function getDistrictsByProvince(int $provinceId): Collection;
    public function findProvinceById(int $id): ?Province;
    public function findDistrictById(int $id): ?District;
}
