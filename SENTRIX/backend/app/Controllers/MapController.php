<?php

namespace App\Controllers;

use App\Services\MapService;
use App\Services\HeatmapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Mapa", description="Consulta de mapa, zonas de riesgo y regiones")
 */
class MapController extends Controller
{
    public function __construct(
        private MapService $mapService,
        private HeatmapService $heatmapService,
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/map/risk-zones",
     *     tags={"Mapa"},
     *     summary="Obtener zonas de riesgo en un área geográfica",
     *     @OA\Parameter(name="north", in="query", required=true, @OA\Schema(type="number"), example=-5.0),
     *     @OA\Parameter(name="south", in="query", required=true, @OA\Schema(type="number"), example=-5.5),
     *     @OA\Parameter(name="east", in="query", required=true, @OA\Schema(type="number"), example=-80.0),
     *     @OA\Parameter(name="west", in="query", required=true, @OA\Schema(type="number"), example=-81.0),
     *     @OA\Response(response=200, description="Lista de zonas de riesgo"),
     *     @OA\Response(response=422, description="Parámetros inválidos")
     * )
     */
    public function getRiskZones(Request $request): JsonResponse
    {
        $request->validate([
            'north' => 'required|numeric',
            'south' => 'required|numeric',
            'east' => 'required|numeric',
            'west' => 'required|numeric',
        ]);

        $zones = $this->mapService->getRiskZones(
            $request->north, $request->south, $request->east, $request->west
        );

        return response()->json($zones);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/map/heatmap",
     *     tags={"Mapa"},
     *     summary="Obtener datos para mapa de calor",
     *     @OA\Parameter(name="north", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="south", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="east", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="west", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="zoom", in="query", required=true, @OA\Schema(type="integer", minimum=1, maximum=20)),
     *     @OA\Response(response=200, description="Grid de puntos con score de riesgo"),
     *     @OA\Response(response=422, description="Parámetros inválidos")
     * )
     */
    public function getHeatmap(Request $request): JsonResponse
    {
        $request->validate([
            'north' => 'required|numeric',
            'south' => 'required|numeric',
            'east' => 'required|numeric',
            'west' => 'required|numeric',
            'zoom' => 'required|integer|min:1|max:20',
        ]);

        $data = $this->heatmapService->getHeatmapData(
            $request->north, $request->south, $request->east, $request->west, $request->zoom
        );

        return response()->json($data);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/map/heatmap/tile/{z}/{x}/{y}",
     *     tags={"Mapa"},
     *     summary="Obtener datos de heatmap para un tile específico (Slippy Map)",
     *     @OA\Parameter(name="z", in="path", required=true, @OA\Schema(type="integer", minimum=1, maximum=20)),
     *     @OA\Parameter(name="x", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="y", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Grid de puntos KDE para el tile"),
     *     @OA\Response(response=404, description="Tile fuera de rango")
     * )
     */
    public function getHeatmapTile(int $z, int $x, int $y): JsonResponse
    {
        $maxTile = (2 ** $z) - 1;
        if ($x < 0 || $x > $maxTile || $y < 0 || $y > $maxTile) {
            return response()->json(['error' => 'Tile coordinates out of range'], 404);
        }

        $data = $this->heatmapService->getHeatmapByTile($z, $x, $y);
        return response()->json($data);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/map/clusters",
     *     tags={"Mapa"},
     *     summary="Obtener clusters de zonas de riesgo",
     *     @OA\Parameter(name="north", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="south", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="east", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="west", in="query", required=true, @OA\Schema(type="number")),
     *     @OA\Parameter(name="zoom", in="query", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Clusters agrupados por celda"),
     *     @OA\Response(response=422, description="Parámetros inválidos")
     * )
     */
    public function getClusters(Request $request): JsonResponse
    {
        $request->validate([
            'north' => 'required|numeric',
            'south' => 'required|numeric',
            'east' => 'required|numeric',
            'west' => 'required|numeric',
            'zoom' => 'required|integer|min:1|max:20',
        ]);

        $clusters = $this->mapService->getClusters(
            $request->north, $request->south, $request->east, $request->west, $request->zoom
        );

        return response()->json($clusters);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/map/regions",
     *     tags={"Mapa"},
     *     summary="Listar regiones disponibles",
     *     @OA\Response(response=200, description="Lista de regiones")
     * )
     */
    public function getRegions(): JsonResponse
    {
        return response()->json($this->mapService->getRegions());
    }

    /**
     * @OA\Get(
     *     path="/api/v1/map/provinces/{regionId}",
     *     tags={"Mapa"},
     *     summary="Listar provincias de una región",
     *     @OA\Parameter(name="regionId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Lista de provincias")
     * )
     */
    public function getProvinces(int $regionId): JsonResponse
    {
        return response()->json($this->mapService->getProvinces($regionId));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/map/districts/{provinceId}",
     *     tags={"Mapa"},
     *     summary="Listar distritos de una provincia",
     *     @OA\Parameter(name="provinceId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Lista de distritos")
     * )
     */
    public function getDistricts(int $provinceId): JsonResponse
    {
        return response()->json($this->mapService->getDistricts($provinceId));
    }
}
