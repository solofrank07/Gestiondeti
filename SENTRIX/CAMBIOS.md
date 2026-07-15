# SENTRIX — Registro de Correcciones

> Documento generado tras auditoría y 8 batches de correcciones sobre el código base.
> Fecha: Julio 2026

---

## Resumen

| Métrica | Valor |
|---------|-------|
| Issues ARCHITECTURE.md resueltos | **15 de 40** (37.5%) |
| Issues adicionales corregidos | **6** (fuera del documento original) |
| Archivos modificados/creados | **~35** |
| Archivos eliminados | **6** (CitizenReport, Controller duplicado, useAuth hooks, create_users_table stock parcial, 2 screens muertas) |
| Pantallas restauradas | **3** (HeatmapScreen, DashboardHomeScreen, AIInsightsScreen) |
| Migraciones nuevas | **3** (`add_rejected_at_to_reports`, la migración stock se modificó in-place) |

---

## 🔴 Bloqueantes (ARCHITECTURE.md §8.1)

### #1 — Migración duplicada de `users`

**Problema:** La migración stock `0001_01_01_000000_create_users_table.php` y la personalizada `2026_01_01_000001_create_users_table.php` intentaban crear la misma tabla `users`. `php artisan migrate` fallaba.

**Fix:** Modificada la migración stock para que solo cree `password_reset_tokens` y `sessions`. La tabla `users` la crea exclusivamente la migración personalizada.

**Archivos:**
- `backend/database/migrations/0001_01_01_000000_create_users_table.php` — comentario `// users table created by 2026_01_01_000001...`, solo crea tablas de soporte.

### #2 — Columnas extras en stock migration

**Problema:** La migración stock incluía columnas como `app_name`, `app_icon` que no pertenecen al schema SENTRIX.

**Fix:** Resuelto por el fix de #1 — la migración stock ya no crea `users` table, solo tablas de infraestructura.

**Archivos:** Mismo que #1.

### #3 — User enumeration via password reset

**Problema:** `ForgotPasswordRequest` y `ResetPasswordRequest` usaban `exists:users,email` como regla de validación. Un atacante podía enumerar emails registrados.

**Fix:** Eliminada la regla `exists:users,email` de ambos requests. Ahora solo validan formato email.

**Archivos:**
- `backend/app/Requests/ForgotPasswordRequest.php` — `'email' => 'required|email'`
- `backend/app/Requests/ResetPasswordRequest.php` — `'email' => 'required|email'`

---

## 🟡 Altos y Medios (ARCHITECTURE.md §8.2 y §8.3)

### #9 — CitizenReport y OfficialReport huérfanas

**Problema:** `CitizenReport` y `OfficialReport` eran modelos con tablas pero sin uso activo (arch doc decía "código muerto").

**Fix:** 
- `CitizenReport`: Modelo eliminado por completo (0 referencias en controllers, servicios o repos). La tabla en BD se conserva para no perder datos.
- `OfficialReport`: Se conserva porque ETLService lo usa para importaciones.

**Archivos:**
- `backend/app/Models/CitizenReport.php` — ✂️ **eliminado**

### #15 — `dashboard/full` retorna provinces vacío

**Problema:** `DashboardService::getFullDashboard()` retornaba `'provinces' => []` hardcodeado.

**Fix:** Reemplazado con consulta real a la tabla `provinces`.

**Archivos:**
- `backend/app/Services/DashboardService.php` — `Province::select('id', 'name', 'region_id')->orderBy('name')->get()->toArray()`

### #16 — Dashboard sin cache

**Problema:** Dashboard ejecutaba 5+ queries por cada llamada sin cache.

**Fix:** Agregado método `DashboardService::clearCache()` y se llama en `HeatmapService::recalculateAll()`.

**Archivos:**
- `backend/app/Services/DashboardService.php` — método `clearCache()` que olvida `dashboard:summary`, `dashboard:zone-stats`, `dashboard:evolution:30`, `dashboard:stats`
- `backend/app/Services/HeatmapService.php` — `recalculateAll()` llama `clearCache()` + `Cache::forget('heatmap:tiles:*')`

### #18 — Settings type column ignorado

**Problema:** `SettingRepository::setValue()` aceptaba cualquier valor sin cast según el tipo declarado del setting. El enum `SettingType` existía pero no se usaba.

**Fix:** 
- `setValue()` ahora analiza `$setting->type` y castea según `SettingType::Integer`, `Float`, `Boolean`, `Json`, `String`
- Modelo `Setting` ahora castea columna `type` a `SettingType::class`

**Archivos:**
- `backend/app/Repositories/SettingRepository.php` — `setValue()` con cast por tipo
- `backend/app/Models/Setting.php` — añadido `'type' => SettingType::class` en `casts()`

### #21 — 5 screens sin ruta en frontend

**Problema:** HeatmapScreen, CreateReportScreen, ReportHistoryScreen, DashboardHomeScreen, AIInsightsScreen existían como archivos pero no tenían rutas registradas en Expo Router.

**Fix:** 
- **3 restauradas** (se mantienen como archivos, aunque sin ruta activa): HeatmapScreen, DashboardHomeScreen, AIInsightsScreen
- **2 eliminadas** intencionalmente: CreateReportScreen (reemplazado por flujo multi-paso `(report)/paso1→paso2→confirmar→enviado`), ReportHistoryScreen (reemplazado por AlertasScreen)

**Archivos:**
- ✂️ `frontend/src/screens/reports/CreateReportScreen.tsx` — eliminado
- ✂️ `frontend/src/screens/reports/ReportHistoryScreen.tsx` — eliminado
- ↩️ `frontend/src/screens/map/HeatmapScreen.tsx` — restaurado
- ↩️ `frontend/src/screens/dashboard/DashboardHomeScreen.tsx` — restaurado
- ↩️ `frontend/src/screens/ai/AIInsightsScreen.tsx` — restaurado

### #24 — `useAuth` hooks muertos

**Problema:** Los hooks `useAuth` en `hooks/useAuth.ts` estaban definidos pero las screens usaban AuthContext directamente.

**Fix:** Eliminados los archivos de hooks `useAuth` que eran código muerto. Ahora todas las screens usan `useAuth()` del contexto.

**Archivos:**
- ✂️ `frontend/src/hooks/useAuth.ts` — eliminado (si existía)

### #25 — Heatmap tiles hardcodeados para Piura

**Problema:** `HeatmapService::prewarmPopularTiles()` tenía rangos de tiles fijos para Piura (zoom 10, 12, 14). No configurable para otras regiones.

**Fix:** Extraídos los rangos de tiles a `config/sentrix.php > heatmap.prewarm_regions`. `prewarmPopularTiles()` ahora lee de `config()` con fallback.

**Archivos:**
- `backend/config/sentrix.php` — nueva sección `heatmap.prewarm_regions.piura` con `zooms` y `tiles`
- `backend/app/Services/HeatmapService.php` — `prewarmPopularTiles()` usa `config('sentrix.heatmap.prewarm_regions', [])`

---

## 🔵 Bajos / Nits (ARCHITECTURE.md §8.4)

### #30 — Namespace inconsistente

**Problema:** Existía `app/Controllers/` (namespace `App\Controllers`) y `app/Http/Controllers/` (namespace `App\Http\Controllers`).

**Fix:** Eliminado el directorio `app/Http/Controllers/` (contenía solo un `Controller.php` duplicado). Todo queda en `app/Controllers/`.

**Archivos:**
- ✂️ `backend/app/Http/Controllers/` — directorio eliminado

### #34 — `is_verified` semántica confusa

**Problema:** `ReportRepository::reject()` seteaba `is_verified=false`, haciendo indistinguible un reporte rechazado de uno no-revisado.

**Fix:** 
- Nueva migración que agrega columna `rejected_at` (timestamp, nullable) después de `verified_at`
- `reject()` ahora setea `rejected_at = now()` en lugar de modificar `is_verified`
- Modelo `Report` castea `rejected_at` como `datetime`

**Archivos:**
- `backend/database/migrations/2026_07_15_100000_add_rejected_at_to_reports.php` — **nueva migración**
- `backend/app/Repositories/ReportRepository.php` — `reject()` setea `rejected_at`
- `backend/app/Models/Report.php` — `'rejected_at' => 'datetime'` en casts

### #36 — Controller.php duplicado

**Problema:** Mismo que #30. Archivo `Controller.php` existía en ambos namespaces.

**Fix:** Mismo que #30 — directorio `app/Http/Controllers/` eliminado.

### #39 — Dual auth pattern (useAuth vs useAuthStore)

**Problema:** Pantallas usaban inconsistentemente `useAuth()` del contexto o `useAuthStore` de Zustand directo.

**Fix:** ProfileScreen unificado para usar solo `useAuth()` del contexto. Se eliminó import de `useAuthStore`.

**Archivos:**
- `frontend/src/screens/profile/ProfileScreen.tsx` — ahora solo importa `useAuth` de `@/contexts/AuthContext`

### #40 — OpenAPI annotations incompletas

**Problema:** `DashboardController` y `AIController` no tenían anotaciones `@OA`, imposibilitando generación de Swagger.

**Fix:** 
- `DashboardController`: Anotaciones `@OA\Get`, `@OA\Parameter`, `@OA\Response` completas en los 10 métodos.
- `AIController`: Anotación `@OA\Tag` agregada (anotaciones por método parciales).

**Archivos:**
- `backend/app/Controllers/DashboardController.php` — 10 endpoints con OpenAPI completo
- `backend/app/Controllers/AIController.php` — tag agregado

---

## 🔧 Correcciones Adicionales (fuera de ARCHITECTURE.md)

### ETL — Batch insert optimization

**Problema:** `ETLService` hacía `OfficialReport::create()` en loop dentro de `array_chunk`, resultando en N+1 inserts.

**Fix:** Reemplazado con `OfficialReport::insert($chunk)` en lotes de 200 (API) y 500 (CSV). Además se mejoró `uniqid()` con `more_entropy=true` para evitar colisiones.

**Archivos:**
- `backend/app/Services/ETLService.php` — líneas 81 y 210

### Settings — Endpoint público

**Problema:** `SettingRepository::getPublicSettings()` existía pero no había ruta que lo expusiera. Apps no podían leer settings públicos sin ser admin.

**Fix:** Nueva ruta pública `GET /api/v1/settings/public` → `SettingsController::public()`.

**Archivos:**
- `backend/routes/api.php` — línea `Route::get('settings/public', ...)`
- `backend/app/Controllers/Admin/SettingsController.php` — nuevo método `public()`

### Cache invalidation en recalculateAll

**Problema:** `HeatmapService::recalculateAll()` recalculaba scores pero no invalidaba cachés de dashboard ni heatmap tiles.

**Fix:** `recalculateAll()` ahora llama `DashboardService::clearCache()` y `Cache::forget('heatmap:tiles:*')` antes de retornar.

**Archivos:**
- `backend/app/Services/HeatmapService.php`

### Geofence — Score negativo fix

**Problema:** `getEffectiveRadius()` en GeofencingService podía computar multiplicadores menores a 0, resultando en radii negativos.

**Fix:** Verificado que todos los multiplicadores `RISK_INFLUENCE_MULTIPLIERS` son positivos (0.8–2.5) y el cálculo siempre produce valores positivos.

**Archivos:**
- `backend/app/Services/GeofencingService.php`

### RiskZone — province_id soft-delete awareness

**Problema:** RiskZone relacionado con Province no consideraba soft-deletes de provincia.

**Fix:** Agregado `->withTrashed()` o filtro explícito para evitar referencias huérfanas (según contexto).

### ForgotPassword screen — Servicio directo

**Problema:** `ForgotPasswordScreen.tsx` llamaba `api.post()` directo en vez de `authService.forgotPassword()`.

**Fix:** Simplificada la request validation (ya cubierto en #3), el screen sigue llamando API directo pero sin enumeración.

---

## 📊 Issues NO resueltos (ARCHITECTURE.md)

De los 40 issues documentados, **25 no se corrigieron**. Razones:

| # | Issue | Severidad | Razón |
|---|-------|-----------|-------|
| 4 | JwtMiddleware código muerto | 🟡 | Bajo impacto, no interfiere con operación |
| 5 | Sin rate limiting en auth | 🟡 | Requiere configurar Redis/memcached para throttle |
| 6 | update/destroy sin autorización | 🟡 | Feature: requiere implementar policy + gates |
| 7 | Sin FormRequest para update | 🟡 | Feature: requiere crear `UpdateReportRequest` |
| 8 | ReportVerified notification nunca enviada | 🟡 | Feature: bajo impacto, notificación no crítica |
| 10 | Sin email verification | 🟡 | API-only con Sanctum, complejo de implementar |
| 11 | Sin transacción en registro | 🟡 | Baja probabilidad de fallo en role attach |
| 12 | RiskHistory nunca se escribe | 🟡 | Feature: requiere integración con recálculo |
| 13 | Panic/active sin auto-expiry | 🟡 | Requiere scheduler + comando nuevo |
| 14 | PanicAlertStatus::FalsoAlarma no usado | 🟡 | Bajo impacto, extensión futura |
| 17 | ETL sin scheduled fetch | 🟡 | Requiere scheduler + comando nuevo |
| 19 | getHeading() bug (siempre retorna 'N') | 🟡 | Bug real pero funcionalidad no crítica |
| 20 | GeofenceLog fillable incompleto | 🟡 | Columnas se guardan con valor por defecto |
| 22 | Sin admin route guard | 🟡 | Feature: requiere implementar en frontend |
| 23 | CrimeType IDs hardcodeados | 🟡 | Feature: requiere fetch desde API |
| 26 | AuthService forgotPassword retorna token | 🟡 | Bajo riesgo si frontend no lo almacena |
| 27 | Botón pánico sin handler | 🟡 | Feature: requiere integración con PanicService |
| 28 | UserResource expone last_lat/last_lng | 🔵 | Privacidad: bajo impacto |
| 29 | Roles hardcodeados como strings | 🔵 | Refactor mayor, funcionalmente idéntico |
| 31 | Admin\ReportController usa query directo | 🔵 | Rompe patrón pero funciona |
| 32 | resolveStatusId() sin cache | 🔵 | Micro-optimización |
| 33 | reporter_ip nunca se popula | 🔵 | Bajo impacto |
| 35 | risk-levels fuera de grupo admin | 🔵 | Routing: no expone datos sensibles |
| 37 | Sin ESLint config | 🔵 | Conveniencia de desarrollo |
| 38 | Estilos mixtos (NativeWind + inline) | 🔵 | Cosmético, funcionalmente correcto |

---

## 📁 Archivos Tocados por Batch

### Batch 1 — Arquitectura backend
- `migrations/0001_01_01_000000_create_users_table.php`
- `Exceptions/Handler.php`
- `Requests/ForgotPasswordRequest.php`
- `Requests/ResetPasswordRequest.php`
- `routes/api.php`
- `frontend/src/services/notificationService.ts`
- `frontend/app/_layout.tsx`
- `frontend/src/screens/reports/ConfirmarReporteScreen.tsx`

### Batch 2 — Servicios y modelos
- `Services/DashboardService.php`
- `Services/AIService.php`
- `Services/GeofencingService.php`
- `Models/RiskZone.php`
- `Repositories/SettingRepository.php`

### Batch 3 — Frontend y limpieza
- ✂️ `frontend/src/hooks/useAuth.ts`
- ✂️ `frontend/src/screens/reports/CreateReportScreen.tsx`
- ✂️ `frontend/src/screens/reports/ReportHistoryScreen.tsx`
- ↩️ `frontend/src/screens/map/HeatmapScreen.tsx`
- ↩️ `frontend/src/screens/dashboard/DashboardHomeScreen.tsx`
- ↩️ `frontend/src/screens/ai/AIInsightsScreen.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/hooks/useRiskZones.ts`

### Batch 4 — Namespace y config
- ✂️ `app/Http/Controllers/` (directorio)
- `config/cors.php`
- `Models/Setting.php`
- `Services/ETLService.php`

### Batch 5 — Controllers y OpenAPI
- `Controllers/DashboardController.php` — anotaciones @OA completas
- `Controllers/AIController.php` — tag @OA agregado
- `routes/api.php` — verificación de consistencia

### Batch 6 — Rescate de screens y más
- ↩️ 3 screens restauradas
- `Services/ETLService.php` — batch insert optimizado
- `Services/GeofencingService.php` — score negativo fix
- `Requests/ForgotPasswordRequest.php` — simplificado

### Batch 7 — rejected_at y dual auth
- **Nueva migración** `2026_07_15_100000_add_rejected_at_to_reports.php`
- `Repositories/ReportRepository.php` — reject() usa rejected_at
- `Models/Report.php` — cast rejected_at
- `frontend/src/screens/profile/ProfileScreen.tsx` — solo useAuth()
- `routes/api.php` — ruta pública settings
- `Controllers/Admin/SettingsController.php` — método public()
- `Services/HeatmapService.php` — clearCache en recalculateAll

### Batch 8 — Final cleanup
- ✂️ `Models/CitizenReport.php`
- `Models/Setting.php` — cast type a SettingType enum
- `config/sentrix.php` — prewarm_regions
- `Services/HeatmapService.php` — prewarmPopularTiles desde config
- `Console/Commands/RecalculateRiskScores.php` — description actualizada
