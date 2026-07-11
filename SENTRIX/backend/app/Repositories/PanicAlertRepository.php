<?php

namespace App\Repositories;

use App\Interfaces\PanicAlertRepositoryInterface;
use App\Models\PanicAlert;
use Illuminate\Database\Eloquent\Collection;

class PanicAlertRepository extends BaseRepository implements PanicAlertRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new PanicAlert());
    }

    public function findByUser(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->latest()->get();
    }

    public function getActiveAlerts(): Collection
    {
        return $this->model->with('user')->where('status', 'activo')->latest()->get();
    }

    public function markAsAttended(int $id, int $userId): PanicAlert
    {
        $alert = $this->findOrFail($id);
        $alert->update([
            'status' => 'atendido',
            'attended_at' => now(),
            'attended_by' => $userId,
        ]);
        return $alert->fresh();
    }
}
