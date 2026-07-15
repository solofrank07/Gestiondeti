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
            'auto_approved' => $this->auto_approved,
            'promoted_hotspot_id' => $this->promoted_hotspot_id,
            'incident_date' => $this->incident_date,
            'created_at' => $this->created_at,
            'user' => UserResource::make($this->whenLoaded('user')),
            'crime_type' => $this->whenLoaded('crimeType'),
            'category' => $this->whenLoaded('category'),
            'status' => $this->whenLoaded('status'),
            'media' => $this->whenLoaded('media'),
        ];
    }
}
