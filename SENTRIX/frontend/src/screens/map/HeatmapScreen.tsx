import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  View, Text, ActivityIndicator, TouchableOpacity, Modal,
  FlatList, Switch, Alert,
} from 'react-native';
import MapView, { Heatmap as RNHeatmap, Region } from '@/components/map/MapView';
import { useHeatmap, useClusters, useRiskZones } from '@/hooks/useRiskZones';
import { useLocationContext } from '@/contexts/LocationContext';
import { useMapStore } from '@/store/mapStore';

const RISK_GRADIENT = {
  colors: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'],
  startPoints: [0.0, 0.25, 0.5, 0.75, 1.0],
  colorMapSize: 256,
};

const RISK_LEVELS = [
  { label: 'Muy Bajo', color: '#22c55e', range: '0–20', score: 0.1 },
  { label: 'Bajo', color: '#84cc16', range: '21–40', score: 0.3 },
  { label: 'Medio', color: '#eab308', range: '41–60', score: 0.5 },
  { label: 'Alto', color: '#f97316', range: '61–80', score: 0.75 },
  { label: 'Crítico', color: '#ef4444', range: '81–100', score: 0.95 },
];

const DEFAULT_REGION: Region = {
  latitude: -5.194,
  longitude: -80.632,
  latitudeDelta: 1,
  longitudeDelta: 1,
};

export default function HeatmapScreen() {
  const { location } = useLocationContext();
  const { heatmapData, setBounds, bounds, clusters, setClusters } = useMapStore();

  const [region, setRegion] = useState<Region>(() => ({
    ...DEFAULT_REGION,
    ...(location?.coords ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : {}),
  }));
  const [zoom, setZoom] = useState(10);
  const [opacity, setOpacity] = useState(0.7);
  const [showLegend, setShowLegend] = useState(true);
  const [showClusters, setShowClusters] = useState(false);
  const [heatmapRadius, setHeatmapRadius] = useState(40);
  const mapRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const derivedBounds = useMemo(() => ({
    north: region.latitude + region.latitudeDelta / 2,
    south: region.latitude - region.latitudeDelta / 2,
    east: region.longitude + region.longitudeDelta / 2,
    west: region.longitude - region.longitudeDelta / 2,
  }), [region.latitude, region.latitudeDelta, region.longitude, region.longitudeDelta]);

  const { isLoading: heatmapLoading } = useHeatmap(showClusters ? null : derivedBounds, zoom);
  const { isLoading: clusterLoading } = useClusters(showClusters ? derivedBounds : null, zoom);
  const { isLoading: zonesLoading } = useRiskZones(showClusters ? derivedBounds : null);

  const isLoading = heatmapLoading || clusterLoading || zonesLoading;

  const onRegionChangeComplete = useCallback((r: Region) => {
    setRegion(r);
    const newZoom = Math.round(Math.log2(360 / r.longitudeDelta));
    setZoom(newZoom);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBounds({
        north: r.latitude + r.latitudeDelta / 2,
        south: r.latitude - r.latitudeDelta / 2,
        east: r.longitude + r.longitudeDelta / 2,
        west: r.longitude - r.longitudeDelta / 2,
      });
    }, 300);
  }, [setBounds]);

  const heatmapPoints = useMemo(() => {
    if (showClusters) return [];
    return heatmapData.map((p) => ({
      latitude: p.lat,
      longitude: p.lng,
      weight: p.weight,
    }));
  }, [heatmapData, showClusters]);

  return (
    <View className="flex-1 bg-surface">
      <MapView
        ref={mapRef}
        className="flex-1"
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {heatmapPoints.length > 0 && (
          <RNHeatmap
            points={heatmapPoints}
            radius={heatmapRadius}
            opacity={opacity}
            gradient={RISK_GRADIENT}
          />
        )}
      </MapView>

      {isLoading && (
        <View className="absolute top-4 right-4 bg-white/90 rounded-full p-2 shadow-sm">
          <ActivityIndicator size="small" color="#03224d" />
        </View>
      )}

      <View className="absolute top-4 left-4 flex-row gap-2">
        <TouchableOpacity
          onPress={() => setShowLegend(!showLegend)}
          className="bg-white/90 px-3 py-2 rounded-xl shadow-sm"
        >
          <Text className="text-sentrix-600 text-xs font-medium">Leyenda</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => mapRef.current?.animateToRegion(DEFAULT_REGION, 500)}
          className="bg-white/90 px-3 py-2 rounded-xl shadow-sm"
        >
          <Text className="text-sentrix-600 text-xs font-medium">⋮</Text>
        </TouchableOpacity>
      </View>

      {showLegend && (
        <View className="absolute bottom-6 left-3 right-3 bg-white/95 rounded-xl p-4 border border-[#e0e3e6] shadow-md">
          <Text className="text-sentrix-900 font-bold mb-3">Niveles de Riesgo</Text>
          <View className="flex-row justify-between mb-3">
            {RISK_LEVELS.map((item) => (
              <View key={item.label} className="items-center flex-1">
                <View className="w-8 h-3 rounded-sm mb-1" style={{ backgroundColor: item.color }} />
                <Text className="text-sentrix-400 text-[10px]">{item.label}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sentrix-400 text-xs">Opacidad</Text>
            <View className="flex-row gap-2">
              {[0.3, 0.5, 0.7, 0.9].map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setOpacity(v)}
                  className={`px-3 py-1 rounded-xl ${opacity === v ? 'bg-sentrix-600' : 'bg-surface-container'}`}
                >
                  <Text className={`text-xs ${opacity === v ? 'text-white' : 'text-sentrix-900'}`}>{Math.round(v * 100)}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sentrix-400 text-xs">Radio</Text>
            <View className="flex-row gap-2">
              {[20, 30, 40, 50, 60].map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setHeatmapRadius(v)}
                  className={`px-3 py-1 rounded-xl ${heatmapRadius === v ? 'bg-sentrix-600' : 'bg-surface-container'}`}
                >
                  <Text className={`text-xs ${heatmapRadius === v ? 'text-white' : 'text-sentrix-900'}`}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-sentrix-400 text-xs">Clusters</Text>
            <Switch
              value={showClusters}
              onValueChange={setShowClusters}
              trackColor={{ false: '#c4c6d0', true: '#afc6fb' }}
              thumbColor="#03224d"
            />
          </View>
        </View>
      )}
    </View>
  );
}
