<?php

namespace App\Controllers\Admin;

use App\Controllers\Controller;
use App\Interfaces\RiskZoneRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RiskZoneController extends Controller
{
    public function __construct(private RiskZoneRepositoryInterface $riskZoneRepo) {}

    public function index(): JsonResponse
    {
        $zones = $this->riskZoneRepo->getActiveZones();
        return response()->json($zones);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|numeric|min:10|max:10000',
            'risk_score' => 'nullable|numeric|between:0,100',
            'risk_level_id' => 'nullable|exists:risk_levels,id',
            'is_active' => 'nullable|boolean',
        ]);

        $zone = $this->riskZoneRepo->create($validated);
        return response()->json($zone, 201);
    }

    public function show(int $id): JsonResponse
    {
        $zone = $this->riskZoneRepo->find($id);
        if (!$zone) {
            return response()->json(['message' => 'Zona no encontrada.'], 404);
        }
        return response()->json($zone->load('riskLevel'));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'radius_meters' => 'sometimes|numeric|min:10|max:10000',
            'risk_score' => 'nullable|numeric|between:0,100',
            'risk_level_id' => 'nullable|exists:risk_levels,id',
            'is_active' => 'nullable|boolean',
        ]);

        $zone = $this->riskZoneRepo->update($id, $validated);
        return response()->json($zone);
    }

    public function destroy(int $id): JsonResponse
    {
        $zone = $this->riskZoneRepo->find($id);
        if (!$zone) {
            return response()->json(['message' => 'Zona no encontrada.'], 404);
        }
        $zone->update(['is_active' => false]);
        return response()->json(['message' => 'Zona desactivada.']);
    }

    public function riskLevels(Request $request): JsonResponse
    {
        $levels = \App\Models\RiskLevel::all();
        return response()->json($levels);
    }
}
