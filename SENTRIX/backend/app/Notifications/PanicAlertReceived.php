<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PanicAlertReceived extends Notification
{
    use Queueable;

    public function __construct(private User $citizen) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => 'Alerta de pánico',
            'body' => "{$this->citizen->name} ha activado una alerta de pánico.",
            'citizen_id' => $this->citizen->id,
            'citizen_name' => $this->citizen->name,
            'latitude' => $this->citizen->last_lat,
            'longitude' => $this->citizen->last_lng,
            'type' => 'panic_alert',
        ];
    }
}
