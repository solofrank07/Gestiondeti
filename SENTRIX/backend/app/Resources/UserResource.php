<?php

namespace App\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'photo' => $this->photo,
            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'last_lat' => $this->last_lat,
            'last_lng' => $this->last_lng,
            'last_active_at' => $this->last_active_at,
            'is_active' => $this->is_active,
            'roles' => $this->whenLoaded('roles'),
            'created_at' => $this->created_at,
        ];
    }
}
