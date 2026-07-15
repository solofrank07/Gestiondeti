<?php

namespace App\Controllers;

use App\Requests\StoreReportRequest;
use App\Resources\ReportResource;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Reportes", description="Gestión de reportes de incidentes")
 */
class ReportController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    /**
     * @OA\Get(
     *     path="/api/v1/reports",
     *     tags={"Reportes"},
     *     summary="Listar reportes del usuario autenticado",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer"), example=15),
     *     @OA\Response(response=200, description="Lista paginada de reportes")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $reports = $this->reportService->paginateByUser($request->user()->id, $perPage);
        return response()->json(ReportResource::collection($reports));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/reports",
     *     tags={"Reportes"},
     *     summary="Crear un nuevo reporte de incidente",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"title","description","latitude","longitude","incident_date"},
     *                 @OA\Property(property="title", type="string"),
     *                 @OA\Property(property="description", type="string"),
     *                 @OA\Property(property="latitude", type="number", format="float"),
     *                 @OA\Property(property="longitude", type="number", format="float"),
     *                 @OA\Property(property="address", type="string"),
     *                 @OA\Property(property="crime_type_id", type="integer"),
     *                 @OA\Property(property="category_id", type="integer"),
     *                 @OA\Property(property="incident_date", type="string", format="date-time"),
     *                 @OA\Property(property="priority", type="string", enum={"baja","media","alta","critica"}),
     *                 @OA\Property(property="media[]", type="array", @OA\Items(type="string", format="binary"))
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Reporte creado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function store(StoreReportRequest $request): JsonResponse
    {
        $report = $this->reportService->create($request->validated(), $request->user());

        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $this->reportService->attachMedia($report, $file);
            }
        }

        return response()->json(ReportResource::make($report), 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/reports/{id}",
     *     tags={"Reportes"},
     *     summary="Obtener detalle de un reporte",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detalle del reporte"),
     *     @OA\Response(response=404, description="Reporte no encontrado")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $report = $this->reportService->findById($id);
        if (!$report) {
            return response()->json(['message' => 'Reporte no encontrado.'], 404);
        }
        return response()->json(ReportResource::make($report->load('media')));
    }

    /**
     * @OA\Put(
     *     path="/api/v1/reports/{id}",
     *     tags={"Reportes"},
     *     summary="Actualizar un reporte",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(@OA\JsonContent(
     *         @OA\Property(property="title", type="string"),
     *         @OA\Property(property="description", type="string"),
     *         @OA\Property(property="priority", type="string", enum={"baja","media","alta","critica"})
     *     )),
     *     @OA\Response(response=200, description="Reporte actualizado"),
     *     @OA\Response(response=404, description="No encontrado")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $report = $this->reportService->update($id, $request->all());
        return response()->json(ReportResource::make($report));
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/reports/{id}",
     *     tags={"Reportes"},
     *     summary="Eliminar un reporte",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Reporte eliminado"),
     *     @OA\Response(response=404, description="No encontrado")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $this->reportService->delete($id);
        return response()->json(['message' => 'Reporte eliminado.']);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/reports/nearby",
     *     tags={"Reportes"},
     *     summary="Obtener reportes cercanos a una ubicación",
     *     @OA\Parameter(name="lat", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="lng", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="radius", in="query", @OA\Schema(type="number"), description="Radio en km", example=1),
     *     @OA\Response(response=200, description="Reportes cercanos"),
     *     @OA\Response(response=422, description="Parámetros inválidos")
     * )
     */
    public function nearby(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'nullable|numeric|min:0.1|max:50',
        ]);

        $reports = $this->reportService->getNearby(
            $request->lat, $request->lng, $request->radius ?? 1, onlyApproved: true
        );

        return response()->json(ReportResource::collection($reports));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/reports/{id}/verify",
     *     tags={"Reportes"},
     *     summary="Verificar un reporte (Autoridad/Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Reporte verificado"),
     *     @OA\Response(response=403, description="No autorizado")
     * )
     */
    public function verify(int $id, Request $request): JsonResponse
    {
        $report = $this->reportService->verify($id, $request->user()->id);
        return response()->json(ReportResource::make($report));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/reports/{id}/reject",
     *     tags={"Reportes"},
     *     summary="Rechazar un reporte (Autoridad/Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Reporte rechazado"),
     *     @OA\Response(response=403, description="No autorizado")
     * )
     */
    public function reject(int $id, Request $request): JsonResponse
    {
        $report = $this->reportService->reject($id, $request->user()->id);
        return response()->json(ReportResource::make($report));
    }
}
