<?php

namespace App\Providers;

use App\Interfaces\GeofenceLogRepositoryInterface;
use App\Interfaces\HeatmapCacheRepositoryInterface;
use App\Interfaces\PanicAlertRepositoryInterface;
use App\Interfaces\RegionRepositoryInterface;
use App\Interfaces\ReportRepositoryInterface;
use App\Interfaces\RiskZoneRepositoryInterface;
use App\Interfaces\RoleRepositoryInterface;
use App\Interfaces\SettingRepositoryInterface;
use App\Interfaces\UserRepositoryInterface;
use App\Repositories\GeofenceLogRepository;
use App\Repositories\HeatmapCacheRepository;
use App\Repositories\PanicAlertRepository;
use App\Repositories\RegionRepository;
use App\Repositories\ReportRepository;
use App\Repositories\RiskZoneRepository;
use App\Repositories\RoleRepository;
use App\Repositories\SettingRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(ReportRepositoryInterface::class, ReportRepository::class);
        $this->app->bind(RiskZoneRepositoryInterface::class, RiskZoneRepository::class);
        $this->app->bind(GeofenceLogRepositoryInterface::class, GeofenceLogRepository::class);
        $this->app->bind(PanicAlertRepositoryInterface::class, PanicAlertRepository::class);
        $this->app->bind(HeatmapCacheRepositoryInterface::class, HeatmapCacheRepository::class);
        $this->app->bind(RegionRepositoryInterface::class, RegionRepository::class);
        $this->app->bind(SettingRepositoryInterface::class, SettingRepository::class);
    }
}
