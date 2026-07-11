<?php

namespace App\Controllers\Admin;

use App\Controllers\Controller;
use App\Interfaces\UserRepositoryInterface;
use App\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Administración - Usuarios", description="Gestión de usuarios del sistema")
 */
class UserController extends Controller
{
    public function __construct(private UserRepositoryInterface $userRepo) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/users",
     *     tags={"Administración - Usuarios"},
     *     summary="Listar usuarios (Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer"), example=20),
     *     @OA\Response(response=200, description="Lista paginada de usuarios"),
     *     @OA\Response(response=403, description="No autorizado")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $users = $this->userRepo->paginate($perPage);
        return response()->json(UserResource::collection($users));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/users/{id}",
     *     tags={"Administración - Usuarios"},
     *     summary="Ver detalle de usuario (Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detalle del usuario"),
     *     @OA\Response(response=404, description="No encontrado")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->userRepo->findWithRoles($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }
        return response()->json(UserResource::make($user));
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/users/{id}/role",
     *     tags={"Administración - Usuarios"},
     *     summary="Actualizar rol de usuario (Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"role"},
     *             @OA\Property(property="role", type="string", enum={"Ciudadano","Autoridad","Administrador"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Rol actualizado"),
     *     @OA\Response(response=404, description="No encontrado")
     * )
     */
    public function updateRole(Request $request, int $id): JsonResponse
    {
        $request->validate(['role' => 'required|string|exists:roles,name']);
        $user = $this->userRepo->findWithRoles($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }
        $role = \App\Models\Role::where('name', $request->role)->first();
        $user->roles()->sync([$role->id]);
        return response()->json(UserResource::make($user->fresh('roles')));
    }
}
