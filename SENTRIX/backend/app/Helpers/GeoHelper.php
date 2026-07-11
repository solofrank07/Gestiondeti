<?php

namespace App\Helpers;

class GeoHelper
{
    public static function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    public static function getBounds(float $lat, float $lng, float $radiusKm): array
    {
        $latDelta = $radiusKm / 111;
        $lngDelta = $radiusKm / (111 * cos(deg2rad($lat)));
        return [
            'north' => $lat + $latDelta,
            'south' => $lat - $latDelta,
            'east' => $lng + $lngDelta,
            'west' => $lng - $lngDelta,
        ];
    }

    public static function kilometersToDegrees(float $km): float
    {
        return $km / 111;
    }
}
