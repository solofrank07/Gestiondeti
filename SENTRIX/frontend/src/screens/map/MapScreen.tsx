import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Region, Marker, Circle } from '@/components/map/MapView';
import { Search, MapPin, Mic } from '@/components/shared/Icons';
import { useRiskZones } from '@/hooks/useRiskZones';
import { useLocationContext } from '@/contexts/LocationContext';
import { useMapStore } from '@/store/mapStore';
import RiskZonePolygon from '@/components/map/RiskZonePolygon';
import { router } from 'expo-router';
import { useNearbyReports } from '@/hooks/useReports';

const CRIME_FILTERS = ['Todos', 'Hurto', 'Robo agravado', 'Extorsión', 'Sicariato'];
const RISK_LEVELS = [
  { label: 'Bajo', color: '#22c55e' },
  { label: 'Medio', color: '#eab308' },
  { label: 'Alto', color: '#ef4444' },
];

export default function MapScreen() {
  const { location, requestPermission } = useLocationContext();
  const { bounds, setBounds } = useMapStore();
  const mapRef = useRef<any>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [region, setRegion] = useState<Region>({
    latitude: location?.coords.latitude || -5.194,
    longitude: location?.coords.longitude || -80.632,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  const { isLoading } = useRiskZones(bounds);
  const riskZones = useMapStore((s) => s.riskZones);
  const { data: nearbyReports } = useNearbyReports(region.latitude, region.longitude);
  const reports = Array.isArray(nearbyReports) ? nearbyReports : [];

  React.useEffect(() => { requestPermission(); }, []);

  const onRegionChangeComplete = useCallback((r: Region) => {
    setRegion(r);
    setBounds({
      north: r.latitude + r.latitudeDelta / 2,
      south: r.latitude - r.latitudeDelta / 2,
      east: r.longitude + r.longitudeDelta / 2,
      west: r.longitude - r.longitudeDelta / 2,
    });
  }, [setBounds]);

  if (!location) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f7f9fc', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#03224d" />
        <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#44474f', marginTop: 12 }}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {riskZones.map((zone) => (
          <RiskZonePolygon key={zone.id} zone={zone} />
        ))}
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
            <Marker
              coordinate={{ latitude: r.latitude, longitude: r.longitude }}
              onPress={() => router.push({ pathname: '/(report)/detalle', params: { id: r.id } })}
            >
              <View style={{
                width: 16, height: 16, borderRadius: 8,
                backgroundColor: r.priority === 'critica' ? '#ef4444' : r.priority === 'alta' ? '#f97316' : '#3b82f6',
                borderWidth: 2, borderColor: '#ffffff',
                shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
              }} />
            </Marker>
          </React.Fragment>
        ))}
      </MapView>

      {/* Search bar */}
      <View style={{
        position: 'absolute', top: 60, left: 16, right: 16,
        backgroundColor: '#ffffff', borderRadius: 12,
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 4,
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
      }}>
        <Search size={18} color="#747780" style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, paddingVertical: 12, fontFamily: 'Inter', fontSize: 15, color: '#191c1e' }}
          placeholder="Buscar dirección, zona..."
          placeholderTextColor="#747780"
        />
        <TouchableOpacity>
          <Mic size={20} color="#747780" />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ position: 'absolute', top: 120, left: 16, right: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {CRIME_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={{
              paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
              backgroundColor: activeFilter === f ? '#03224d' : '#ffffff',
              borderWidth: 1,
              borderColor: activeFilter === f ? '#03224d' : '#e0e3e6',
            }}
          >
            <Text style={{
              fontFamily: 'Inter', fontSize: 13, fontWeight: '500',
              color: activeFilter === f ? '#ffffff' : '#44474f',
            }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Risk level indicator */}
      <View style={{
        position: 'absolute', top: 168, left: 16,
        backgroundColor: '#ffffff', borderRadius: 12,
        padding: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
      }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#747780', fontWeight: '500', marginBottom: 8 }}>
          Nivel de Riesgo
        </Text>
        {RISK_LEVELS.map((rl) => (
          <TouchableOpacity key={rl.label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: rl.color, marginRight: 8 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#44474f' }}>{rl.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading */}
      {isLoading && (
        <View style={{ position: 'absolute', top: 60, right: 16, backgroundColor: '#ffffff', borderRadius: 20, padding: 8, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
          <ActivityIndicator size="small" color="#03224d" />
        </View>
      )}

      {/* Create report FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(report)/paso1')}
        style={{
          position: 'absolute', bottom: 160, right: 16,
          backgroundColor: '#03224d', width: 56, height: 56, borderRadius: 28,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#03224d', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
        }}
      >
        <Text style={{ color: '#ffffff', fontSize: 28, lineHeight: 30, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>

      {/* Current location FAB */}
      <TouchableOpacity
        onPress={() => mapRef.current?.animateToRegion(region, 500)}
        style={{
          position: 'absolute', bottom: 100, right: 16,
          backgroundColor: '#ffffff', width: 48, height: 48, borderRadius: 24,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
        }}
      >
        <MapPin size={22} color="#03224d" />
      </TouchableOpacity>

      {/* Bottom info card */}
      <View style={{
        position: 'absolute', bottom: 60, left: 16, right: 16,
        backgroundColor: '#ffffff', borderRadius: 12, padding: 12,
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
      }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: '600', color: '#03224d' }}>Alerta Piura</Text>
        <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780', marginTop: 2 }}>
          Zonas de riesgo: {riskZones.length}
        </Text>
      </View>
    </View>
  );
}
