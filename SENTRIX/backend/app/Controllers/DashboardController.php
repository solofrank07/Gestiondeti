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

    public function statistics(Request $request): JsonResponse
    {
        $filters = $request->only(['from', 'to', 'province_id', 'district_id']);
        return response()->json($this->dashboardService->getStatistics($filters));
    }

    public function crimeTypes(Request $request): JsonResponse
    {
        $filters = $request->only(['from', 'to', 'province_id', 'district_id']);
        return response()->json($this->dashboardService->getCrimeTypeDistribution($filters));
    }

    public function reportsByPeriod(Request $request): JsonResponse
    {
        $period = $request->input('period', 'day');
        $from = $request->input('from');
        $to = $request->input('to');
        return response()->json($this->dashboardService->getReportsByPeriod($period, $from, $to));
    }

    public function zoneStats(): JsonResponse
    {
        return response()->json($this->dashboardService->getZoneStatistics());
    }

    public function full(Request $request): JsonResponse
    {
        $filters = $request->only(['period', 'from', 'to', 'province_id', 'district_id']);
        return response()->json($this->dashboardService->getFullDashboard($filters));
    }

    public function reportsByProvince(int $regionId): JsonResponse
    {
        return response()->json($this->dashboardService->getReportsByProvince($regionId));
    }

    public function reportsByDistrict(int $provinceId): JsonResponse
    {
        return response()->json($this->dashboardService->getReportsByDistrict($provinceId));
    }

    public function evolution(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        return response()->json($this->dashboardService->getEvolution($days));
    }

    public function criticalZones(): JsonResponse
    {
        $summary = $this->dashboardService->getSummary();
        return response()->json($summary['critical_zones']);
    }
}
