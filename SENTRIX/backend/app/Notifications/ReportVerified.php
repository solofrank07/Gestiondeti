<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReportVerified extends Notification
{
    use Queueable;

    public function __construct(private int $reportId) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title' => 'Reporte verificado',
            'body' => 'Tu reporte #' . $this->reportId . ' ha sido verificado por las autoridades.',
            'report_id' => $this->reportId,
            'type' => 'report_verified',
        ];
    }
}
