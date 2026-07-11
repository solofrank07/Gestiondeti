<?php

namespace App\Notifications;

use App\Enums\GeofenceEvent;
use App\Models\RiskZone;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class GeofenceAlert extends Notification
{
    use Queueable;

    public function __construct(
        private RiskZone $zone,
        private ?string $eventType = null,
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $event = $this->eventType ?? GeofenceEvent::Entry->value;

        $titles = [
            'entry'   => '⚠️ Ingreso a zona de riesgo',
            'dwelling' => '⏳ Permanencia prolongada en zona de riesgo',
            'exit'    => '✅ Salida de zona de riesgo',
        ];

        $bodies = [
            'entry'   => "Has ingresado a {$this->zone->name}. Nivel: {$this->zone->riskLevel?->name} ({$this->zone->risk_score}/100).",
            'dwelling' => "Llevas más de 2 minutos en {$this->zone->name}. Nivel: {$this->zone->riskLevel?->name}.",
            'exit'    => "Has salido de {$this->zone->name}.",
        ];

        return [
            'title'       => $titles[$event] ?? 'Alerta de zona de riesgo',
            'body'        => $bodies[$event] ?? '',
            'event'       => $event,
            'risk_zone_id'=> $this->zone->id,
            'risk_score'  => $this->zone->risk_score,
            'risk_level'  => $this->zone->riskLevel?->slug,
            'latitude'    => $this->zone->latitude,
            'longitude'   => $this->zone->longitude,
            'type'        => 'geofence_alert',
        ];
    }
}
