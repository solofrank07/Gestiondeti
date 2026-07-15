<?php

namespace App\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Dashboard", description="Estadísticas y resúmenes para autoridades")
 */
class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    public function summary(): JsonResponse
    {
        return response()->json($this->dashboardService->getSummary());
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dashboard/statistics",
     *     tags={"Dashboard"},
     *     summary="Estadísticas de reportes",
     *     @OA\Parameter(name="from", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="to", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="province_id", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="district_id", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Estadísticas")
     * )
     */
    public function statistics(Request $request): JsonResponse
    {
        $filters = $request->only(['from', 'to', 'province_id', 'district_id']);
        return response()->json($this->dashboardService->getStatistics($filters));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dashboard/crime-types",
     *     tags={"Dashboard"},
     *     summary="Distribución por tipo de delito",
     *     @OA\Parameter(name="from", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="to", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="province_id", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="district_id", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Distribución de tipos de delito")
     * )
     */
    public function crimeTypes(Request $request): JsonResponse
    {
        $filters = $request->only(['from', 'to', 'province_id', 'district_id']);
        return response()->json($this->dashboardService->getCrimeTypeDistribution($filters));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dashboard/reports-by-period",
     *     tags={"Dashboard"},
     *     summary="Reportes agrupados por período",
     *     @OA\Parameter(name="period", in="query", @OA\Schema(type="string", enum={"day","week","month"})),
     *     @OA\Parameter(name="from", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="to", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Response(response=200, description="Reportes por período")
     * )
     */
    public function reportsByPeriod(Request $request): JsonResponse
    {
        $period = $request->input('period', 'day');
        $from = $request->input('from');
        $to = $request->input('to');
        return response()->json($this->dashboardService->getReportsByPeriod($period, $from, $to));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dashboard/zone-stats",
     *     tags={"Dashboard"},
     *     summary="Estadísticas por zona",
     *     @OA\Response(response=200, description="Estadísticas de zonas")
     * )
     */
    public function zoneStats(): JsonResponse
    {
        return response()->json($this->dashboardService->getZoneStatistics());
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dashboard/full",
     *     tags={"Dashboard"},
     *     summary="Dashboard completo con todos los indicadores",
     *     @OA\Parameter(name="period", in="query", @OA\Schema(type="string", enum={"day","week","month"})),
     *     @OA\Parameter(name="from", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="to", in="query", @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="province_id", in="query", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="district_id", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Dashboard completo")
     * )
     */
    public function full(Request $request): JsonResponse
    {
        $filters = $request->only(['period', 'from', 'to', 'province_id', 'district_id']);
        return response()->json($this->dashboardService->getFullDashboard($filters));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dashboard/reports-by-province/{regionId}",
     *     tags={"Dashboard"},
     *     summary="Reportes agrupados por provincia",
     *     @OA\Parameter(name="regionId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Reportes por provincia")
     * )
     */
    public function reportsByProvince(int $regionId): JsonResponse
    {
        return response()->json($this->dashboardService->getReportsByProvince($regionId));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dashboard/reports-by-district/{provinceId}",
     *     tags={"Dashboard"},
     *     summary="Reportes agrupados por distrito",
     *     @OA\Parameter(name="provinceId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Reportes por distrito")
     * )
     */
    public function reportsByDistrict(int $provinceId): JsonResponse
    {
        return response()->json($this->dashboardService->getReportsByDistrict($provinceId));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dashboard/evolution",
     *     tags={"Dashboard"},
     *     summary="Evolución de reportes en el tiempo",
     *     @OA\Parameter(name="days", in="query", @OA\Schema(type="integer"), description="Número de días", example=30),
     *     @OA\Response(response=200, description="Evolución de reportes")
     * )
     */
    public function evolution(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        return response()->json($this->dashboardService->getEvolution($days));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/dashboard/critical-zones",
     *     tags={"Dashboard"},
     *     summary="Zonas críticas actuales",
     *     @OA\Response(response=200, description="Zonas críticas")
     * )
     */
    public function criticalZones(): JsonResponse
    {
        $summary = $this->dashboardService->getSummary();
        return response()->json($summary['critical_zones']);
    }
}
