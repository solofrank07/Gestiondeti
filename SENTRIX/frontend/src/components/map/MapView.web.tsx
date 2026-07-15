import React, { createContext, useContext, useEffect, useState, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';

// El estilo del mapa puede quedar sin `style` si el contexto WebGL se pierde
// (tab en background, HMR, GPU). Evita que el cleanup de source/layer explote.
function isMapUsable(map: maplibregl.Map | null): map is maplibregl.Map {
  return !!map && !!(map as any).style;
}

function safeRemoveLayer(map: maplibregl.Map | null, id: string) {
  if (!isMapUsable(map)) return;
  try {
    if (map.getLayer(id)) map.removeLayer(id);
  } catch {}
}

function safeRemoveSource(map: maplibregl.Map | null, id: string) {
  if (!isMapUsable(map)) return;
  try {
    if (map.getSource(id)) map.removeSource(id);
  } catch {}
}

// Load MapLibre CSS dynamically on web
if (typeof window !== 'undefined' && !document.querySelector('link[href*="maplibre-gl.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css';
  document.head.appendChild(link);
}

const MapContext = createContext<maplibregl.Map | null>(null);

export const PROVIDER_GOOGLE = 'google';

export const MapView = forwardRef(({ children, style, initialRegion, onRegionChangeComplete }: any, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: any, duration = 500) => {
      if (map) {
        map.flyTo({
          center: [region.longitude, region.latitude],
          zoom: 12,
          duration,
        });
      }
    },
  }));

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [initialRegion?.longitude || -80.632, initialRegion?.latitude || -5.194],
      zoom: 12,
      attributionControl: false,
    });

    const reportRegion = () => {
      if (!onRegionChangeComplete) return;
      const center = mapInstance.getCenter();
      const bounds = mapInstance.getBounds();
      onRegionChangeComplete({
        latitude: center.lat,
        longitude: center.lng,
        // Delta real del viewport (no un valor fijo), para que el bounding
        // box consultado al backend coincida con lo que en verdad se ve.
        latitudeDelta: bounds.getNorth() - bounds.getSouth(),
        longitudeDelta: bounds.getEast() - bounds.getWest(),
      });
    };

    mapInstance.on('load', () => {
      setMap(mapInstance);
      // Dispara el primer fetch de inmediato; sin esto no habia bounds
      // hasta el primer pan/zoom manual del usuario.
      reportRegion();
    });

    mapInstance.on('moveend', reportRegion);

    return () => {
      mapInstance.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#0f172a',
      }}
    >
      {map && (
        <MapContext.Provider value={map}>
          {children}
        </MapContext.Provider>
      )}
    </div>
  );
});

export const Marker = ({ coordinate, children, onPress, draggable, onDrag, onDragEnd }: any) => {
  const map = useContext(MapContext);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<any>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const onDragRef = useRef(onDrag);
  onDragRef.current = onDrag;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const draggingRef = useRef(false);

  // Crea el DOM element / root / maplibregl.Marker una sola vez por mapa.
  // NO depende de `coordinate`: si el efecto se re-ejecutara en cada cambio
  // de posicion (ej. justo al soltar un drag, que actualiza el estado que
  // alimenta `coordinate`) se destruiria y recrearia el marker en pleno
  // gesto -> parpadeo/desaparicion y estres innecesario sobre el mapa.
  useEffect(() => {
    if (!map) return;

    const el = document.createElement('div');
    el.style.position = 'absolute';
    if (draggable) el.style.touchAction = 'none';
    containerRef.current = el;

    const handleClick = (e: MouseEvent) => onPressRef.current?.(e);
    el.addEventListener('click', handleClick);

    const marker = new maplibregl.Marker({ element: el, draggable: !!draggable })
      .setLngLat([coordinate.longitude, coordinate.latitude])
      .addTo(map);

    if (draggable) {
      // El pan del mapa compite por el mismo mousedown/touchstart que el
      // drag del marker; se desactiva mientras se arrastra.
      marker.on('dragstart', () => {
        draggingRef.current = true;
        map.dragPan.disable();
      });
      marker.on('drag', () => {
        const pos = marker.getLngLat();
        onDragRef.current?.({ latitude: pos.lat, longitude: pos.lng });
      });
      marker.on('dragend', () => {
        draggingRef.current = false;
        map.dragPan.enable();
        const pos = marker.getLngLat();
        onDragEndRef.current?.({ latitude: pos.lat, longitude: pos.lng });
      });
    }

    const root = createRoot(el);
    rootRef.current = root;
    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
      el.removeEventListener('click', handleClick);
      if (draggable && isMapUsable(map)) map.dragPan.enable();
      draggingRef.current = false;
      // Safe async unmount to prevent React 18 warnings
      setTimeout(() => {
        rootRef.current?.unmount();
        rootRef.current = null;
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, draggable]);

  // Reposiciona el marker existente cuando `coordinate` cambia por una via
  // externa (GPS, un input manual, etc.), sin tocar el DOM/marker. Se omite
  // mientras el usuario esta arrastrando para no pelear con maplibre.
  useEffect(() => {
    if (draggingRef.current || !markerRef.current) return;
    markerRef.current.setLngLat([coordinate.longitude, coordinate.latitude]);
  }, [coordinate.latitude, coordinate.longitude]);

  // Repinta solo el contenido cuando cambian los children, sin tocar el
  // marker/DOM element subyacente.
  useEffect(() => {
    rootRef.current?.render(<>{children}</>);
  }, [children]);

  return null;
};

function buildPolygonGeoJSON(coordinates: any[]) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates.map((c: any) => [c.longitude, c.latitude])],
    },
  } as any;
}

export const Polygon = ({ coordinates, fillColor, strokeColor, strokeWidth }: any) => {
  const map = useContext(MapContext);
  const id = useMemo(() => `polygon-${Math.random().toString(36).substring(2, 9)}`, []);

  // Crea source/layer una sola vez. Recrearlos en cada poll (ej. cuando
  // `coordinates` llega como array nuevo aunque los puntos sean iguales)
  // acumula sources/layers sin liberar a tiempo y degrada el mapa.
  useEffect(() => {
    if (!isMapUsable(map)) return;

    map.addSource(id, { type: 'geojson', data: buildPolygonGeoJSON(coordinates) });

    map.addLayer({
      id: `${id}-fill`,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': fillColor || '#ef4444',
        'fill-opacity': 0.25,
      },
    });

    map.addLayer({
      id: `${id}-outline`,
      type: 'line',
      source: id,
      paint: {
        'line-color': strokeColor || '#ef4444',
        'line-width': strokeWidth || 2,
      },
    });

    return () => {
      safeRemoveLayer(map, `${id}-fill`);
      safeRemoveLayer(map, `${id}-outline`);
      safeRemoveSource(map, id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (!isMapUsable(map)) return;
    const source = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
    if (source) source.setData(buildPolygonGeoJSON(coordinates));
  }, [map, coordinates]);

  useEffect(() => {
    if (!isMapUsable(map)) return;
    try {
      map.setPaintProperty(`${id}-fill`, 'fill-color', fillColor || '#ef4444');
      map.setPaintProperty(`${id}-outline`, 'line-color', strokeColor || '#ef4444');
      map.setPaintProperty(`${id}-outline`, 'line-width', strokeWidth || 2);
    } catch {}
  }, [map, fillColor, strokeColor, strokeWidth]);

  return null;
};

function buildCircleGeoJSON(center: { latitude: number; longitude: number }, radius: number) {
  const points = 64;
  const coords: any = [];
  const distanceX = radius / (111.32 * 1000 * Math.cos((center.latitude * Math.PI) / 180));
  const distanceY = radius / (110.574 * 1000);

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([center.longitude + distanceX * Math.cos(theta), center.latitude + distanceY * Math.sin(theta)]);
  }
  coords.push(coords[0]);

  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
  } as any;
}

export const Circle = ({ center, radius, fillColor, strokeColor, strokeWidth }: any) => {
  const map = useContext(MapContext);
  const id = useMemo(() => `circle-${Math.random().toString(36).substring(2, 9)}`, []);

  // Crea source/layer una sola vez por instancia de mapa.
  useEffect(() => {
    if (!isMapUsable(map)) return;

    map.addSource(id, { type: 'geojson', data: buildCircleGeoJSON(center, radius) });

    map.addLayer({
      id: `${id}-fill`,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': fillColor || '#ef4444',
        'fill-opacity': 0.2,
      },
    });

    map.addLayer({
      id: `${id}-outline`,
      type: 'line',
      source: id,
      paint: {
        'line-color': strokeColor || '#ef4444',
        'line-width': strokeWidth || 2,
      },
    });

    return () => {
      safeRemoveLayer(map, `${id}-fill`);
      safeRemoveLayer(map, `${id}-outline`);
      safeRemoveSource(map, id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Actualiza solo la geometria cuando cambia centro/radio (sin recrear layers),
  // asi el arrastre del radio queda fluido.
  useEffect(() => {
    if (!isMapUsable(map)) return;
    const source = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
    if (source) source.setData(buildCircleGeoJSON(center, radius));
  }, [map, center.latitude, center.longitude, radius]);

  return null;
};

function buildHeatmapGeoJSON(points: any[]) {
  return {
    type: 'FeatureCollection',
    features: (points || []).map((p: any) => ({
      type: 'Feature',
      properties: { weight: p.weight || 1 },
      geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
    })),
  } as any;
}

export const Heatmap = ({ points, radius, opacity, gradient }: any) => {
  const map = useContext(MapContext);
  const id = useMemo(() => `heatmap-${Math.random().toString(36).substring(2, 9)}`, []);

  // Crea source/layer una sola vez. Recrearlos en cada poll (ej. cuando
  // `points` llega como array nuevo aunque los datos sean iguales) acumula
  // sources/layers sin liberar a tiempo y degrada el mapa.
  useEffect(() => {
    if (!isMapUsable(map)) return;

    map.addSource(id, { type: 'geojson', data: buildHeatmapGeoJSON(points) });

    map.addLayer({
      id: `${id}-layer`,
      type: 'heatmap',
      source: id,
      paint: {
        'heatmap-weight': ['get', 'weight'],
        'heatmap-radius': radius || 30,
        'heatmap-opacity': opacity || 0.7,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(0,0,255,0)',
          0.2,
          gradient?.colors?.[0] || '#22c55e',
          0.4,
          gradient?.colors?.[1] || '#84cc16',
          0.6,
          gradient?.colors?.[2] || '#eab308',
          0.8,
          gradient?.colors?.[3] || '#f97316',
          1.0,
          gradient?.colors?.[4] || '#ef4444',
        ],
      },
    });

    return () => {
      safeRemoveLayer(map, `${id}-layer`);
      safeRemoveSource(map, id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (!isMapUsable(map)) return;
    const source = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
    if (source) source.setData(buildHeatmapGeoJSON(points));
  }, [map, points]);

  useEffect(() => {
    if (!isMapUsable(map)) return;
    try {
      map.setPaintProperty(`${id}-layer`, 'heatmap-radius', radius || 30);
      map.setPaintProperty(`${id}-layer`, 'heatmap-opacity', opacity || 0.7);
    } catch {}
  }, [map, radius, opacity]);

  return null;
};

export default MapView;
