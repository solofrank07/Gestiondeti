<?php

namespace App\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GeofenceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'zone_id' => $this->risk_zone_id,
            'zone_name' => $this->whenLoaded('riskZone', fn() => $this->riskZone->name),
            'event' => $this->event,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'distance_to_center' => (float) $this->distance_to_center,
            'event_at' => $this->event_at,
        ];
    }
}
