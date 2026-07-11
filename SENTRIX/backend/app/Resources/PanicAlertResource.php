<?php

namespace App\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PanicAlertResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user_name' => $this->whenLoaded('user', fn() => $this->user->name),
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'address' => $this->address,
            'message' => $this->message,
            'status' => $this->status,
            'attended_at' => $this->attended_at,
            'created_at' => $this->created_at,
        ];
    }
}
