<?php

namespace App\Repositories;

use App\Interfaces\GeofenceLogRepositoryInterface;
use App\Models\GeofenceLog;
use Illuminate\Database\Eloquent\Collection;

class GeofenceLogRepository extends BaseRepository implements GeofenceLogRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new GeofenceLog());
    }

    public function findByUser(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->latest()->get();
    }

    public function findByUserAndDate(int $userId, string $date): Collection
    {
        return $this->model->where('user_id', $userId)->whereDate('event_at', $date)->get();
    }

    public function getRecentAlerts(int $hours = 24): Collection
    {
        return $this->model
            ->with(['user', 'riskZone'])
            ->where('event_at', '>=', now()->subHours($hours))
            ->latest()
            ->get();
    }
}
