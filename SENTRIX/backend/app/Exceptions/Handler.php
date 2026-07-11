<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = ['current_password', 'password', 'password_confirmation'];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {});
    }

    public function render($request, Throwable $e): JsonResponse|\Illuminate\Http\Response
    {
        if ($request->is('api/*') || $request->expectsJson()) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    private function handleApiException(Request $request, Throwable $e): JsonResponse
    {
        return match (true) {
            $e instanceof ValidationException => $this->validationError($e),
            $e instanceof AuthenticationException => $this->unauthenticated($request, $e),
            $e instanceof ModelNotFoundException => $this->notFound('Recurso no encontrado.'),
            $e instanceof NotFoundHttpException => $this->notFound('Ruta no encontrada.'),
            $e instanceof AccessDeniedHttpException => $this->forbidden('No autorizado para esta acción.'),
            default => $this->serverError($e),
        };
    }

    private function validationError(ValidationException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Error de validación.',
            'errors' => $e->errors(),
        ], 422);
    }

    protected function unauthenticated($request, AuthenticationException $e): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'No autenticado. Token inválido o expirado.',
        ], 401);
    }

    private function notFound(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 404);
    }

    private function forbidden(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 403);
    }

    private function serverError(Throwable $e): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => 'Error interno del servidor.',
        ];

        if (config('app.debug')) {
            $response['exception'] = get_class($e);
            $response['message'] = $e->getMessage();
            $response['trace'] = $e->getTraceAsString();
        }

        return response()->json($response, 500);
    }
}
