import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

// Initialize MapLibre GL
MapLibreGL.setAccessToken(null);

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const PROVIDER_GOOGLE = 'google';

export const MapView = forwardRef(({ children, style, initialRegion, onRegionChangeComplete }: any, ref) => {
  const cameraRef = useRef<MapLibreGL.Camera>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region, duration = 500) => {
      cameraRef.current?.setCamera({
        centerCoordinate: [region.longitude, region.latitude],
        zoomLevel: 12,
        duration,
      });
    },
  }));

  const handleRegionChange = async (feature: any) => {
    if (onRegionChangeComplete) {
      const zoom = await cameraRef.current?.getZoom();
      const center = feature.geometry.coordinates; // [lng, lat]
      onRegionChangeComplete({
        latitude: center[1],
        longitude: center[0],
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  };

  return (
    <MapLibreGL.MapView
      style={[styles.map, style]}
      styleURL="https://tiles.openfreemap.org/styles/liberty"
      onRegionDidChange={handleRegionChange}
      logoEnabled={false}
      attributionEnabled={false}
    >
      <MapLibreGL.Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: [initialRegion?.longitude || -80.632, initialRegion?.latitude || -5.194],
          zoomLevel: 12,
        }}
      />
      {children}
    </MapLibreGL.MapView>
  );
});

export const Marker = ({ coordinate, title, description, children }: any) => {
  return (
    <MapLibreGL.MarkerView coordinate={[coordinate.longitude, coordinate.latitude]}>
      {children}
    </MapLibreGL.MarkerView>
  );
};

export const Polygon = ({ coordinates, fillColor, strokeColor, strokeWidth }: any) => {
  const geojson = {
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
  };

  const id = React.useMemo(() => Math.random().toString(), []);

  return (
    <MapLibreGL.ShapeSource id={`polygon-source-${id}`} shape={geojson as any}>
      <MapLibreGL.FillLayer
        id={`polygon-fill-${id}`}
        style={{ fillBackground: fillColor }}
      />
      <MapLibreGL.LineLayer
        id={`polygon-outline-${id}`}
        style={{ lineColor: strokeColor, lineWidth: strokeWidth }}
      />
    </MapLibreGL.ShapeSource>
  );
};

export const Circle = ({ center, radius, fillColor, strokeColor, strokeWidth }: any) => {
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
  coords.push(coords[0]); // Close polygon

  const geojson = {
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
  };

  const id = React.useMemo(() => Math.random().toString(), []);

  return (
    <MapLibreGL.ShapeSource id={`circle-source-${id}`} shape={geojson as any}>
      <MapLibreGL.FillLayer
        id={`circle-fill-${id}`}
        style={{ fillBackground: fillColor }}
      />
      <MapLibreGL.LineLayer
        id={`circle-outline-${id}`}
        style={{ lineColor: strokeColor, lineWidth: strokeWidth }}
      />
    </MapLibreGL.ShapeSource>
  );
};

export const Heatmap = ({ points, radius, opacity, gradient }: any) => {
  const geojson = {
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
  };

  const id = React.useMemo(() => Math.random().toString(), []);

  return (
    <MapLibreGL.ShapeSource id={`heatmap-source-${id}`} shape={geojson as any}>
      <MapLibreGL.HeatmapLayer
        id={`heatmap-layer-${id}`}
        style={{
          heatmapWeight: ['get', 'weight'],
          heatmapRadius: radius || 30,
          heatmapOpacity: opacity || 0.7,
          heatmapColor: [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0,0,255,0)',
            0.2,
            gradient.colors[0],
            0.4,
            gradient.colors[1],
            0.6,
            gradient.colors[2],
            0.8,
            gradient.colors[3],
            1.0,
            gradient.colors[4],
          ],
        }}
      />
    </MapLibreGL.ShapeSource>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapView;
