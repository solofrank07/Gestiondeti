<?php

namespace App\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="RiskZone",
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="name", type="string"),
 *     @OA\Property(property="risk_score", type="number", format="float"),
 *     @OA\Property(property="risk_level", type="string"),
 *     @OA\Property(property="color", type="string"),
 *     @OA\Property(property="latitude", type="number", format="float"),
 *     @OA\Property(property="longitude", type="number", format="float"),
 *     @OA\Property(property="radius", type="number", format="float"),
 *     @OA\Property(property="polygons", type="array", @OA\Items(type="object"))
 * )
 */
class RiskZoneResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'risk_score' => (float) $this->risk_score,
            'risk_level' => $this->riskLevel?->slug,
            'color' => $this->riskLevel?->color,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'radius' => (float) $this->radius_meters,
            'crime_count' => $this->crime_count,
            'citizen_reports_count' => $this->citizen_reports_count,
            'official_reports_count' => $this->official_reports_count,
            'calculated_at' => $this->calculated_at,
            'polygons' => $this->whenLoaded('polygons', fn() => $this->polygons->map(fn($p) => [
                'points' => $p->points->map(fn($pt) => [
                    'lat' => (float) $pt->latitude,
                    'lng' => (float) $pt->longitude,
                ]),
                'fill_color' => $p->fill_color,
                'fill_opacity' => $p->fill_opacity,
                'stroke_width' => $p->stroke_width,
            ])),
        ];
    }
}
