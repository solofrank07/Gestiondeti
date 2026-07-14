import React, { createContext, useContext, useEffect, useState, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';

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

    mapInstance.on('load', () => {
      setMap(mapInstance);
    });

    mapInstance.on('moveend', () => {
      if (onRegionChangeComplete) {
        const center = mapInstance.getCenter();
        onRegionChangeComplete({
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }
    });

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

export const Marker = ({ coordinate, children, onPress }: any) => {
  const map = useContext(MapContext);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    const el = document.createElement('div');
    el.style.position = 'absolute';
    containerRef.current = el;

    if (onPress) {
      el.addEventListener('click', onPress);
    }

    const root = createRoot(el);
    rootRef.current = root;
    root.render(<>{children}</>);

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([coordinate.longitude, coordinate.latitude])
      .addTo(map);

    return () => {
      marker.remove();
      if (onPress) {
        el.removeEventListener('click', onPress);
      }
      // Safe async unmount to prevent React 18 warnings
      setTimeout(() => {
        if (rootRef.current) {
          rootRef.current.unmount();
        }
      }, 0);
    };
  }, [map, coordinate.latitude, coordinate.longitude, children, onPress]);

  return null;
};

export const Polygon = ({ coordinates, fillColor, strokeColor, strokeWidth }: any) => {
  const map = useContext(MapContext);
  const id = useMemo(() => `polygon-${Math.random().toString(36).substring(2, 9)}`, []);

  useEffect(() => {
    if (!map) return;

    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates.map((c: any) => [c.longitude, c.latitude])],
        },
      } as any,
    });

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
      if (map.getLayer(`${id}-fill`)) map.removeLayer(`${id}-fill`);
      if (map.getLayer(`${id}-outline`)) map.removeLayer(`${id}-outline`);
      if (map.getSource(id)) map.removeSource(id);
    };
  }, [map, coordinates, fillColor, strokeColor, strokeWidth]);

  return null;
};

export const Circle = ({ center, radius, fillColor, strokeColor, strokeWidth }: any) => {
  const map = useContext(MapContext);
  const id = useMemo(() => `circle-${Math.random().toString(36).substring(2, 9)}`, []);

  useEffect(() => {
    if (!map) return;

    // Generate circle coordinates
    const points = 64;
    const coords: any = [];
    const distanceX = radius / (111.32 * 1000 * Math.cos((center.latitude * Math.PI) / 180));
    const distanceY = radius / (110.574 * 1000);

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coords.push([center.longitude + x, center.latitude + y]);
    }
    coords.push(coords[0]);

    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords],
        },
      } as any,
    });

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
      if (map.getLayer(`${id}-fill`)) map.removeLayer(`${id}-fill`);
      if (map.getLayer(`${id}-outline`)) map.removeLayer(`${id}-outline`);
      if (map.getSource(id)) map.removeSource(id);
    };
  }, [map, center.latitude, center.longitude, radius, fillColor, strokeColor, strokeWidth]);

  return null;
};

export const Heatmap = ({ points, radius, opacity, gradient }: any) => {
  const map = useContext(MapContext);
  const id = useMemo(() => `heatmap-${Math.random().toString(36).substring(2, 9)}`, []);

  useEffect(() => {
    if (!map || !points?.length) return;

    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: points.map((p: any) => ({
          type: 'Feature',
          properties: {
            weight: p.weight || 1,
          },
          geometry: {
            type: 'Point',
            coordinates: [p.longitude, p.latitude],
          },
        })),
      } as any,
    });

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
      if (map.getLayer(`${id}-layer`)) map.removeLayer(`${id}-layer`);
      if (map.getSource(id)) map.removeSource(id);
    };
  }, [map, points, radius, opacity, gradient]);

  return null;
};

export default MapView;
