<?php

namespace App\Interfaces;

use App\Models\PanicAlert;
use Illuminate\Database\Eloquent\Collection;

interface PanicAlertRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUser(int $userId): Collection;
    public function getActiveAlerts(): Collection;
    public function markAsAttended(int $id, int $userId): PanicAlert;
}
