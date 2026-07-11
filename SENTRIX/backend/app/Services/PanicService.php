<?php

namespace App\Services;

use App\Interfaces\PanicAlertRepositoryInterface;
use App\Models\PanicAlert;
use App\Models\User;

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
        return $this->panicRepo->getActiveAlerts()->toArray();
    }

    public function markAsAttended(int $id, int $userId): PanicAlert
    {
        return $this->panicRepo->markAsAttended($id, $userId);
    }
}
