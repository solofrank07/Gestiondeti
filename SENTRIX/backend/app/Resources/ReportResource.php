<?php

namespace App\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'address' => $this->address,
            'radius' => $this->radius !== null ? (int) $this->radius : null,
            'priority' => $this->priority,
            'source' => $this->source,
            'is_verified' => $this->is_verified,
            'is_anonymous' => (bool) $this->is_anonymous,
            'auto_approved' => $this->auto_approved,
            'promoted_hotspot_id' => $this->promoted_hotspot_id,
            'incident_date' => $this->incident_date,
            'created_at' => $this->created_at,
            'user' => $this->when($this->is_anonymous && auth()->id() !== $this->user_id, function () {
                return ['id' => null, 'name' => 'Anonimo', 'email' => null, 'photo' => null];
            }, function () {
                return UserResource::make($this->whenLoaded('user'));
            }),
            'crime_type' => $this->whenLoaded('crimeType'),
            'category' => $this->whenLoaded('category'),
            'status' => $this->whenLoaded('status'),
            'media' => $this->whenLoaded('media'),
        ];
    }
}
