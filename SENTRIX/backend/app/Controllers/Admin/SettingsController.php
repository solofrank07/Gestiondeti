<?php

namespace App\Controllers\Admin;

use App\Controllers\Controller;
use App\Interfaces\SettingRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Administración - Configuración", description="Configuración del sistema")
 */
class SettingsController extends Controller
{
    public function __construct(private SettingRepositoryInterface $settingRepo) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/settings",
     *     tags={"Administración - Configuración"},
     *     summary="Listar configuraciones (Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista de configuraciones"),
     *     @OA\Response(response=403, description="No autorizado")
     * )
     */
    public function index(): JsonResponse
    {
        return response()->json($this->settingRepo->all());
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/settings",
     *     tags={"Administración - Configuración"},
     *     summary="Actualizar configuración (Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"key","value"},
     *             @OA\Property(property="key", type="string"),
     *             @OA\Property(property="value", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Configuración actualizada"),
     *     @OA\Response(response=403, description="No autorizado")
     * )
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string|max:100',
            'value' => 'required',
        ]);

        $setting = $this->settingRepo->setValue($request->key, $request->value);
        return response()->json($setting);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/settings/{group}",
     *     tags={"Administración - Configuración"},
     *     summary="Obtener configuraciones por grupo (Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="group", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Configuraciones del grupo"),
     *     @OA\Response(response=403, description="No autorizado")
     * )
     */
    public function getGroup(string $group): JsonResponse
    {
        return response()->json($this->settingRepo->getByGroup($group));
    }

    public function public(): JsonResponse
    {
        return response()->json($this->settingRepo->getPublicSettings());
    }
}
