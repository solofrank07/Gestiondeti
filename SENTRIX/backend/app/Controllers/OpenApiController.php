<?php

namespace App\Controllers;

/**
 * @OA\Schema(
 *     schema="User",
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="name", type="string"),
 *     @OA\Property(property="email", type="string", format="email"),
 *     @OA\Property(property="phone", type="string", nullable=true),
 *     @OA\Property(property="photo", type="string", nullable=true),
 *     @OA\Property(property="document_type", type="string", nullable=true),
 *     @OA\Property(property="document_number", type="string", nullable=true),
 *     @OA\Property(property="last_lat", type="number", nullable=true),
 *     @OA\Property(property="last_lng", type="number", nullable=true),
 *     @OA\Property(property="last_active_at", type="string", nullable=true),
 *     @OA\Property(property="is_active", type="boolean"),
 *     @OA\Property(property="roles", type="array", @OA\Items(type="object")),
 *     @OA\Property(property="created_at", type="string")
 * )
 *
 * @OA\Info(
 *     title="SENTRIX API",
 *     version="1.0.0",
 *     description="API del Sistema Inteligente de Vigilancia Territorial (SENTRIX).

# SENTRIX — Sis**t**ema Inteligente de Vigilancia T**errit**orial

API REST para la identificación y monitoreo de áreas de riesgo mediante geolocalización e inteligencia artificial.

## Autenticación
La API utiliza tokens Bearer (Sanctum). Para obtener un token, registra un usuario o inicia sesión.

## Roles
- **Visitante**: Solo lectura de mapa, heatmap y zonas de riesgo
- **Ciudadano**: Usuario registrado que puede reportar incidentes
- **Autoridad** (PNP/Serenazgo): Acceso a dashboard y gestión
- **Administrador**: Control total del sistema

## Versiones
Actualmente: `v1`. Las rutas tienen el prefijo `/api/v1/`.",

 *     @OA\Contact(
 *         email="soporte@sentrix.pe"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="Servidor SENTRIX"
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8000",
 *     description="Servidor local de desarrollo"
 * )
 *
 * @OA\SecurityScheme(
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     securityScheme="bearerAuth"
 * )
 *
 * @OA\Schema(
 *     schema="Error",
 *     @OA\Property(property="success", type="boolean", example=false),
 *     @OA\Property(property="message", type="string", example="Mensaje de error"),
 *     @OA\Property(property="errors", type="object", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="Pagination",
 *     @OA\Property(property="current_page", type="integer"),
 *     @OA\Property(property="data", type="array", @OA\Items(type="object")),
 *     @OA\Property(property="first_page_url", type="string"),
 *     @OA\Property(property="from", type="integer"),
 *     @OA\Property(property="last_page", type="integer"),
 *     @OA\Property(property="last_page_url", type="string"),
 *     @OA\Property(property="links", type="array", @OA\Items(type="object")),
 *     @OA\Property(property="next_page_url", type="string", nullable=true),
 *     @OA\Property(property="path", type="string"),
 *     @OA\Property(property="per_page", type="integer"),
 *     @OA\Property(property="prev_page_url", type="string", nullable=true),
 *     @OA\Property(property="to", type="integer"),
 *     @OA\Property(property="total", type="integer")
 * )
 *
 * @OA\Response(
 *     response="ValidationError",
 *     description="Error de validación",
 *     @OA\JsonContent(
 *         @OA\Property(property="success", type="boolean", example=false),
 *         @OA\Property(property="message", type="string", example="Error de validación."),
 *         @OA\Property(property="errors", type="object", example={"email": {"El campo email es obligatorio."}})
 *     )
 * )
 *
 * @OA\Response(
 *     response="Unauthenticated",
 *     description="No autenticado",
 *     @OA\JsonContent(
 *         @OA\Property(property="success", type="boolean", example=false),
 *         @OA\Property(property="message", type="string", example="No autenticado.")
 *     )
 * )
 *
 * @OA\Response(
 *     response="Forbidden",
 *     description="No autorizado",
 *     @OA\JsonContent(
 *         @OA\Property(property="success", type="boolean", example=false),
 *         @OA\Property(property="message", type="string", example="No autorizado para esta acción.")
 *     )
 * )
 *
 * @OA\Response(
 *     response="NotFound",
 *     description="Recurso no encontrado",
 *     @OA\JsonContent(
 *         @OA\Property(property="success", type="boolean", example=false),
 *         @OA\Property(property="message", type="string", example="Recurso no encontrado.")
 *     )
 * )
 *
 * @OA\Response(
 *     response="RegisterResponse",
 *     description="Usuario registrado exitosamente",
 *     @OA\JsonContent(
 *         @OA\Property(property="message", type="string", example="Usuario registrado correctamente."),
 *         @OA\Property(property="user", ref="#/components/schemas/User"),
 *         @OA\Property(property="token", type="string", example="1|abc123..."),
 *         @OA\Property(property="token_type", type="string", example="Bearer")
 *     )
 * )
 *
 * @OA\Response(
 *     response="LoginResponse",
 *     description="Inicio de sesión exitoso",
 *     @OA\JsonContent(
 *         @OA\Property(property="message", type="string", example="Inicio de sesión exitoso."),
 *         @OA\Property(property="user", ref="#/components/schemas/User"),
 *         @OA\Property(property="token", type="string", example="1|abc123..."),
 *         @OA\Property(property="token_type", type="string", example="Bearer")
 *     )
 * )
 */
class OpenApiController
{
}
