# SENTRIX — Arquitectura del Proyecto

> **Fecha:** 2026-07-14
> **Versión:** 1.0.0
> **Monorepo:** Laravel 13.x (backend) + React Native / Expo 52 (frontend)

---

## Índice

1. [Visión General](#1-visión-general)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Backend — Laravel](#3-backend--laravel)
   - 3.1 [Arquitectura General](#31-arquitectura-general)
   - 3.2 [Módulo de Auth y Usuarios](#32-módulo-de-auth-y-usuarios)
   - 3.3 [Módulo de Reportes](#33-módulo-de-reportes)
   - 3.4 [Módulo de Mapa, Heatmap y Zonas de Riesgo](#34-módulo-de-mapa-heatmap-y-zonas-de-riesgo)
   - 3.5 [Módulo de Geocercas (Geofencing)](#35-módulo-de-geocercas-geofencing)
   - 3.6 [Módulo de IA (Heurísticas Locales)](#36-módulo-de-ia-heurísticas-locales)
   - 3.7 [Módulo de Pánico (PanicAlert)](#37-módulo-de-pánico-panicalert)
   - 3.8 [Módulo de Dashboard](#38-módulo-de-dashboard)
   - 3.9 [Módulo ETL](#39-módulo-etl)
   - 3.10 [Módulo de Configuraciones (Settings)](#310-módulo-de-configuraciones-settings)
   - 3.11 [Comandos de Consola](#311-comandos-de-consola)
   - 3.12 [Notificaciones](#312-notificaciones)
   - 3.13 [Base de Datos — Esquema Completo](#313-base-de-datos--esquema-completo)
4. [Frontend — React Native / Expo](#4-frontend--react-native--expo)
   - 4.1 [Arquitectura General](#41-arquitectura-general)
   - 4.2 [Estructura de Rutas (Expo Router)](#42-estructura-de-rutas-expo-router)
   - 4.3 [Servicios API](#43-servicios-api)
   - 4.4 [Estado Global (Zustand)](#44-estado-global-zustand)
   - 4.5 [Contextos](#45-contextos)
   - 4.6 [Hooks](#46-hooks)
   - 4.7 [Pantallas por Módulo](#47-pantallas-por-módulo)
   - 4.8 [Componentes Compartidos](#48-componentes-compartidos)
5. [Mapa de Rutas API (Backend → Frontend)](#5-mapa-de-rutas-api-backend--frontend)
6. [Flujos Críticos](#6-flujos-críticos)
7. [Base de Datos — Diagrama de Relaciones](#7-base-de-datos--diagrama-de-relaciones)
8. [Problemas Detectados](#8-problemas-detectados)
   - 8.1 [Bloqueantes](#81-bloqueantes)
   - 8.2 [Altos](#82-altos)
   - 8.3 [Medios](#83-medios)
   - 8.4 [Bajos / Nits](#84-bajos--nits)
9. [Funcionalidades Faltantes vs Rutas Definidas](#9-funcionalidades-faltantes-vs-rutas-definidas)
10. [Cobertura de Tests](#10-cobertura-de-tests)
11. [Recomendaciones](#11-recomendaciones)

---

## 1. Visión General

SENTRIX es un sistema de seguridad ciudadana con mapa de calor de riesgo delictivo, reportes de incidentes, geocercas, alertas de pánico y dashboard analítico. Orientado a Perú (región Piura como piloto).

**Stack:**

| Capa | Tecnología |
|------|-----------|
| Backend | Laravel 13.x / PHP 8.3 |
| Frontend | React Native / Expo 52 (TypeScript) |
| Base de Datos | MySQL (con soporte de migraciones Laravel) |
| Cache | Array / SQLite en tests, Redis/MySQL en prod |
| Auth | Laravel Sanctum (tokens de API) |
| Mapas | MapLibre GL (frontend) + KDE server-side (backend) |
| Cola | sync (dev), Redis (prod configurado) |
| Localización | Español (`es`, `es_PE`) |

---

## 2. Estructura del Proyecto

```
SENTRIX/
├── AGENTS.md                     # Guía del agente IA
├── ARCHITECTURE.md               # Este documento
├── RADIUS_ADJUSTABLE_CONTEXT.md  # Documento de contexto de radio ajustable
├── backend/                      # Laravel 13.x API
│   ├── app/
│   │   ├── Controllers/          # Controladores (namespace App\Controllers)
│   │   │   ├── Admin/           # Controladores admin (ETL, Settings, Users, RiskZones, Reports)
│   │   │   ├── AuthController.php
│   │   │   ├── AIController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── GeofenceController.php
│   │   │   ├── MapController.php
│   │   │   ├── PanicController.php
│   │   │   ├── ReportController.php
│   │   │   └── OpenApiController.php
│   │   ├── Enums/               # 8 enums (UserRole, RiskLevel, ReportStatus, etc.)
│   │   ├── Exceptions/          # Handler de errores API
│   │   ├── Helpers/             # GeoHelper
│   │   ├── Http/
│   │   │   ├── Controllers/     # Solo Controller.php base
│   │   │   ├── Requests/        # Form requests de validación
│   │   │   └── Resources/       # API Resources
│   │   ├── Interfaces/          # 10 interfaces de repositorios
│   │   ├── Middleware/           # JwtMiddleware (no usado) + RoleMiddleware
│   │   ├── Models/              # 27 modelos Eloquent
│   │   ├── Notifications/       # 4 notificaciones
│   │   ├── Policies/            # ReportPolicy
│   │   ├── Providers/           # AppServiceProvider + RepositoryServiceProvider
│   │   ├── Repositories/        # 10 repositorios + BaseRepository
│   │   ├── Resources/           # 5 API resources
│   │   ├── Services/            # 13 servicios
│   │   └── Traits/              # ApiResponse trait
│   ├── config/                  # 15 configuraciones
│   ├── database/
│   │   ├── factories/           # UserFactory
│   │   ├── migrations/          # 39 migraciones
│   │   └── seeders/             # 7 seeders
│   ├── routes/
│   │   ├── api.php              # API v1 (126 líneas)
│   │   ├── web.php
│   │   └── console.php
│   ├── tests/
│   │   ├── Feature/Auth/        # AuthTest.php (14 tests)
│   │   └── Unit/                # ExampleTest.php
│   └── composer.json
│
└── frontend/                    # React Native / Expo 52
    ├── app/                     # Expo Router (file-based)
    │   ├── _layout.tsx          # Root layout (providers)
    │   ├── index.tsx            # Entry redirect
    │   ├── (auth)/              # Login, Register, ForgotPassword
    │   ├── (tabs)/              # Mapa, Alertas, Perfil
    │   ├── (admin)/             # Dashboard, ETL, ZonasRiesgo, Reportes
    │   ├── (report)/            # Multi-step report creation
    │   └── (onboarding)/        # Onboarding screen
    └── src/
        ├── components/          # shared/, map/, charts/
        ├── constants/           # api.ts, colors.ts
        ├── contexts/            # AuthContext, LocationContext
        ├── hooks/               # 8 hooks (useAuth, useReports, useGeofence, etc.)
        ├── screens/             # 21 pantallas (auth, reports, map, admin, dashboard, ai, profile)
        ├── services/            # 11 servicios API
        ├── store/               # 3 Zustand stores (auth, map, report)
        └── types/               # 4 archivos de tipos TS
```

---

## 3. Backend — Laravel

### 3.1 Arquitectura General

**Patrón:** `Controller → Service → Repository (Interface) → Model`

```
Request → Middleware (auth:sanctum + RoleMiddleware)
  → Controller (validación vía FormRequest)
    → Service (lógica de negocio)
      → RepositoryInterface (contrato)
        → Repository (implementación Eloquent)
          → Model (Eloquent ORM)
```

- **Namespace custom:** `App\Controllers\` (NO `App\Http\Controllers\`).
- Todas las interfaces en `App\Interfaces\`, implementaciones en `App\Repositories\`.
- Bindings en `RepositoryServiceProvider`.
- **13 servicios**, **10 repositorios**, **27 modelos**, **8 enums**.
- **39 migraciones**, **7 seeders**.

### 3.2 Módulo de Auth y Usuarios

**Archivos:** AuthController, AuthService, JwtMiddleware (muerto), RoleMiddleware, User, Role, 7 FormRequests, UserRepository, RoleRepository.

**Roles (many-to-many via `user_roles`):**

| Rol | Acceso |
|-----|--------|
| `Ciudadano` | Crear reportes, ver mapa, pánico |
| `Autoridad` | Dashboard, verificar/rechazar reportes, atender pánico |
| `Administrador` | CRUD usuarios, ETL, settings, zonas de riesgo |

**Flujo de Registro:**
1. `POST /api/v1/auth/register` → `RegisterRequest` (name, email, password, phone, document)
2. `AuthService::register()` → `UserRepository::create()` (password hasheado vía `Hash::make()`)
3. Asigna rol `Ciudadano` por defecto via `$user->roles()->attach()`
4. Crea token Sanctum con abilities del rol
5. Retorna `{user, token, token_type: "Bearer"}`

**Flujo de Login:**
1. `POST /api/v1/auth/login` → `LoginRequest` (email, password)
2. `UserRepository::findByEmail()` + `Hash::check()`
3. Actualiza `last_active_at`
4. Crea token Sanctum con abilities = nombres de roles
5. Retorna `{user (con roles), token}`

**Token:**
- Sanctum (`config/sanctum.php`): expiración 1440 min (24h), prefijo `sentrix_`
- Refresh: elimina token anterior, crea nuevo con mismas abilities
- Abilities = nombres de roles al momento de creación (no se usan para autorización)

**Middleware:**
- `auth:sanctum` — middleware nativo de Laravel
- `RoleMiddleware` — verifica `$user->hasRole($role)`. Registrado como alias `role`.
- `JwtMiddleware` — **NUNCA registrado** en `bootstrap/app.php`. Código muerto.

**Password Reset:**
- `POST /auth/forgot-password` → `Password::createToken()` + email notification
- `POST /auth/reset-password` → `Password::reset()` con callback
- ⚠️ `ForgotPasswordRequest` usa `exists:users,email` — **enumera usuarios**

**Esquema DB — users:**
```sql
id, name, email (unique), password, phone, photo, document_type, document_number,
last_lat(10,7), last_lng(10,7), last_active_at, is_active, deleted_at (soft delete)
```

**Esquema DB — roles:** id, name (unique), description
**Esquema DB — user_roles:** user_id FK, role_id FK, UNIQUE(user_id, role_id)

**Problemas detectados:**
- 🔴 **Migración duplicada de `users`**: `0001_01_01_000000_create_users_table.php` (stock Laravel) y `2026_01_01_000001_create_users_table.php` (SENTRIX) crean la misma tabla. `php artisan migrate` falla.
- 🔴 **User enumeration via `exists:users,email`** en ForgotPasswordRequest y ResetPasswordRequest.
- 🟡 **JwtMiddleware es código muerto** — nunca registrado, no corre.
- 🟡 **Sin rate limiting** en endpoints de auth (login, register, forgot-password).
- 🟡 **Sin bloqueo por intentos fallidos**.
- 🟡 **Email verification desactivado** (`MustVerifyEmail` comentado).
- 🟡 **Roles hardcodeados como strings** — `UserRole` enum existe pero no se usa.
- 🟡 **Sin transacción** en registro (user + role + token son operaciones separadas).
- 🔵 **`UserResource` expone `last_lat/last_lng`** en todo perfil — privacidad.

### 3.3 Módulo de Reportes

**Archivos:** ReportController, Admin\ReportController, ReportService, Report, CitizenReport, OfficialReport, Category, CrimeType, ReportStatus, Media, StoreReportRequest, ReportRepository, MediaService.

**Tres tablas de reportes (NO polimórficas):**

| Tabla | Estado | Propósito |
|-------|--------|-----------|
| `reports` | ✅ **Activa** | Tabla canónica. Usada por toda la app. |
| `citizen_reports` | 💀 **Código muerto** | Tabla separada sin rutas activas. Migración `000032` intentó conectarla a `reports` via `report_id` FK nullable. |
| `official_reports` | 💀 **Código muerto** | Similar a citizen_reports. Solo la usa ETL para importación. |

**La app solo opera sobre `reports`.** Las otras dos son tablas huérfanas.

**CRUD de Reportes:**

| Ruta | Método | Auth | Función |
|------|--------|------|---------|
| `/reports/nearby` | GET | Público | Bounding-box query con cache 15min |
| `/reports` | GET | Sanctum | Listar propios (paginated) |
| `/reports/{id}` | GET | Sanctum | Detalle |
| `/reports` | POST | Sanctum | Crear + media |
| `/reports/{id}` | PUT | Sanctum | Actualizar |
| `/reports/{id}` | DELETE | Sanctum | Soft-delete |
| `/reports/{id}/verify` | POST | Autoridad+ | Verificar |
| `/reports/{id}/reject` | POST | Autoridad+ | Rechazar |
| `/admin/reports` | GET | Admin | Listar todos con filtros |

**Flujo de creación:**
1. `StoreReportRequest` valida datos + media (max 50MB, jpg/png/gif/mp4/mov/avi)
2. `ReportService::create()` setea `user_id`, defaults de title/description
3. `HotspotService::isHotspot()` — si el reporte está cerca de un hotspot existente:
   - Auto-aprueba (status=verificado, is_verified=true, auto_approved=true)
   - Promueve a hotspot existente o crea nuevo
4. Si no hay hotspot: status=pendiente
5. `MediaService::attach()` almacena archivos en `storage/app/public/media/reports/{id}/`

**Flujo de verificación:**
1. `verify()` → `ReportRepository::verify()` setea `is_verified=true, verified_at, verified_by`
2. `ReportService` setea `status_id=verificado, auto_approved=false`
3. Verifica hotspot proximity
4. ⚠️ `ReportVerified` notification **NUNCA se envía** — no hay `$user->notify()` en el código

**Nearby query:**
- `GET /reports/nearby?lat=&lng=&radius=` (público)
- Usa bounding-box (cuadrado, no círculo háversine)
- Cache 15 min (array, no Eloquent models)
- Solo retorna reportes aprobados/verificados

**Problemas detectados:**
- 🔴 **CitizenReport y OfficialReport son tablas huérfanas** — ocupan espacio, agregan complejidad sin beneficio
- 🟡 **`ReportVerified` notification definida pero nunca enviada**
- 🟡 **Sin autorización en `update()` y `destroy()`** — cualquier usuario autenticado puede modificar/borrar cualquier reporte por ID
- 🟡 **Sin FormRequest para update** — usa `$request->all()`, permite mass-assignment de `is_verified`, `verified_by`, `source`
- 🟡 **Sin endpoint de restore** para soft-deletes
- 🟡 **Admin\ReportController usa `Report::query()` directo**, rompe patrón repositorio
- 🟡 **`reporter_ip` nunca se popula**
- 🔵 **`resolveStatusId()` consulta DB cada vez** — sin cache
- 🔵 **`is_verified` semántica confusa** — un reporte rechazado tiene `is_verified=false` (indistinguible de no-revisado)

### 3.4 Módulo de Mapa, Heatmap y Zonas de Riesgo

**Archivos:** MapController, MapService, HeatmapService, HotspotService, RiskScoreService, RiskZone, RiskLevel, RiskHistory, HeatmapCache, Polygon, PolygonPoint, Region, Province, District, PopulationCenter, Urbanization, Sector.

**Jerarquía Geográfica (6 niveles):**

```
Región → Provincia → Distrito → Centro Poblado → Urbanización → Sector
```

- API expone solo niveles 1-3 (Región, Provincia, Distrito)
- RiskZone se relaciona con Sector (FK `sector_id`)
- Niveles 4-6 existen como modelos/migraciones pero **no tienen endpoints API**

**Zonas de Riesgo:**
- RiskZone: name, description, risk_score (decimal), risk_level_id, lat/lng, radius_meters, boundaries (JSON)
- Polygon + PolygonPoint: polígonos libres asociados a una zona
- RiskHistory: histórico de scores (tabla sin escritura — **nunca se escribe**)
- RiskLevel enum: `muy-bajo` (≤20), `bajo` (≤40), `medio` (≤60), `alto` (≤80), `critico` (≤100)

**Heatmap (KDE):**
- `HeatmapService::computeKdeGrid()` — Kernel Density Estimation con kernel gaussiano
- Grid size dependiente del zoom (4 en z1 → 1100 en z20)
- Bandwidth dependiente del zoom (100km en z1 → 0.15km en z20)
- Scores normalizados 0-100
- **Dos modos de consulta:**
  - `getHeatmapData(north, south, east, west, zoom)` — por bounding box
  - `getHeatmapByTile(z, x, y)` — por tile Slippy Map (XYZ)
- **Cache:** HeatmapCache table, TTL 15 min, clave = bounds exactos + zoom
- **Invalidación:** events `saved`/`deleted` de RiskZone → `clearByZoneBounds()`
- **Prewarm:** `prewarm:heatmap-cache` con tiles hardcodeados para Piura

**HotspotService:**
- `isHotspot(lat, lng)` — busca RiskZone más cercana dentro de 300m (configurable)
- `promoteToHotspot(Report)` — incrementa incident_count, escala risk_level
- Classification: medio (1-3), alto (4-8), critico (9+)

**RiskScoreService (9 factores):**

| Factor | Peso | Base |
|--------|------|------|
| Crime Count | 0.15 | Cantidad de reportes en zona |
| Severity | 0.20 | Peso promedio de tipos de delito |
| Recurrencia | 0.15 | Reportes/día + bonus |
| Nocturnidad | 0.10 | Ratio reportes nocturnos |
| Tendencia | 0.10 | Media 7d vs 23d |
| Densidad | 0.05 | Densidad de incidentes |
| Reportes ciudadanos | 0.15 | citizen_reports_count |
| Proximidad a críticos | 0.05 | Distancia a locations críticas (hospitales, comisarías) |
| Población | 0.05 | Densidad poblacional |

**Problemas detectados:**
- 🟡 **Niveles 4-6 geográficos sin API** — existen modelos pero no endpoints
- 🟡 **RiskHistory nunca se escribe** — tabla existe, migraciones OK, pero ningún servicio la popula
- 🟡 **Prewarm con tiles hardcodeados para Piura** — no configurable
- 🟡 **Cache heatmap por bounds exactos** — mínimo cambio de viewport = cache miss
- 🔵 **`getHeading()` en GeofencingService tiene bug** — mismo `lng` en ambos términos, siempre retorna 'N'

### 3.5 Módulo de Geocercas (Geofencing)

**Archivos:** GeofenceController, GeofencingService, GeofenceLogRepository, GeofenceLog.

**Constantes clave:**
- `ENTRY_LOOKUP_KM = 3` (radio de búsqueda)
- `NOTIFICATION_COOLDOWN_MINUTES = 15`
- `DWELLING_THRESHOLD_SECONDS = 120`
- `RISK_INFLUENCE_MULTIPLIERS`: critico=2.5x, alto=2.0x, medio=1.5x, bajo=1.0x, muy-bajo=0.8x

**Flujo `checkProximity(User, lat, lng, speedMs?)`:**
1. Busca risk zones dentro de 3km
2. Computa radio efectivo = `zone.radius_meters * multiplier`
3. Para cada zona:
   - Determina evento (Entry/Dwelling/Exit)
   - Log a `GeofenceLog`
   - Notifica (con cooldown 15 min por zona)
   - Actualiza `User.last_geofence_state` (JSON)
4. Sugiere ruta alternativa (bearing opuesto + 30°, proyección 100m)

**batchCheck:** Itera usuarios secuencialmente (sin paralelismo).

**Problemas detectados:**
- 🟡 **`GeofenceLog` fillable no incluye** `duration_seconds`, `heading`, `speed_ms` — se pasan al create pero se silencian
- 🔵 **Bug en `getHeading()`** — `sin(deg2rad($lng)) - sin(deg2rad($lng)) = 0`, siempre retorna 'N'

### 3.6 Módulo de IA (Heurísticas Locales)

**Archivos:** AIController, AIService, AiPrediction.

> **No es IA real.** Es un motor de heurísticas deterministas. Sin APIs externas, sin modelos ML.

| Método | Propósito | Implementación |
|--------|-----------|----------------|
| `classifyReport(Report)` | Prioridad + sospecha + categoría | 3 reglas de prioridad (hora/weekend/coords), 4 reglas de anomalía. Confidence fijo: 0.85 (normal) / 0.6 (sospechoso) |
| `detectPatterns(reports[])` | Picos, hotspots, tendencias | Distribución horaria 24-bin, semanal 7-bin, clustering espacial greedy (radio 300m, min 3), regresión lineal |
| `predictRiskScore(RiskZone)` | Pronóstico | Suavizado exponencial (α=0.3), forecast 7 períodos, días hasta crítico (score≥80) |
| `predictCriticalZones()` | Zonas que serán críticas | Itera zonas activas, filtra `will_be_critical`, ordena por urgencia |
| `recommendSafeRoute(lat/lng)` | Ruta más segura | 4 waypoints perpendiculares vs ruta directa. Sin grafo de calles real |
| `detectFalseReport(Report)` | Flag de sospecha | Misma lógica que classifyReport, threshold ≥2 razones |

**Cache:** `AiPrediction` table con relación polimórfica. TTL 6h. Aplica a classification y risk_forecast.

**Problemas detectados:**
- 🟡 **Confidence hardcodeado** (0.85/0.6) — no es un score real
- 🟡 **`recommendSafeRoute` sin pathfinding real** — solo 4 offsets perpendiculares
- 🟡 **Clustering espacial O(n²)** — sin poda ni índice espacial
- 🟡 **Trend analysis requiere ≥3 días de datos** o retorna null
- 🔵 **OpenAPI annotations ausentes** en AIController

### 3.7 Módulo de Pánico (PanicAlert)

**Archivos:** PanicController, PanicService, PanicAlert, PanicAlertResource, PanicAlertRepository, PanicAlertStatus.

**Flujos:**

| Acción | Endpoint | Auth |
|--------|----------|------|
| Activar alerta | `POST /panic` | Sanctum (cualquiera) |
| Historial propio | `GET /panic/history` | Sanctum |
| Alertas activas | `GET /panic/active` | Autoridad+ |
| Atender alerta | `POST /panic/{id}/attend` | Autoridad+ |

`PanicService::create()` crea alerta + notifica a todos los usuarios con rol `Autoridad`.

**Problemas detectados:**
- 🟡 **Sin auto-exipry** de alertas activas — quedan activas para siempre
- 🟡 **Sin rate limiting** por usuario para crear pánico
- 🟡 **`PanicAlertStatus::FalsoAlarma`** definido en enum pero **nunca se usa**
- 🟡 **`PanicAlertResource::user_name`** usa `whenLoaded('user')` pero `history()` no hace eager-load
- 🟡 **`NotificationService::sendPanicAlertToAuthorities()`** usa string hardcodeado `'Autoridad'`

### 3.8 Módulo de Dashboard

**Archivos:** DashboardController, DashboardService.

**Endpoints (todos requieren Autoridad+):**
- `/dashboard/full` — combinación de summary + statistics + evolution + crime_types + zone_stats
- `/dashboard/summary` — totales, verificados, pendientes, top 5 zonas críticas
- `/dashboard/statistics` — filtrable (from, to, province_id, district_id)
- `/dashboard/crime-types` — distribución por tipo de delito
- `/dashboard/reports-by-period` — agrupado por día/semana/mes
- `/dashboard/zone-stats` — stats por zona
- `/dashboard/reports-by-province/{regionId}`
- `/dashboard/reports-by-district/{provinceId}`
- `/dashboard/evolution` — últimos N días (default 30)
- `/dashboard/critical-zones` — solo zonas críticas

**Problemas detectados:**
- 🟡 **`dashboard/full` retorna `provinces: []`** — placeholder hardcodeado vacío
- 🟡 **Sin cache** en dashboard — cada llamada ejecuta 5+ queries
- 🟡 **Sin paginación** en evolution, crime-types — puede ser pesado con muchos datos
- 🔵 **OpenAPI annotations ausentes** en DashboardController

### 3.9 Módulo ETL

**Archivos:** Admin\ETLController, ETLService, EtlImport.

**Endpoints (todos requieren Administrador):**

| Ruta | Método | Función |
|------|--------|---------|
| `/admin/etl/import-csv` | POST | Subir CSV (max 10MB) |
| `/admin/etl/import-api` | POST | Importar JSON directo |
| `/admin/etl/fetch` | POST | Fetch desde API externa (MININTER/INEI) |
| `/admin/etl/history` | GET | Últimos 50 imports |
| `/admin/etl/imports/{id}` | GET | Detalle de import |

**Capacidades:**
- CSV: alias de columnas español/inglés, columnas requeridas: title, latitude, longitude, incident_date
- API fetch: llama endpoint configurado `/api/reportes` con Bearer token
- Dedup: ventana 24h por title+lat+lng+incident_date
- Batch insert: 500 filas por lote

**Problemas detectados:**
- 🟡 **Sin comando schedule para fetch periódico** de MININTER/INEI
- 🟡 **`uniqid("{$source}_")` como external_id fallback** — no único entre batches
- 🟡 **`/api/reportes` hardcodeado** — no configurable por source
- 🟡 **CSV encoding detection lee archivo dos veces**
- 🟡 **Status `cancelled` definido pero nunca seteado**

### 3.10 Módulo de Configuraciones (Settings)

**Archivos:** Admin\SettingsController, Setting, SettingRepository, SettingType.

**Endpoints (Administrador):** listar, upsert, filtrar por grupo.

**Problemas detectados:**
- 🟡 **`setValue()` no castea según `type`** — un setting con `type=integer` acepta string
- 🟡 **`SettingType` enum definido pero nunca usado**
- 🟡 **Sin endpoint público de settings** — `getPublicSettings()` existe en repositorio pero no hay ruta
- 🟡 **Sin endpoint de delete para settings**

### 3.11 Comandos de Consola

| Comando | Nombre | Función |
|---------|--------|---------|
| `prewarm:heatmap-cache` | `PrewarmHeatmapCache` | Precomputa tiles populares para Piura |
| `risk:recalculate` | `RecalculateRiskScores` | Recalcula scores de riesgo vía HeatmapService |

> ⚠️ `risk:recalculate` delega a `HeatmapService`, NO a `RiskScoreService` — nombre engañoso.

### 3.12 Notificaciones

| Clase | Canal | Propósito | ¿Se envía? |
|-------|-------|-----------|------------|
| `PasswordReset` | mail | Reset password link | ✅ Sí |
| `PanicAlertReceived` | database | Notificar a autoridades de alerta de pánico | ✅ Sí |
| `ReportVerified` | database (definido) | Notificar que reporte fue verificado | ❌ **NUNCA** |
| `GeofenceAlert` | database | Alerta de entrada/salida de geocerca | ✅ Sí |

### 3.13 Base de Datos — Esquema Completo

**Total: 27 tablas**

**1. Auth:**
- `users`, `roles`, `user_roles`, `personal_access_tokens`, `password_reset_tokens`

**2. Jerarquía Geográfica:**
- `regions`, `provinces`, `districts`, `population_centers`, `urbanizations`, `sectors`

**3. Reportes:**
- `reports` (canónica), `citizen_reports` (muerta), `official_reports` (solo ETL), `media` (polimórfica), `categories`, `crime_types`, `report_status`

**4. Riesgo y Mapas:**
- `risk_zones`, `risk_levels`, `risk_history`, `polygons`, `polygon_points`, `heatmap_cache`

**5. Seguridad y Alertas:**
- `panic_alerts`, `geofence_logs`, `notifications` (Laravel)

**6. Operaciones:**
- `etl_imports`, `ai_predictions`, `settings`, `audit_logs`

**7. Infraestructura Laravel:**
- `cache`, `cache_locks`, `jobs`, `job_batches`, `sessions`

---

## 4. Frontend — React Native / Expo

### 4.1 Arquitectura General

| Tecnología | Rol |
|-----------|-----|
| **Expo Router 4** (file-based) | Navegación y routing |
| **Zustand 5** | Estado cliente (auth, map, report draft) |
| **React Query 5** (@tanstack/react-query) | Estado servidor (reportes, dashboard, risk zones) |
| **NativeWind 4** (Tailwind para RN) | Estilos (adopción parcial) |
| **Axios** | Cliente HTTP |
| **React Hook Form + Yup** | Formularios y validación |
| **MapLibre GL** (native) / MapLibre (web) | Renderizado de mapas |
| **Expo Location / Notifications / TaskManager** | Geocercas en background |

### 4.2 Estructura de Rutas (Expo Router)

```
app/
├── _layout.tsx              ← Providers globales (QueryClient, Auth, Location, ErrorBoundary)
├── index.tsx                ← Redirect: Onboarding → Auth → Tabs
├── (onboarding)/
│   └── index.tsx            ← OnboardingScreen (3 slides)
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx            ← LoginScreen
│   ├── register.tsx         ← RegisterScreen
│   └── forgot-password.tsx  ← ForgotPasswordScreen
├── (tabs)/
│   ├── _layout.tsx          ← 3 tabs (Mapa, Alertas, Perfil)
│   ├── mapa.tsx             ← MapScreen
│   ├── alertas.tsx          ← AlertasScreen (mis reportes)
│   └── perfil.tsx           ← ProfileScreen
├── (report)/                ← Modal stack (creación multi-paso)
│   ├── _layout.tsx
│   ├── paso1.tsx            ← ReportePaso1Screen (ubicación + evidencia)
│   ├── paso2.tsx            ← ReportePaso2Screen (tipo delito + descripción)
│   ├── confirmar.tsx        ← ConfirmarReporteScreen (revisar + enviar)
│   ├── enviado.tsx          ← ReporteEnviadoScreen (éxito + tracking)
│   └── detalle.tsx          ← ReporteDetalleScreen (ver detalle)
└── (admin)/                 ← Stack admin (sin guard de ruta)
    ├── _layout.tsx
    ├── dashboard.tsx        ← DashboardAuthorityScreen
    ├── etl.tsx              ← ETLScreen
    ├── zonas-riesgo.tsx     ← ZonasRiesgoScreen
    └── reportes.tsx         ← AdminReportsScreen
```

### 4.3 Servicios API

**11 archivos en `src/services/`:**

| Servicio | Métodos | Estado |
|----------|---------|--------|
| `api.ts` | Axios instance + interceptors (Bearer token, 401 auto-logout) | ✅ |
| `authService.ts` | login, register, forgotPassword, resetPassword, refreshToken | ✅ |
| `reportService.ts` | CRUD + nearby + verify + reject | ✅ |
| `mapService.ts` | riskZones, heatmap, heatmapTile, clusters, regions, provinces, districts | ✅ |
| `geofenceService.ts` | check, batchCheck, history | ✅ |
| `panicService.ts` | create, history, active, attend | ✅ |
| `dashboardService.ts` | 13 métodos (full, summary, statistics, crimeTypes, etc.) | ✅ |
| `aiService.ts` | insights, patterns, safeRoute, criticalZones, classifyReport | ✅ |
| `riskZoneService.ts` | CRUD risk zones (admin) | ✅ |
| `adminService.ts` | users CRUD, ETL, settings | ✅ |
| `notificationService.ts` | Local notifications only (sin push registration) | ⚠️ |

**Gaps:**
- `ENDPOINTS.REFRESH`, `LOGOUT_ALL`, `RESET_PASSWORD` definidos pero **nunca usados**
- `ForgotPasswordScreen` llama `api.post()` directo en vez de `authService`
- Varios dashboard endpoints usan strings crudas en vez de constantes ENDPOINTS

### 4.4 Estado Global (Zustand)

| Store | Estado clave | Persistido |
|-------|-------------|------------|
| `authStore` | user, token, isAuthenticated, isLoading | ✅ AsyncStorage |
| `mapStore` | riskZones, heatmapData, clusters, bounds, selectedZone | ❌ |
| `reportStore` | reports[], draft (multi-step), pagination | ❌ |

### 4.5 Contextos

| Contexto | Propósito |
|----------|-----------|
| `AuthContext` | Wrapper de authStore, provee login/register/logout/refreshProfile |
| `LocationContext` | Permiso de ubicación, posición actual, foreground tracking |

**⚠️ Patrón dual auth:** Componentes usan inconsistentemente `useAuth()` (contexto) o `useAuthStore` (Zustand directo).

### 4.6 Hooks

| Hook | React Query | Propósito |
|------|-------------|-----------|
| `useAuth` | ✅ Mutations + Query | login, register, profile — **NO usado por screens** |
| `useReports` | ✅ | List, single, nearby (30s poll), CRUD + verify/reject |
| `useDashboard` | ✅ | Full, summary, statistics, crimeTypes, evolution, criticalZones (60-300s poll) |
| `useGeofence` | ✅ | checkProximity mutation, history |
| `useGeofenceAuto` | ❌ (manual) | Background geofence via TaskManager + foreground interval 60s |
| `useLocation` | ❌ (manual) | Start/stop tracking, geofence check on move >100m |
| `usePanic` | ✅ | Create, history, active (30s poll), attend |
| `useRiskZones` | ✅ | riskZones, heatmap, clusters con array-safety |

**⚠️ `useAuth` hooks son código muerto** — las screens llaman AuthContext directamente.

### 4.7 Pantallas por Módulo

| Módulo | Pantallas | Enrutadas | Estado |
|--------|-----------|-----------|--------|
| **Auth** | LoginScreen, RegisterScreen, ForgotPasswordScreen, OnboardingScreen | ✅ 4/4 | ✅ |
| **Mapa** | MapScreen, HeatmapScreen | ⚠️ 1/2 | HeatmapScreen **sin ruta** |
| **Reportes** | AlertasScreen, ReportePaso1/2, Confirmar, Enviado, Detalle, CreateReport, ReportHistory | ⚠️ 6/8 | CreateReport y ReportHistory **sin ruta** (código muerto) |
| **Dashboard** | DashboardHomeScreen, DashboardAuthorityScreen | ⚠️ 1/2 | DashboardHomeScreen **sin ruta** |
| **Admin** | ETLScreen, ZonasRiesgoScreen, AdminReportsScreen | ✅ 3/3 (bajo /admin) | ✅ |
| **AI** | AIInsightsScreen | ❌ 0/1 | **Sin ruta** |
| **Perfil** | ProfileScreen | ✅ 1/1 | ✅ |

**Total:** 21 screen files, 23 route files, **5 screens sin ruta** (código muerto)

### 4.8 Componentes Compartidos

```
src/components/
├── shared/           # Button, Card, Input, LoadingSpinner, Modal, etc.
├── map/              # MapView (native), MapView.web (mock), MarkerCluster, HeatmapOverlay, ZonePolygon
└── charts/           # BarChart, LineChart, PieChart, RiskGauge
```

---

## 5. Mapa de Rutas API (Backend → Frontend)

| Endpoint Backend | Frontend Service | Pantalla | Status |
|-----------------|------------------|----------|--------|
| `POST /auth/register` | authService.register() | RegisterScreen | ✅ |
| `POST /auth/login` | authService.login() | LoginScreen | ✅ |
| `POST /auth/forgot-password` | authService.forgotPassword() | ForgotPasswordScreen | ✅ |
| `POST /auth/reset-password` | authService.resetPassword() | ❌ Sin pantalla | ❌ |
| `POST /auth/refresh` | authService.refreshToken() | ❌ No usado | ❌ |
| `GET /auth/profile` | authService.getProfile() | ProfileScreen | ✅ |
| `PUT /auth/profile` | authService.updateProfile() | ProfileScreen | ✅ |
| `POST /auth/logout` | authService.logout() | ProfileScreen | ✅ |
| `POST /auth/logout-all` | ENDPOINTS.LOGOUT_ALL definido | ❌ No usado | ❌ |
| `POST /auth/change-password` | authService.changePassword() | ProfileScreen | ✅ |
| `GET /reports/nearby` | reportService.getNearbyReports() | MapScreen | ✅ |
| `GET /reports` | reportService.getReports() | AlertasScreen | ✅ |
| `GET /reports/{id}` | reportService.getReportById() | ReporteDetalleScreen | ✅ |
| `POST /reports` | reportService.createReport() | ConfirmarReporteScreen | ✅ |
| `PUT /reports/{id}` | reportService.updateReport() | ❌ Sin pantalla | ❌ |
| `DELETE /reports/{id}` | reportService.deleteReport() | ❌ Sin pantalla | ❌ |
| `POST /reports/{id}/verify` | reportService.verifyReport() | AdminReportsScreen | ✅ |
| `POST /reports/{id}/reject` | reportService.rejectReport() | AdminReportsScreen | ✅ |
| `GET /admin/reports` | api.get('/admin/reports') | AdminReportsScreen | ✅ |
| `GET /map/risk-zones` | mapService.getRiskZones() | MapScreen | ✅ |
| `GET /map/heatmap` | mapService.getHeatmap() | HeatmapScreen (sin ruta) | ⚠️ |
| `GET /map/heatmap/tile/{z}/{x}/{y}` | mapService.getHeatmapTile() | HeatmapScreen | ⚠️ |
| `GET /map/clusters` | mapService.getClusters() | MapScreen (cluster toggle) | ✅ |
| `GET /map/regions` | mapService.getRegions() | ❌ Sin uso | ❌ |
| `GET /map/provinces/{regionId}` | mapService.getProvinces() | ❌ Sin uso | ❌ |
| `GET /map/districts/{provinceId}` | mapService.getDistricts() | ❌ Sin uso | ❌ |
| `POST /geofence/check` | geofenceService.checkProximity() | useGeofenceAuto / useLocation | ✅ |
| `POST /geofence/batch-check` | geofenceService.batchCheck() | ❌ Sin uso | ❌ |
| `GET /geofence/history` | geofenceService.getHistory() | ❌ Sin pantalla | ❌ |
| `GET /geofence/zones/{lat}/{lng}` | geofenceService.getZones() | ❌ Sin uso | ❌ |
| `POST /panic` | panicService.createAlert() | ConfirmarReporteScreen (botón sin handler) | ⚠️ |
| `GET /panic/history` | panicService.getHistory() | ❌ Sin pantalla | ❌ |
| `GET /panic/active` | panicService.getActiveAlerts() | ❌ Sin uso | ❌ |
| `POST /panic/{id}/attend` | panicService.attendAlert() | ❌ Sin uso | ❌ |
| `GET /dashboard/full` | dashboardService.getFullDashboard() | DashboardAuthorityScreen | ✅ |
| `GET /dashboard/summary` | dashboardService.getSummary() | DashboardHomeScreen (sin ruta) | ⚠️ |
| `GET /dashboard/crime-types` | dashboardService.getCrimeTypes() | DashboardAuthorityScreen | ✅ |
| `GET /dashboard/evolution` | dashboardService.getEvolution() | DashboardAuthorityScreen | ✅ |
| `GET /dashboard/critical-zones` | dashboardService.getCriticalZones() | DashboardAuthorityScreen | ✅ |
| `GET /ai/insights` | aiService.getInsights() | AIInsightsScreen (sin ruta) | ⚠️ |
| `GET /ai/patterns` | aiService.getPatterns() | AIInsightsScreen | ⚠️ |
| `GET /ai/safe-route` | aiService.getSafeRoute() | ❌ Sin uso | ❌ |
| `GET /ai/critical-zones` | aiService.getCriticalZones() | AIInsightsScreen | ⚠️ |
| `GET /admin/risk-zones` | riskZoneService.getRiskZones() | ZonasRiesgoScreen | ✅ |
| `POST /admin/risk-zones` | riskZoneService.createRiskZone() | ZonasRiesgoScreen | ✅ |
| `PUT /admin/risk-zones/{id}` | riskZoneService.updateRiskZone() | ZonasRiesgoScreen | ✅ |
| `DELETE /admin/risk-zones/{id}` | riskZoneService.deleteRiskZone() | ZonasRiesgoScreen | ✅ |
| `POST /admin/etl/import-csv` | adminService.importCsv() | ETLScreen | ✅ |
| `POST /admin/etl/fetch` | adminService.fetchFromApi() | ETLScreen | ✅ |
| `GET /admin/etl/history` | adminService.getEtlHistory() | ETLScreen | ✅ |
| `GET /admin/users` | adminService.getUsers() | ❌ Sin pantalla | ❌ |

---

## 6. Flujos Críticos

### 6.1 Registro → Login → Mapa
```
RegisterScreen → POST /auth/register (201)
  → authStore.setSession(user, token)
  → Redirect to Tabs/Mapa
  → MapScreen carga risk zones + heatmap
```

### 6.2 Crear Reporte (multi-paso)
```
FAB en Mapa → (report) stack modal
  → Paso 1: ubicación (mapa + marker), radio, evidencia (cámara/gallery), anónimo
  → Paso 2: tipo delito (hardcodeado), descripción, fecha incidente
  → Confirmar: resumen + submit → POST /reports
    → HotspotService evalua → auto-aprueba si cerca de hotspot
  → Enviado: tracking ID, navegar a mapa o historial
```

### 6.3 Verificar Reporte (Autoridad)
```
DashboardAuthorityScreen → lista reportes recientes
  → Click verify → POST /reports/{id}/verify
  → Backend: setea is_verified=true, status=verificado
  → Notificación: NO se envía (bug)
```

### 6.4 Geocerca en Background
```
LocationContext.startLocationUpdates()
  → watchPositionAsync (foreground)
  → useGeofenceAuto: cada 60s verifica posición
  → TaskManager (background): checkProximity POST /geofence/check
  → Si hay alerta → notificación local
```

### 6.5 Alerta de Pánico
```
Botón en ConfirmarReporteScreen (sin handler - bug)
  → POST /panic → PanicAlert activo
  → NotificationService → notifica a autoridades
  → DashBoardAuthorityScreen → panic/active → attend
```

---

## 7. Base de Datos — Diagrama de Relaciones

```
users ────< user_roles >──── roles
  │
  ├──< reports (user_id / verified_by)
  ├──< panic_alerts
  ├──< geofence_logs
  ├──< etl_imports
  └──< notifications

reports ────< media (polymorphic: mediable)
  ├──> crime_types
  ├──> categories
  ├──> report_status
  └──> risk_zones (promoted_hotspot_id)

risk_zones ────< polygons ────< polygon_points
  ├──> risk_levels
  ├──< risk_history
  ├──< geofence_logs
  └──> sectors (FK)

sectors ────> urbanizations ────> population_centers ────> districts ────> provinces ────> regions

heatmap_cache (independiente, sin FKs)

ai_predictions (polymorphic: predictable)

citizen_reports ───> reports (report_id FK nullable) [HUÉRFANA]
official_reports ───> reports (report_id FK nullable) [SOLO ETL]
```

---

## 8. Problemas Detectados

### 8.1 Bloqueantes

| # | Descripción | Archivo | Severidad |
|---|------------|---------|-----------|
| 1 | **Migración users duplicada**: `0001_01_01_000000` (stock) y `2026_01_01_000001` (custom) crean misma tabla. `php artisan migrate` falla. | `database/migrations/` | 🔴 |
| 2 | **Laravel stock `users` migration** incluye columnas que no están en el schema SENTRIX — posible conflicto al hacer fresh migrate | `0001_01_01_000000_create_users_table.php` | 🔴 |

### 8.2 Altos

| # | Descripción | Archivo | Severidad |
|---|------------|---------|-----------|
| 3 | **User enumeration via password reset**: `exists:users,email` revela emails registrados | `ForgotPasswordRequest.php`, `ResetPasswordRequest.php` | 🔴 |
| 4 | **`JwtMiddleware` es código muerto**: nunca registrado en middleware stack | `Middleware/JwtMiddleware.php` | 🟡 |
| 5 | **Sin rate limiting en auth**: login, register, forgot-password sin throttle | `routes/api.php` | 🟡 |
| 6 | **`update()` y `destroy()` sin autorización**: cualquier usuario puede modificar/borrar cualquier reporte | `ReportController.php` | 🟡 |
| 7 | **Sin FormRequest para update de reportes**: `$request->all()` permite mass-assignment | `ReportController::update()` | 🟡 |
| 8 | **`ReportVerified` notification definida pero nunca enviada** | `ReportService::verify()` | 🟡 |
| 9 | **`CitizenReport` y `OfficialReport` son tablas huérfanas**: ocupan espacio sin uso activo | `Models/` | 🟡 |
| 10 | **Sin email verification**: `MustVerifyEmail` comentado, cualquiera registra cuenta falsa | `User.php` | 🟡 |
| 11 | **Sin transacción en registro**: si role attach falla, usuario queda sin rol | `AuthService::register()` | 🟡 |

### 8.3 Medios

| # | Descripción | Archivo | Severidad |
|---|------------|---------|-----------|
| 12 | **RiskHistory nunca se escribe**: tabla existe, migraciones OK, ningún servicio la popula | `Services/` | 🟡 |
| 13 | **`panico/active` sin auto-expiry**: alertas activas quedan activas para siempre | `PanicService.php` | 🟡 |
| 14 | **`PanicAlertStatus::FalsoAlarma` nunca usado** | `Enums/PanicAlertStatus.php` | 🟡 |
| 15 | **`dashboard/full` retorna `provinces: []` hardcodeado** | `DashboardService.php` | 🟡 |
| 16 | **Dashboard sin cache**: cada llamada ejecuta 5+ queries | `DashboardService.php` | 🟡 |
| 17 | **ETL sin scheduled fetch**: MININTER/INEI no se pueden programar | `ETLService.php` | 🟡 |
| 18 | **Settings `type` column ignorado**: `setValue()` acepta cualquier tipo sin cast | `SettingRepository.php` | 🟡 |
| 19 | **`getHeading()` bug**: mismo lng en ambos términos, siempre retorna 'N' | `GeofencingService.php:248` | 🟡 |
| 20 | **`GeofenceLog` fillable incompleto**: `duration_seconds`, `heading`, `speed_ms` silenciados | `GeofenceLog.php` | 🟡 |
| 21 | **5 screens sin ruta en frontend**: HeatmapScreen, CreateReportScreen, ReportHistoryScreen, DashboardHomeScreen, AIInsightsScreen | `frontend/src/screens/` | 🟡 |
| 22 | **Sin admin route guard**: cualquiera que conoce URL accede a pantallas admin | `app/(admin)/_layout.tsx` | 🟡 |
| 23 | **CrimeType IDs hardcodeados**: `crimeTypeIdMap` en ConfirmarReporteScreen | `ConfirmarReporteScreen.tsx` | 🟡 |
| 24 | **`useAuth` hooks son código muerto**: screens usan AuthContext directo | `hooks/useAuth.ts` | 🟡 |
| 25 | **Heatmap tiles hardcodeados para Piura**: no configurable para otras regiones | `HeatmapService.php` | 🟡 |
| 26 | **`AuthService::forgotPassword()` retorna token** — peligroso para reuso futuro | `AuthService.php` | 🟡 |
| 27 | **Botón de pánico en ConfirmarReporteScreen sin handler** | `ConfirmarReporteScreen.tsx` | 🟡 |

### 8.4 Bajos / Nits

| # | Descripción | Archivo | Severidad |
|---|------------|---------|-----------|
| 28 | **`UserResource` expone `last_lat/last_lng`** en cada perfil — privacidad | `UserResource.php` | 🔵 |
| 29 | **Roles hardcodeados como strings** — `UserRole` enum existe pero no se usa | Varios | 🔵 |
| 30 | **Namespace inconsistente**: `App\Controllers` vs `App\Http\Controllers` | Varios | 🔵 |
| 31 | **Admin\ReportController usa `Report::query()` directo** rompe patrón repositorio | `Admin/ReportController.php` | 🔵 |
| 32 | **`resolveStatusId()` consulta DB cada vez** sin cache | `ReportService.php` | 🔵 |
| 33 | **`reporter_ip` nunca se popula** en creación de reportes | `ReportService.php` | 🔵 |
| 34 | **`is_verified` semántica confusa**: reject setea `is_verified=false` (igual que no-revisado) | `ReportRepository.php` | 🔵 |
| 35 | **Endpoint `/api/v1/risk-levels` fuera de grupo admin** pero servido por Admin\RiskZoneController | `routes/api.php:121` | 🔵 |
| 36 | **Exceso de archivos controller**: `Controller.php` existe en 2 namespaces distintos | `app/Controllers/` y `app/Http/Controllers/` | 🔵 |
| 37 | **Sin ESLint config** en frontend pese a script `lint` en package.json | `frontend/` | 🔵 |
| 38 | **Estilos mixtos**: NativeWind className + inline style en mismos elementos | Frontend varios | 🔵 |
| 39 | **Dual auth pattern**: `useAuth()` vs `useAuthStore()` — inconsistente | Frontend varios | 🔵 |
| 40 | **OpenAPI annotations incompletas**: faltan en AIController y DashboardController | `AIController.php`, `DashboardController.php` | 🔵 |

---

## 9. Funcionalidades Faltantes vs Rutas Definidas

### Backend — Rutas sin implementación completa

| Ruta | Método | Problema |
|------|--------|----------|
| `POST /auth/logout-all` | Implementado | Sin test |
| `POST /auth/forgot-password` | Implementado | User enumeration, sin test |
| `POST /auth/reset-password` | Implementado | Sin test, sin pantalla frontend |
| `POST /auth/refresh` | Implementado | Sin uso en frontend |
| `PUT /reports/{id}` | Sin FormRequest | Mass-assignment vulnerable |
| `DELETE /reports/{id}` | Sin autorización | Cualquiera borra cualquier reporte |
| `GET /geofence/history` | Implementado | Sin pantalla frontend |
| `GET /panic/history` | Implementado | Sin pantalla frontend |
| `GET /panic/active` | Implementado | Sin uso frontend |
| `POST /panic/{id}/attend` | Implementado | Sin uso frontend |
| `GET /admin/users` | Implementado | Sin pantalla frontend |
| `GET /admin/users/{id}` | Implementado | Sin pantalla frontend |
| `PUT /admin/users/{id}/role` | Implementado | Sin pantalla frontend |
| `GET /map/provinces/{regionId}` | Implementado | Sin uso frontend |
| `GET /map/districts/{provinceId}` | Implementado | Sin uso frontend |
| `GET /ai/safe-route` | Implementado | Sin uso frontend |

### Frontend — Pantallas sin ruta (código muerto)

| Archivo | Ruta esperada |
|---------|--------------|
| `HeatmapScreen.tsx` | `(tabs)/mapa/heatmap` o similar |
| `CreateReportScreen.tsx` | Reemplazado por flujo multi-paso |
| `ReportHistoryScreen.tsx` | Duplicado de AlertasScreen |
| `DashboardHomeScreen.tsx` | Dashboard público (no-admin) |
| `AIInsightsScreen.tsx` | `(tabs)/ai` o similar |

---

## 10. Cobertura de Tests

### Backend

| Archivo | Tests | Estado |
|---------|-------|--------|
| `tests/Feature/Auth/AuthTest.php` | 14 tests (registro, login, perfil, logout, change-password, refresh, role middleware, update profile, validaciones) | ✅ |
| `tests/Feature/ExampleTest.php` | 1 test placeholder | ❌ Placeholder |
| `tests/Unit/ExampleTest.php` | 1 test placeholder | ❌ Placeholder |

**Sin tests para:**
- Reportes (CRUD, nearby, verify, reject)
- Mapa, Heatmap, RiskZones
- Geofencing (check, batchCheck, history)
- AI Service (classify, patterns, safeRoute)
- PanicAlert (create, history, active, attend)
- Dashboard (todos los endpoints)
- ETL (CSV import, API fetch, history)
- Settings (CRUD)
- Console Commands (prewarm, recalculate)
- RiskScoreService

### Frontend
- **Sin framework de tests** configurado (no Jest, no Vitest, no Detox)
- **Sin tests unitarios, de integración o E2E**

---

## 11. Recomendaciones

### Críticas (semáforo rojo)

1. **Arreglar migración duplicada de users**: Eliminar o renombrar `0001_01_01_000000_create_users_table.php` para que no intente crear `users` table duplicada.

### Altas

2. **Eliminar `exists:users,email`** de ForgotPasswordRequest y ResetPasswordRequest — prevenir enumeración.
3. **Registrar o eliminar `JwtMiddleware`**: Si no se usa, borrarlo. Si debe usarse, registrarlo en `bootstrap/app.php`.
4. **Agregar rate limiting** a rutas de auth: `throttle:10,1` en login, `throttle:3,60` en password reset.
5. **Agregar autorización** a `ReportController::update()` y `destroy()` con `$this->authorize()`.
6. **Crear `UpdateReportRequest`** con validación explícita.
7. **Enviar `ReportVerified` notification** en `ReportService::verify()`.
8. **Envolver registro en transacción**: `DB::transaction()`.

### Medias

9. **Limpiar tablas huérfanas**: Evaluar si `citizen_reports` y `official_reports` deben eliminarse o reactivarse.
10. **Implementar escritura de RiskHistory** en recálculo de scores.
11. **Configurar auto-expiry de panic alerts**: Job programado para marcar alertas >X horas como `falso_alarma`.
12. **Implementar cache en DashboardService**: Cachear `getFullDashboard()` por 60s.
13. **Agregar comando schedule para ETL fetch**: `php artisan etl:fetch {source}` en cron.
14. **Agregar route guard a admin layout** en frontend: verificar rol antes de mostrar rutas admin.
15. **Reemplazar crime types hardcodeados** con fetch desde API.
16. **Limpiar código muerto**: 5 screens sin ruta, `useAuth` hooks, endpoint constants no usados.
17. **Unificar patrón de auth** en frontend: decidir entre `useAuth()` o `useAuthStore()`.
18. **Arreglar `getHeading()`** en GeofencingService.
19. **Agregar `duration_seconds`, `heading`, `speed_ms`** a `GeofenceLog $fillable`.
20. **Poblar `reporter_ip`** en creación de reportes.
21. **Cachear `resolveStatusId()`** en ReportService.

### Bajas

22. **Remover `last_lat/last_lng` de `UserResource`** o crear resource separado para admin.
23. **Usar `UserRole` enum** en lugar de strings hardcodeadas.
24. **Agregar tests** para módulos sin cobertura (Reports, Map, Geofence, AI, Panic, Dashboard, ETL).
25. **Agregar ESLint config** al frontend.
26. **Completar OpenAPI annotations** en AIController y DashboardController.
27. **Remover Controller.php duplicado** en `app/Http/Controllers/`.
28. **Unificar namespaces** a `App\Http\Controllers`, `App\Http\Resources`, etc. (o documentar la decisión).
29. **Implementar `useRefreshToken`** en frontend en vez de logout inmediato en 401.
30. **Configurar prewarm tiles por región** en lugar de hardcodeados.
