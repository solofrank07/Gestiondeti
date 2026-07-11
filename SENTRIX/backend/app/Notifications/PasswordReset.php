<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordReset extends Notification
{
    use Queueable;

    public function __construct(private string $token) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $appUrl = config('app.frontend_url', config('app.url'));

        return (new MailMessage)
            ->subject('Restablecer contraseña - SENTRIX')
            ->greeting('Hola ' . $notifiable->name)
            ->line('Recibiste este correo porque solicitaste restablecer tu contraseña.')
            ->action('Restablecer contraseña', "{$appUrl}/reset-password?token={$this->token}&email={$notifiable->email}")
            ->line('Este enlace expirará en 60 minutos.')
            ->line('Si no solicitaste este cambio, ignora este mensaje.');
    }
}
