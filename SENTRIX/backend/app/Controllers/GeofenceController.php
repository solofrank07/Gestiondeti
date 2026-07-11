<?php

namespace App\Controllers;

use App\Http\Requests\BatchGeofenceCheckRequest;
use App\Services\GeofencingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Geocercas", description="Monitoreo de geocercas y alertas de proximidad")
 */
class GeofenceController extends Controller
{
    public function __construct(private GeofencingService $geofencingService) {}

    /**
     * @OA\Post(
     *     path="/api/v1/geofence/check",
     *     tags={"Geocercas"},
     *     summary="Verificar proximidad a zonas de riesgo",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"lat","lng"},
     *             @OA\Property(property="lat", type="number", format="float"),
     *             @OA\Property(property="lng", type="number", format="float"),
     *             @OA\Property(property="speed_ms", type="number", format="float")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Alertas de zonas cercanas"),
     *     @OA\Response(response=422, description="Coordenadas inválidas")
     * )
     */
    public function check(Request $request): JsonResponse
    {
        $request->validate([
            'lat'      => 'required|numeric|between:-90,90',
            'lng'      => 'required|numeric|between:-180,180',
            'speed_ms' => 'nullable|numeric|min:0|max:100',
        ]);

        $result = $this->geofencingService->checkProximity(
            $request->user(),
            $request->lat,
            $request->lng,
            $request->speed_ms,
        );

        return response()->json($result);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/geofence/batch-check",
     *     tags={"Geocercas"},
     *     summary="Verificar proximidad masiva (Autoridad)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"lat","lng","user_ids"},
     *             @OA\Property(property="lat", type="number"),
     *             @OA\Property(property="lng", type="number"),
     *             @OA\Property(property="user_ids", type="array", @OA\Items(type="integer"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Resultados por usuario")
     * )
     */
    public function batchCheck(Request $request): JsonResponse
    {
        $request->validate([
            'lat'       => 'required|numeric|between:-90,90',
            'lng'       => 'required|numeric|between:-180,180',
            'user_ids'  => 'required|array|min:1|max:100',
            'user_ids.*'=> 'integer|exists:users,id',
        ]);

        $users = \App\Models\User::whereIn('id', $request->user_ids)->get();
        $results = $this->geofencingService->batchCheck($users->all(), $request->lat, $request->lng);

        return response()->json($results);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/geofence/history",
     *     tags={"Geocercas"},
     *     summary="Historial de eventos de geocerca del usuario",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Historial de eventos")
     * )
     */
    public function history(Request $request): JsonResponse
    {
        $limit = min((int) ($request->limit ?? 50), 200);
        $history = $this->geofencingService->getHistory($request->user(), $limit);
        return response()->json($history);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/geofence/zones/{lat}/{lng}",
     *     tags={"Geocercas"},
     *     summary="Obtener zonas de riesgo cercanas a una ubicación",
     *     @OA\Parameter(name="lat", in="path", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="lng", in="path", required=true, @OA\Schema(type="number")),
     *     @OA\Response(response=200, description="Zonas de riesgo cercanas")
     * )
     */
    public function getZones(float $lat, float $lng): JsonResponse
    {
        $zones = $this->geofencingService->getZonesForLocation($lat, $lng);
        return response()->json($zones);
    }
}
