import React, { useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useRiskZones } from '@/hooks/useRiskZones';
import { useLocationContext } from '@/contexts/LocationContext';
import { useMapStore } from '@/store/mapStore';
import RiskZonePolygon from '@/components/map/RiskZonePolygon';

export default function MapScreen() {
  const { location, requestPermission } = useLocationContext();
  const { bounds, setBounds } = useMapStore();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = React.useState<Region>({
    latitude: location?.coords.latitude || -5.194,
    longitude: location?.coords.longitude || -80.632,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  const { isLoading } = useRiskZones(bounds);
  const riskZones = useMapStore((s) => s.riskZones);

  React.useEffect(() => { requestPermission(); }, []);

  const onRegionChangeComplete = useCallback((r: Region) => {
    setRegion(r);
    setBounds({
      north: r.latitude + r.latitudeDelta / 2,
      south: r.latitude - r.latitudeDelta / 2,
      east: r.longitude + r.longitudeDelta / 2,
      west: r.longitude - r.longitudeDelta / 2,
    });
  }, []);

  if (!location) {
    return (
      <View className="flex-1 bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-gray-400 mt-4">Obteniendo ubicación...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        className="flex-1"
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton
        showsTraffic
        rotateEnabled
      >
        {riskZones.map((zone) => (
          <RiskZonePolygon key={zone.id} zone={zone} />
        ))}
      </MapView>

      {isLoading && (
        <View className="absolute top-4 right-4 bg-gray-900/80 rounded-full p-2">
          <ActivityIndicator size="small" color="#22c55e" />
        </View>
      )}

      <View className="absolute bottom-6 left-4 right-4 bg-gray-900/90 rounded-xl p-4">
        <Text className="text-green-500 font-bold text-lg">SENTRIX</Text>
        <Text className="text-gray-400 text-sm">Zonas de riesgo: {riskZones.length}</Text>
      </View>
    </View>
  );
}
