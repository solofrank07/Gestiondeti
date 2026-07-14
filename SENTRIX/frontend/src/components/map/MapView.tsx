// @ts-nocheck — platform ext; Metro resuelve, tsc no entiende .native.tsx
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Map as MLMap,
  Camera as MLCamera,
  Marker as MLMarker,
  GeoJSONSource as MLGeoJSONSource,
  Layer as MLLayer,
} from '@maplibre/maplibre-react-native';

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const PROVIDER_GOOGLE = 'google';

export const MapView = forwardRef(({ children, style, initialRegion, onRegionChangeComplete }: any, ref) => {
  const cameraRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region, duration = 500) => {
      cameraRef.current?.setCamera({
        centerCoordinate: [region.longitude, region.latitude],
        zoomLevel: 12,
        duration,
      });
    },
  }));

  const handleRegionChange = async (state: any) => {
    if (onRegionChangeComplete && state?.properties?.center) {
      const center = state.properties.center;
      onRegionChangeComplete({
        latitude: center[1],
        longitude: center[0],
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  };

  return (
    <MLMap
      style={[styles.map, style]}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      onRegionDidChange={handleRegionChange}
    >
      <MLCamera
        ref={cameraRef}
        initialViewState={{
          centerCoordinate: [initialRegion?.longitude || -80.632, initialRegion?.latitude || -5.194],
          zoomLevel: 12,
        }}
      />
      {children}
    </MLMap>
  );
});

export const Marker = ({ coordinate, children, onPress }: any) => {
  return (
    <MLMarker
      lngLat={[coordinate.longitude, coordinate.latitude]}
      anchor="bottom"
      onPress={onPress}
    >
      {children}
    </MLMarker>
  );
};

export const Polygon = ({ coordinates, fillColor, strokeColor, strokeWidth }: any) => {
  const id = React.useMemo(() => Math.random().toString(36).substring(2, 9), []);

  return (
    <MLGeoJSONSource
      id={`polygon-source-${id}`}
      data={{
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [coordinates.map((c: any) => [c.longitude, c.latitude])],
            },
          },
        ],
      }}
    >
      <MLLayer
        id={`polygon-fill-${id}`}
        type="fill"
        style={{ fillOpacity: 0.25, fillColor: fillColor || '#ef4444' }}
      />
      <MLLayer
        id={`polygon-outline-${id}`}
        type="line"
        style={{ lineColor: strokeColor || '#ef4444', lineWidth: strokeWidth || 2 }}
      />
    </MLGeoJSONSource>
  );
};

export const Circle = ({ center, radius, fillColor, strokeColor, strokeWidth }: any) => {
  const id = React.useMemo(() => Math.random().toString(36).substring(2, 9), []);
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

  return (
    <MLGeoJSONSource
      id={`circle-source-${id}`}
      data={{
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [coords],
            },
          },
        ],
      }}
    >
      <MLLayer
        id={`circle-fill-${id}`}
        type="fill"
        style={{ fillOpacity: 0.2, fillColor: fillColor || '#ef4444' }}
      />
      <MLLayer
        id={`circle-outline-${id}`}
        type="line"
        style={{ lineColor: strokeColor || '#ef4444', lineWidth: strokeWidth || 2 }}
      />
    </MLGeoJSONSource>
  );
};

export const Heatmap = ({ points, radius, opacity, gradient }: any) => {
  const id = React.useMemo(() => Math.random().toString(36).substring(2, 9), []);

  return (
    <MLGeoJSONSource
      id={`heatmap-source-${id}`}
      data={{
        type: 'FeatureCollection',
        features: points.map((p: any) => ({
          type: 'Feature',
          properties: { weight: p.weight || 1 },
          geometry: {
            type: 'Point',
            coordinates: [p.longitude, p.latitude],
          },
        })),
      }}
    >
      <MLLayer
        id={`heatmap-layer-${id}`}
        type="heatmap"
        style={{
          heatmapWeight: ['get', 'weight'] as any,
          heatmapRadius: radius || 30,
          heatmapOpacity: opacity || 0.7,
          heatmapColor: [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,255,0)',
            0.2, gradient?.colors?.[0] || '#22c55e',
            0.4, gradient?.colors?.[1] || '#84cc16',
            0.6, gradient?.colors?.[2] || '#eab308',
            0.8, gradient?.colors?.[3] || '#f97316',
            1.0, gradient?.colors?.[4] || '#ef4444',
          ] as any,
        }}
      />
    </MLGeoJSONSource>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
});

export default MapView;
