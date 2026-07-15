<?php

namespace App\Services;

use App\Interfaces\PanicAlertRepositoryInterface;
use App\Models\PanicAlert;
use App\Models\User;
use Carbon\Carbon;

class PanicService
{
    public function __construct(
        private PanicAlertRepositoryInterface $panicRepo,
        private NotificationService $notificationService,
    ) {}

    public function create(array $data, User $user): PanicAlert
    {
        $data['user_id'] = $user->id;
        $alert = $this->panicRepo->create($data);
        $this->notificationService->sendPanicAlertToAuthorities($user);
        return $alert;
    }

    public function getHistory(int $userId): array
    {
        return $this->panicRepo->findByUser($userId)->toArray();
    }

    public function getActiveAlerts(): array
    {
        $this->autoExpireStaleAlerts();
        return $this->panicRepo->getActiveAlerts()->toArray();
    }

    public function markAsAttended(int $id, int $userId): PanicAlert
    {
        return $this->panicRepo->markAsAttended($id, $userId);
    }

    public function autoExpireStaleAlerts(): int
    {
        $cutoff = Carbon::now()->subHours(6);
        return PanicAlert::where('status', 'activo')
            ->where('created_at', '<', $cutoff)
            ->update(['status' => 'falso_alarma']);
    }
}
