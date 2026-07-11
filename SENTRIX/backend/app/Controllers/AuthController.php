<?php

namespace App\Controllers;

use App\Requests\RegisterRequest;
use App\Requests\LoginRequest;
use App\Requests\UpdateProfileRequest;
use App\Requests\ChangePasswordRequest;
use App\Requests\ForgotPasswordRequest;
use App\Requests\ResetPasswordRequest;
use App\Requests\RefreshTokenRequest;
use App\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Autenticación", description="Registro, inicio de sesión y gestión de tokens")
 */
class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    /**
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     tags={"Autenticación"},
     *     summary="Registrar nuevo usuario",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", example="Juan Pérez"),
     *             @OA\Property(property="email", type="string", format="email", example="juan@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="SecurePass123!"),
     *             @OA\Property(property="password_confirmation", type="string", example="SecurePass123!"),
     *             @OA\Property(property="phone", type="string", example="987654321"),
     *             @OA\Property(property="document_type", type="string", enum={"dni","ce","passport"}, example="dni"),
     *             @OA\Property(property="document_number", type="string", example="12345678")
     *         )
     *     ),
     *     @OA\Response(response=201, ref="#/components/responses/RegisterResponse"),
     *     @OA\Response(response=422, ref="#/components/responses/ValidationError")
     * )
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());
        return response()->json([
            'message' => 'Usuario registrado correctamente.',
            'user' => UserResource::make($result['user']),
            'token' => $result['token'],
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     tags={"Autenticación"},
     *     summary="Iniciar sesión",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="juan@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="SecurePass123!")
     *         )
     *     ),
     *     @OA\Response(response=200, ref="#/components/responses/LoginResponse"),
     *     @OA\Response(response=422, ref="#/components/responses/ValidationError")
     * )
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->email, $request->password);
        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'user' => UserResource::make($result['user']),
            'token' => $result['token'],
            'token_type' => $result['token_type'],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/logout",
     *     tags={"Autenticación"},
     *     summary="Cerrar sesión",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Sesión cerrada correctamente"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());
        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/logout-all",
     *     tags={"Autenticación"},
     *     summary="Cerrar sesión en todos los dispositivos",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Sesión cerrada en todos los dispositivos"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $this->authService->logoutAllDevices($request->user());
        return response()->json(['message' => 'Sesión cerrada en todos los dispositivos.']);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/refresh",
     *     tags={"Autenticación"},
     *     summary="Renovar token de acceso",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token"},
     *             @OA\Property(property="token", type="string", example="token_expirado_a_renovar")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Token renovado exitosamente"),
     *     @OA\Response(response=422, description="Token inválido")
     * )
     */
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        $result = $this->authService->refreshToken($request->token);
        return response()->json([
            'user' => UserResource::make($result['user']),
            'token' => $result['token'],
            'token_type' => $result['token_type'],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/auth/profile",
     *     tags={"Autenticación"},
     *     summary="Obtener perfil del usuario autenticado",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Perfil del usuario"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function profile(Request $request): JsonResponse
    {
        return response()->json(UserResource::make($request->user()->load('roles')));
    }

    /**
     * @OA\Put(
     *     path="/api/v1/auth/profile",
     *     tags={"Autenticación"},
     *     summary="Actualizar perfil del usuario",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Juan Actualizado"),
     *             @OA\Property(property="phone", type="string", example="987654322"),
     *             @OA\Property(property="photo", type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Perfil actualizado"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->authService->updateProfile($request->user(), $request->validated());
        return response()->json(UserResource::make($user));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/change-password",
     *     tags={"Autenticación"},
     *     summary="Cambiar contraseña",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password","new_password","new_password_confirmation"},
     *             @OA\Property(property="current_password", type="string", format="password"),
     *             @OA\Property(property="new_password", type="string", format="password"),
     *             @OA\Property(property="new_password_confirmation", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Contraseña actualizada"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $this->authService->changePassword(
            $request->user(),
            $request->current_password,
            $request->new_password
        );
        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/forgot-password",
     *     tags={"Autenticación"},
     *     summary="Solicitar restablecimiento de contraseña",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="juan@example.com")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Email enviado si existe"),
     *     @OA\Response(response=422, description="Email no registrado")
     * )
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $token = $this->authService->forgotPassword($request->email);
        return response()->json([
            'message' => 'Si el email existe, recibirás un enlace para restablecer tu contraseña.',
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/reset-password",
     *     tags={"Autenticación"},
     *     summary="Restablecer contraseña con token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","token","password","password_confirmation"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="token", type="string"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="password_confirmation", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Contraseña restablecida"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword($request->validated());
        return response()->json(['message' => 'Contraseña restablecida correctamente.']);
    }
}
