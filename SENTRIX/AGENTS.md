# SENTRIX — Agent Guide

## Structure

Monorepo with two independent projects, no root-level build or config files:

- `backend/` — Laravel 13.x / PHP 8.3 API (REST, JSON)
- `frontend/` — React Native / Expo 52 mobile app (TypeScript, Expo Router)

## Backend (Laravel)

### Architecture

`Controller -> Service -> Repository (Interface) -> Model`

Interfaces in `app/Interfaces/`, implementations in `app/Repositories/`, bound in `RepositoryServiceProvider`.

### Auth

Sanctum SPA tokens. Two middleware: `JwtMiddleware` (token parse/validate), `RoleMiddleware` (role gate). Roles: `Ciudadano`, `Autoridad`, `Administrador`.

### Commands

```bash
# Full dev (server + queue + logs + vite, concurrent)
composer run dev           # runs from backend/

# Test (config:clear first, then phpunit)
composer run test          # runs from backend/

# Artisan shortcuts
php artisan prewarm:heatmap-cache
php artisan recalculate:risk-scores
```

### Testing

PHPUnit 12 (via `composer run test`). Config in `phpunit.xml` — uses SQLite in-memory, array cache, sync queue. Auth test suite at `tests/Feature/Auth/AuthTest.php` (14 tests). Run single file: `php artisan test tests/Feature/Auth/AuthTest.php`.

### Code Style

Laravel Pint (`vendor/bin/pint`) for PHP formatting.

### Key Config Files

- `config/sentrix.php` — app-specific settings (heatmap, risk scoring, geofence)
- `config/l5-swagger.php` — Swagger/OpenAPI doc generation from `@OA` annotations
- `.env` — expects MySQL, Redis, SANCTUM_STATEFUL_DOMAINS, FRONTEND_URL, ETL API keys

### Noteworthy

- API routes at `/api/v1/` (see `routes/api.php`)
- 34 migrations, 7 seeders (run `php artisan db:seed`)
- Heatmap uses KDE with DB-cached tiles (15-min TTL)
- RiskScoreService: 9-factor weighted score
- AIService: local heuristics + stats (no external AI API)
- ETL: CSV import + MININTER/INEI API fetch, dedup 24h window
- Console commands exist for heatmap prewarm and risk score recalculation
- Queue worker: `php artisan queue:listen --tries=1 --timeout=0`

## Frontend (Expo / React Native)

### Commands (run from `frontend/`)

```bash
npm start                  # Expo dev server
npm run web                # Web build
npm run lint               # ESLint (no config found — may be no-op)
npm run typecheck          # tsc --noEmit
```

### Architecture

- File-based routing via Expo Router (`app/` directory, `(auth)/` and `(tabs)/` groups)
- State: Zustand (presisted via AsyncStorage in `authStore`), React Query 5 for server state
- UI: NativeWind (Tailwind for RN), dark theme (`#0f172a` background)
- Forms: React Hook Form + Yup
- HTTP: Axios instance with interceptors in `src/services/api.ts`

### Project Quirks

- `@/*` path alias maps to `src/*` (configured in `tsconfig.json`)
- `react-native-maps` swapped for a mock on web in `metro.config.js` (mock at `src/mocks/react-native-maps.web.tsx`)
- `react-native-worklets-mock/` is a local no-op package (not published) — do not modify
- No test framework configured (no Jest/Vitest in dependencies)
- ESLint declared as script but no eslint config file present

### Key Source Paths

| Purpose | Path |
|---------|------|
| API client + interceptors | `src/services/api.ts` |
| Auth context | `src/contexts/AuthContext.tsx` |
| Zustand stores | `src/store/` |
| TypeScript types | `src/types/` |
| Constants (colors, API endpoints) | `src/constants/` |
| Shared UI components | `src/components/shared/` |
| Map components | `src/components/map/` |
| Chart components | `src/components/charts/` |
| Expo config | `app.json` |

## General

- No CI/CD, no GitHub Actions workflows
- No existing instruction files to preserve
- Locale: Spanish (`es`, `es_PE` for faker)
- App name/scheme: `sentrix`, bundle ID: `pe.sentrix.app`
- Google Maps API key expected in env (`GOOGLE_MAPS_API_KEY`, `API_URL`)
