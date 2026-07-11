<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(mixed $data = null, string $message = '', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    public static function created(mixed $data = null, string $message = 'Recurso creado exitosamente.'): JsonResponse
    {
        return self::success($data, $message, 201);
    }

    public static function noContent(string $message = 'Operación exitosa.'): JsonResponse
    {
        return self::success(null, $message, 200);
    }

    public static function error(string $message, int $code = 400, mixed $errors = null): JsonResponse
    {
        $response = ['success' => false, 'message' => $message];
        if ($errors) {
            $response['errors'] = $errors;
        }
        return response()->json($response, $code);
    }

    public static function notFound(string $message = 'Recurso no encontrado.'): JsonResponse
    {
        return self::error($message, 404);
    }

    public static function unauthorized(string $message = 'No autorizado.'): JsonResponse
    {
        return self::error($message, 401);
    }

    public static function forbidden(string $message = 'No tienes permisos para esta acción.'): JsonResponse
    {
        return self::error($message, 403);
    }

    public static function validationError(mixed $errors, string $message = 'Error de validación.'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], 422);
    }
}
