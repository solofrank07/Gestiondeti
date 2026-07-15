<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\RiskZone;
use App\Notifications\GeofenceAlert;
use App\Notifications\ReportVerified;
use App\Notifications\PanicAlertReceived;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public function sendGeofenceAlert(User $user, RiskZone $zone, ?string $eventType = null): void
    {
        $user->notify(new GeofenceAlert($zone, $eventType));
    }

    public function sendReportVerified(User $user, int $reportId): void
    {
        $user->notify(new ReportVerified($reportId));
    }

    public function sendPanicAlertToAuthorities(User $citizen): void
    {
        $authorities = User::whereHas('roles', fn($q) => $q->where('name', UserRole::Autoridad->value))->get();
        Notification::send($authorities, new PanicAlertReceived($citizen));
    }
}
