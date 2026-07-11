<?php

namespace App\Services;

use App\Enums\GeofenceEvent;
use App\Helpers\GeoHelper;
use App\Interfaces\GeofenceLogRepositoryInterface;
use App\Interfaces\RiskZoneRepositoryInterface;
use App\Models\RiskZone;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class GeofencingService
{
    private const ENTRY_LOOKUP_KM = 3;
    private const NOTIFICATION_COOLDOWN_MINUTES = 15;
    private const DWELLING_THRESHOLD_SECONDS = 120;

    private const RISK_INFLUENCE_MULTIPLIERS = [
        'critico'  => 2.5,
        'alto'     => 2.0,
        'medio'    => 1.5,
        'bajo'     => 1.0,
        'muy-bajo' => 0.8,
    ];

    public function __construct(
        private RiskZoneRepositoryInterface $riskZoneRepo,
        private GeofenceLogRepositoryInterface $logRepo,
        private NotificationService $notificationService,
    ) {}

    public function checkProximity(User $user, float $lat, float $lng, ?float $speedMs = null): array
    {
        $zones = $this->riskZoneRepo->findByLocation($lat, $lng, self::ENTRY_LOOKUP_KM);
        $alerts = [];
        $heading = $this->getHeading($lat, $lng, $user);

        foreach ($zones as $zone) {
            $effectiveRadius = $this->getEffectiveRadius($zone);
            $distance = GeoHelper::calculateDistance($lat, $lng, (float) $zone->latitude, (float) $zone->longitude);
            $lastState = $this->getLastState($user, $zone);

            if ($distance <= $effectiveRadius) {
                $event = $this->determineEvent($user, $zone, $distance, $lastState);

                if ($event === null) continue;

                $duration = $event === GeofenceEvent::Dwelling->value
                    ? now()->diffInSeconds($lastState['entered_at'] ?? now())
                    : null;

                $this->logRepo->create([
                    'user_id'           => $user->id,
                    'risk_zone_id'      => $zone->id,
                    'event'             => $event,
                    'latitude'          => $lat,
                    'longitude'         => $lng,
                    'distance_to_center'=> round($distance, 2),
                    'duration_seconds'  => $duration,
                    'heading'           => $heading,
                    'speed_ms'          => $speedMs ? round($speedMs, 2) : null,
                    'event_at'          => now(),
                ]);

                $shouldNotify = $this->shouldNotify($user, $zone, $lastState, $event);
                if ($shouldNotify) {
                    $this->notificationService->sendGeofenceAlert($user, $zone, $event);
                    $this->markNotified($user, $zone);
                }

                $this->updateLastState($user, $zone, GeofenceEvent::tryFrom($event) ?? GeofenceEvent::Entry);

                $alerts[] = [
                    'zone_id'           => $zone->id,
                    'zone_name'         => $zone->name,
                    'risk_level'        => $zone->riskLevel?->slug ?? 'unknown',
                    'risk_score'        => $zone->risk_score,
                    'event'             => $event,
                    'distance'          => round($distance, 1),
                    'effective_radius'  => round($effectiveRadius, 0),
                    'alternative_route' => $this->suggestAlternativeRoute($lat, $lng, $zone, $heading),
                ];
            } elseif ($lastState && $lastState['status'] === 'inside') {
                $this->logExit($user, $zone, $lat, $lng, $distance, $heading, $speedMs);
            }
        }

        return [
            'alerts'       => $alerts,
            'total_alerts' => count($alerts),
        ];
    }

    public function batchCheck(array $users, float $lat, float $lng): array
    {
        $results = [];
        foreach ($users as $user) {
            $results[$user->id] = $this->checkProximity($user, $lat, $lng);
        }
        return $results;
    }

    public function getZonesForLocation(float $lat, float $lng): array
    {
        $zones = $this->riskZoneRepo->findByLocation($lat, $lng, self::ENTRY_LOOKUP_KM);
        return $zones->map(fn($z) => [
            'id'               => $z->id,
            'name'             => $z->name,
            'risk_level'       => $z->riskLevel?->slug,
            'risk_score'       => $z->risk_score,
            'distance'         => round(GeoHelper::calculateDistance($lat, $lng, (float) $z->latitude, (float) $z->longitude), 1),
            'effective_radius' => round($this->getEffectiveRadius($z), 0),
        ])->toArray();
    }

    public function getHistory(User $user, int $limit = 50): array
    {
        $logs = $this->logRepo->findByUser($user->id)->take($limit);
        return $logs->map(fn($l) => [
            'id'               => $l->id,
            'zone_name'        => $l->riskZone?->name,
            'event'            => $l->event,
            'latitude'         => (float) $l->latitude,
            'longitude'        => (float) $l->longitude,
            'distance'         => (float) $l->distance_to_center,
            'duration_seconds' => $l->duration_seconds,
            'heading'          => $l->heading,
            'event_at'         => $l->event_at?->toIso8601String(),
        ])->toArray();
    }

    private function getEffectiveRadius(RiskZone $zone): float
    {
        $level = $zone->riskLevel?->slug ?? 'medio';
        $multiplier = self::RISK_INFLUENCE_MULTIPLIERS[$level] ?? 1.0;
        return $zone->radius_meters * $multiplier;
    }

    private function determineEvent(User $user, RiskZone $zone, float $distance, ?array $lastState): ?string
    {
        if (!$lastState || $lastState['status'] !== 'inside') {
            return GeofenceEvent::Entry->value;
        }

        $enteredAt = $lastState['entered_at'] ?? now();
        $secondsInside = now()->diffInSeconds($enteredAt);

        if ($secondsInside >= self::DWELLING_THRESHOLD_SECONDS) {
            $dwellingSince = $lastState['dwelling_since'] ?? null;
            if (!$dwellingSince || now()->diffInSeconds($dwellingSince) >= self::DWELLING_THRESHOLD_SECONDS) {
                return GeofenceEvent::Dwelling->value;
            }
        }

        return null;
    }

    private function logExit(User $user, RiskZone $zone, float $lat, float $lng, float $distance, string $heading, ?float $speedMs): void
    {
        $lastState = $this->getLastState($user, $zone);
        $duration = $lastState && isset($lastState['entered_at'])
            ? now()->diffInSeconds($lastState['entered_at'])
            : null;

        $this->logRepo->create([
            'user_id'           => $user->id,
            'risk_zone_id'      => $zone->id,
            'event'             => GeofenceEvent::Exit->value,
            'latitude'          => $lat,
            'longitude'         => $lng,
            'distance_to_center'=> round($distance, 2),
            'duration_seconds'  => $duration,
            'heading'           => $heading,
            'speed_ms'          => $speedMs ? round($speedMs, 2) : null,
            'event_at'          => now(),
        ]);

        $this->clearLastState($user, $zone);
    }

    private function getLastState(User $user, RiskZone $zone): ?array
    {
        $state = $user->last_geofence_state ?? [];
        return $state[(string) $zone->id] ?? null;
    }

    private function updateLastState(User $user, RiskZone $zone, GeofenceEvent $event): void
    {
        $state = $user->last_geofence_state ?? [];

        if ($event === GeofenceEvent::Entry) {
            $state[$zone->id] = [
                'status'          => 'inside',
                'entered_at'      => now()->toIso8601String(),
                'dwelling_since'  => null,
                'last_notified_at'=> $state[$zone->id]['last_notified_at'] ?? null,
            ];
        } elseif ($event === GeofenceEvent::Dwelling) {
            $state[$zone->id]['dwelling_since'] = $state[$zone->id]['dwelling_since']
                ?? now()->toIso8601String();
        }

        $user->updateQuietly(['last_geofence_state' => $state]);
    }

    private function clearLastState(User $user, RiskZone $zone): void
    {
        $state = $user->last_geofence_state ?? [];
        unset($state[$zone->id]);
        $user->updateQuietly(['last_geofence_state' => $state]);
    }

    private function shouldNotify(User $user, RiskZone $zone, ?array $lastState, string $event): bool
    {
        if ($event === GeofenceEvent::Dwelling->value && $lastState && $lastState['dwelling_since'] !== null) {
            return false;
        }

        if ($lastState && isset($lastState['last_notified_at'])) {
            $lastNotified = now()->diffInMinutes($lastState['last_notified_at']);
            if ($lastNotified < self::NOTIFICATION_COOLDOWN_MINUTES) {
                return false;
            }
        }

        return true;
    }

    private function markNotified(User $user, RiskZone $zone): void
    {
        $state = $user->last_geofence_state ?? [];
        if (isset($state[$zone->id])) {
            $state[$zone->id]['last_notified_at'] = now()->toIso8601String();
            $user->updateQuietly(['last_geofence_state' => $state]);
        }
    }

    private function getHeading(float $lat, float $lng, User $user): string
    {
        if (!$user->last_geofence_state) return 'N';

        $lastState = collect($user->last_geofence_state)->first();
        if (!$lastState || !isset($lastState['entered_at'])) return 'N';

        $dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        $bearing = rad2deg(atan2(
            sin(deg2rad($lng)) - sin(deg2rad($lng)),
            cos(deg2rad($lat)) * sin(deg2rad($lat)) - sin(deg2rad($lat)) * cos(deg2rad($lat)) * cos(deg2rad($lng))
        ));
        $bearing = fmod($bearing + 360, 360);
        return $dirs[round($bearing / 45) % 8];
    }

    private function suggestAlternativeRoute(float $lat, float $lng, RiskZone $zone, string $heading): ?array
    {
        $centerLat = (float) $zone->latitude;
        $centerLng = (float) $zone->longitude;
        $effectiveRadius = $this->getEffectiveRadius($zone);

        $bearingFromCenter = rad2deg(atan2(
            $lng - $centerLng,
            $lat - $centerLat
        ));

        $escapeBearing = fmod($bearingFromCenter + 180 + 30, 360);
        $escapeDistance = $effectiveRadius + 100;

        $escapeLat = $lat + ($escapeDistance / 111320) * cos(deg2rad($escapeBearing));
        $escapeLng = $lng + ($escapeDistance / (111320 * cos(deg2rad($lat)))) * sin(deg2rad($escapeBearing));

        $dirNames = ['N' => 'norte', 'NE' => 'noreste', 'E' => 'este', 'SE' => 'sureste',
                     'S' => 'sur', 'SW' => 'suroeste', 'W' => 'oeste', 'NW' => 'noroeste'];
        $dirIndex = round($escapeBearing / 45) % 8;
        $direction = $dirNames[$dirIndex] ?? 'norte';

        return [
            'suggested_lat' => round($escapeLat, 7),
            'suggested_lng' => round($escapeLng, 7),
            'message'       => "Desvíese hacia el {$direction} ({$escapeDistance}m) para evitar la zona de riesgo.",
            'escape_heading'=> $direction,
            'escape_meters' => round($escapeDistance, 0),
        ];
    }
}
