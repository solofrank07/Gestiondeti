<?php

namespace App\Interfaces;

use App\Models\GeofenceLog;
use Illuminate\Database\Eloquent\Collection;

interface GeofenceLogRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUser(int $userId): Collection;
    public function findByUserAndDate(int $userId, string $date): Collection;
    public function getRecentAlerts(int $hours = 24): Collection;
}
