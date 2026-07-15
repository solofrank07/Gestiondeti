# Radio Ajustable — Contexto Completo

## 1. Resumen

Dos entidades principales usan radio ajustable via slider:
- **Reportes ciudadanos**: radio que define area afectada por el incidente (10-1000m).
- **Zonas de Riesgo**: radio que define el poligono circular de una zona de vigilancia (10-10000m).

Ambos se renderizan como circulos en el mapa usando el componente `Circle` de MapView. El slider es un componente cross-platform compartido.

---

## 2. Slider Component

**Archivo**: `frontend/src/components/shared/Slider.tsx`

- Props: `value`, `min`, `max`, `step`, `onValueChange`
- **Web**: `<input type="range">` nativo con `accentColor: '#03224d'`.
- **Native**: PanResponder manual. Track de 6px de alto, thumb de 24x24px. Calcula valor por posicion X sobre el ancho del track.
- Sin dependencias externas. Reemplaza a `@react-native-community/slider`.

**Uso tipico**:
```tsx
<Slider value={radius} min={10} max={1000} step={10} onValueChange={setRadius} />
```

---

## 3. Reportes — Radio Ciudadano

### 3.1. Backend

**Migration**: `backend/database/migrations/2026_07_13_224000_add_radius_to_reports.php`
```php
$table->integer('radius')->nullable()->after('address');
```

**Model** `backend/app/Models/Report.php`: `$fillable` incluye `'radius'`. Sin cast especial (integer nativo).

**Validation** `backend/app/Requests/StoreReportRequest.php`:
```php
'radius' => 'nullable|integer|min:0|max:5000',
```

**Service** `backend/app/Services/ReportService.php`: `create()` pasa `$data['radius']` directamente al repositorio. Sin logica especial.

### 3.2. Frontend — Store

`frontend/src/store/reportStore.ts`:

```typescript
interface DraftReport {
  lat?: number;
  lng?: number;
  address?: string;
  isAnonymous: boolean;
  crimeType?: string;
  description?: string;
  evidence?: string[];
  incidentDate?: string;
  radius?: number; // <-- campo anadido
}

// Actions
setRadius: (r: number) => set((s) => ({ draft: { ...s.draft, radius } })),
```

Valor default en store: `undefined`. En `defaultDraft` no se incluye (se inicializa como undefined).

### 3.3. Frontend — Types

`frontend/src/types/report.ts`:

```typescript
export interface CreateReportRequest {
  // ...
  radius?: number;
}
```

### 3.4. Frontend — Paso1 (Picker)

`frontend/src/screens/reports/ReportePaso1Screen.tsx`:

1. Obtiene ubicacion con `expo-location`.
2. Renderiza `MapView` de 280px de alto con `Circle` centrado en ubicacion del usuario.
3. Slider debajo del mapa con rango 10-1000m, step 10.
4. Al presionar "Continuar": `setRadius(radius)` en store, navega a paso2.

**Map zoom ajustable por radio**:
```tsx
latitudeDelta: radius > 500 ? 0.05 : 0.02,
```

**Circle en mapa**:
```tsx
<Circle
  center={{ latitude: lat, longitude: lng }}
  radius={radius}
  fillColor="#03224d"
  strokeColor="#03224d"
  strokeWidth={2}
/>
```

### 3.5. Frontend — Confirmar (Submit)

`frontend/src/screens/reports/ConfirmarReporteScreen.tsx`:

```typescript
radius: draft.radius || undefined, // se pasa al createReport
```

`reportService.createReport()` usa `FormData`, el campo `radius` se aniade como string.

### 3.6. Frontend — Mapa Principal (Render)

`frontend/src/screens/map/MapScreen.tsx`:

```tsx
{reports.map((r: any) => (
  <React.Fragment key={r.id}>
    {r.radius ? (
      <Circle
        center={{ latitude: r.latitude, longitude: r.longitude }}
        radius={r.radius}
        fillColor={r.priority === 'critica' ? '#ef4444' : r.priority === 'alta' ? '#f97316' : '#3b82f6'}
        strokeColor={r.priority === 'critica' ? '#ef4444' : r.priority === 'alta' ? '#f97316' : '#3b82f6'}
        strokeWidth={2}
      />
    ) : null}
    <Marker ... />
  </React.Fragment>
))}
```

Color por prioridad: critica=rojo, alta=naranja, media/baja=azul.

---

## 4. Zonas de Riesgo — Radio Administrativo

### 4.1. Backend

**Model** `backend/app/Models/RiskZone.php`:
```php
protected $fillable = [
  // ...
  'radius_meters',
];
protected function casts(): array {
  return [
    'radius_meters' => 'decimal:2',
  ];
}
```

Usado en `invalidateHeatmapCache`: `($zone->radius_meters ?? 500) / 1000 + 2`

**Controller** `backend/app/Controllers/Admin/RiskZoneController.php`:
```php
'radius_meters' => 'required|numeric|min:10|max:10000',  // store
'radius_meters' => 'sometimes|numeric|min:10|max:10000', // update
```

**Routes** `backend/routes/api.php` (admin group):
```php
Route::get('admin/risk-zones', [RiskZoneController::class, 'index']);
Route::post('admin/risk-zones', [RiskZoneController::class, 'store']);
Route::get('admin/risk-zones/{id}', [RiskZoneController::class, 'show']);
Route::put('admin/risk-zones/{id}', [RiskZoneController::class, 'update']);
Route::delete('admin/risk-zones/{id}', [RiskZoneController::class, 'destroy']);
Route::get('risk-levels', [RiskZoneController::class, 'riskLevels']);
```

### 4.2. Frontend — Service

`frontend/src/services/riskZoneService.ts`:
```typescript
export const riskZoneService = {
  async getAll()        { return (await api.get(ENDPOINTS.ADMIN_RISK_ZONES)).data; },
  async get(id)         { return (await api.get(ENDPOINTS.ADMIN_RISK_ZONE(id))).data; },
  async create(data)    { return (await api.post(ENDPOINTS.ADMIN_RISK_ZONES, data)).data; },
  async update(id,data) { return (await api.put(ENDPOINTS.ADMIN_RISK_ZONE(id), data)).data; },
  async deactivate(id)  { return (await api.delete(ENDPOINTS.ADMIN_RISK_ZONE(id))).data; },
  async getRiskLevels() { return (await api.get(ENDPOINTS.RISK_LEVELS)).data; },
};
```

### 4.3. Frontend — Screen de Gestion

`frontend/src/screens/admin/ZonasRiesgoScreen.tsx`:

- Lista zonas (tap=editar, long press=desactivar).
- Modal create/edit con campos: nombre, descripcion, lat, lng, **radius_meters** (input numerico), nivel de riesgo, risk score.
- Radio actualmente es `TextInput` con teclado numerico, NO slider (pendiente de mejora).
- Flujo: fetch al montar, POST/PUT segun editingId, DELETE como soft-deactivate (`is_active=false`).

### 4.4. Frontend — Mapa Principal (Render RiskZones)

Usa `RiskZonePolygon` (no Circle). El render de risk zones en el mapa se maneja con poligonos desde `backend` via `map/risk-zones` endpoint. Las risk zones NO usan Circle actualmente, usan Polygon con coordenadas de boundaries (si existen) o se aproximan.

---

## 5. MapView — Componente Circle

### 5.1. Native (MapLibre)

`frontend/src/components/map/MapView.tsx`:

```tsx
export const Circle = ({ center, radius, fillColor, strokeColor, strokeWidth }: any) => {
  const points = 64;
  const coords: any = [];
  const distanceX = radius / (111.32 * 1000 * Math.cos((center.latitude * Math.PI) / 180));
  const distanceY = radius / (110.574 * 1000);
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([center.longitude + distanceX * Math.cos(theta), center.latitude + distanceY * Math.sin(theta)]);
  }
  coords.push(coords[0]);
  // Renderiza como GeoJSON Polygon fill + line layers
};
```

**IMPORTANTE**: El calculo es aproximado (asume Tierra es esfera perfecta). Suficiente para radios <10km.

### 5.2. Web (MapLibre GL JS)

`frontend/src/components/map/MapView.web.tsx`: misma logica matematica pero anade/remueve sources y layers directamente sobre el map instance de maplibregl via `useEffect`.

---

## 6. Dependencias Cross-Platform

| Plataforma | Libreria Mapa | Circle | Slider |
|-----------|---------------|--------|--------|
| Web | maplibre-gl (via unpkg) | GeoJSON Polygon + layers | `<input type="range">` |
| Native (iOS/Android) | @maplibre/maplibre-react-native | GeoJSON Polygon + layers | PanResponder manual |

- `@react-native-community/slider` **NO se usa**. Se reemplazo por componente custom `Slider.tsx`.
- Tiles: OpenFreeMap `https://tiles.openfreemap.org/styles/liberty` (gratis, sin API key).

---

## 7. Flujo Completo: Crear Reporte con Radio

```
Usuario abre app
  → Presiona FAB "+" en MapScreen
  → Paso1Screen:
     - Obtiene ubicacion GPS
     - Renderiza mapa 280px + Circle en ubicacion
     - Slider ajusta radio (10-1000m)
     - Evidencia opcional (foto/video/audio)
     - "Continuar" → setRadius en store → navega paso2
  → Paso2Screen:
     - Tipo delito (selector), fecha incidente, descripcion
     - "Continuar" → navega confirmar
  → ConfirmarScreen:
     - Muestra resumen: direccion, tipo, descripcion, anonimo
     - "Enviar reporte" → POST /api/v1/reports con radius en FormData
     - Invalida queryKey ['reports','nearby'] → nuevo reporte aparece en mapa con circulo
```

---

## 8. Mejoras Pendientes

1. **ZonasRiesgoScreen**: reemplazar TextInput de `radius_meters` por `Slider` con rango 10-10000m, igual que en Paso1Screen.
2. **RiskZonePolygon vs Circle**: decidir si risk zones usan Circle (igual que reports) o mantienen Polygon con boundaries cargados desde backend.
3. **Preview de risk zone en el mapa al crear/editar**: igual que Paso1Screen, mostrar mapa con circulo mientras se ajusta el slider.
4. **Validacion backend**: `radius` en reports usa `max:5000`, en risk zones `max:10000`. Decidir si unificar.
5. **Debounce en slider**: para evitar re-renders excesivos del mapa al arrastrar.

---

## 9. Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `frontend/src/components/shared/Slider.tsx` | Componente slider cross-platform |
| `frontend/src/components/map/MapView.tsx` | Circle component (Native MapLibre) |
| `frontend/src/components/map/MapView.web.tsx` | Circle component (Web MapLibre) |
| `frontend/src/screens/reports/ReportePaso1Screen.tsx` | Mapa + slider para radio del reporte |
| `frontend/src/screens/reports/ConfirmarReporteScreen.tsx` | Envio con radius en payload |
| `frontend/src/screens/map/MapScreen.tsx` | Renderiza circulos de reportes existentes |
| `frontend/src/screens/admin/ZonasRiesgoScreen.tsx` | CRUD zonas con radius_meters |
| `frontend/src/services/riskZoneService.ts` | API calls para risk zones |
| `frontend/src/store/reportStore.ts` | Draft con campo radius |
| `frontend/src/types/report.ts` | CreateReportRequest.radius |
| `backend/database/migrations/2026_07_13_224000_add_radius_to_reports.php` | Migracion radius column |
| `backend/app/Models/Report.php` | fillable incluye radius |
| `backend/app/Models/RiskZone.php` | fillable incluye radius_meters |
| `backend/app/Requests/StoreReportRequest.php` | Validacion radius (0-5000) |
| `backend/app/Services/ReportService.php` | Passthrough radius a repositorio |
| `backend/app/Controllers/Admin/RiskZoneController.php` | CRUD con radius_meters |
| `backend/routes/api.php` | Rutas admin risk zones |
