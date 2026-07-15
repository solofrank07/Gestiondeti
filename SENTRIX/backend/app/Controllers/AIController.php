<?php

namespace App\Controllers;

use App\Models\Report;
use App\Models\RiskZone;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="AI", description="Heurísticas locales de inteligencia artificial")
 */
class AIController extends Controller
{
    public function __construct(private AIService $aiService) {}

    public function classifyReport(int $reportId): JsonResponse
    {
        $report = Report::findOrFail($reportId);
        return response()->json($this->aiService->classifyReport($report));
    }

    public function detectPatterns(): JsonResponse
    {
        $reports = Report::where('incident_date', '>=', now()->subDays(90))->get();
        return response()->json($this->aiService->detectPatterns($reports));
    }

    public function predictRiskZone(int $zoneId): JsonResponse
    {
        $zone = RiskZone::findOrFail($zoneId);
        return response()->json($this->aiService->predictRiskScore($zone));
    }

    public function safeRoute(Request $request): JsonResponse
    {
        $request->validate([
            'from_lat' => 'required|numeric|between:-90,90',
            'from_lng' => 'required|numeric|between:-180,180',
            'to_lat'   => 'required|numeric|between:-90,90',
            'to_lng'   => 'required|numeric|between:-180,180',
        ]);

        return response()->json($this->aiService->recommendSafeRoute(
            $request->from_lat, $request->from_lng,
            $request->to_lat, $request->to_lng,
        ));
    }

    public function detectFalseReport(int $reportId): JsonResponse
    {
        $report = Report::findOrFail($reportId);
        return response()->json($this->aiService->detectFalseReport($report));
    }

    public function predictCriticalZones(): JsonResponse
    {
        return response()->json($this->aiService->predictCriticalZones());
    }

    public function insights(): JsonResponse
    {
        $reports = Report::where('incident_date', '>=', now()->subDays(90))->get();
        $patterns = $this->aiService->detectPatterns($reports);
        $critical = $this->aiService->predictCriticalZones();

        return response()->json([
            'patterns'     => $patterns['patterns'],
            'critical'     => $critical,
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}
