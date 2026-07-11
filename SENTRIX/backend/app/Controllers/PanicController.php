<?php

namespace App\Controllers;

use App\Services\PanicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Pánico", description="Alertas de pánico de ciudadanos")
 */
class PanicController extends Controller
{
    public function __construct(private PanicService $panicService) {}

    /**
     * @OA\Post(
     *     path="/api/v1/panic",
     *     tags={"Pánico"},
     *     summary="Activar alerta de pánico",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"latitude","longitude"},
     *             @OA\Property(property="latitude", type="number", format="float"),
     *             @OA\Property(property="longitude", type="number", format="float"),
     *             @OA\Property(property="address", type="string"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Alerta de pánico creada"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:500',
        ]);

        $alert = $this->panicService->create($request->all(), $request->user());
        return response()->json($alert, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/panic/history",
     *     tags={"Pánico"},
     *     summary="Historial de alertas del usuario",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Historial de alertas de pánico")
     * )
     */
    public function history(Request $request): JsonResponse
    {
        return response()->json($this->panicService->getHistory($request->user()->id));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/panic/active",
     *     tags={"Pánico"},
     *     summary="Alertas de pánico activas (Autoridad)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Alertas activas"),
     *     @OA\Response(response=403, description="No autorizado")
     * )
     */
    public function active(): JsonResponse
    {
        return response()->json($this->panicService->getActiveAlerts());
    }

    /**
     * @OA\Post(
     *     path="/api/v1/panic/{id}/attend",
     *     tags={"Pánico"},
     *     summary="Atender alerta de pánico (Autoridad)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Alerta atendida"),
     *     @OA\Response(response=403, description="No autorizado")
     * )
     */
    public function attend(int $id, Request $request): JsonResponse
    {
        $alert = $this->panicService->markAsAttended($id, $request->user()->id);
        return response()->json($alert);
    }
}
