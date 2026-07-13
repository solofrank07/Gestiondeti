import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useReportStore } from '@/store/reportStore';

export default function ReportePaso1Screen() {
  const { draft, setLocation, setAnonymous } = useReportStore();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [address, setAddress] = useState('Obteniendo ubicación...');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se puede obtener la ubicación');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode.length > 0) {
        const g = geocode[0];
        setAddress([g.street, g.district, g.region].filter(Boolean).join(', ') || 'Ubicación actual');
      }
    })();
  }, []);

  const handleAnonymous = (val: boolean) => {
    setIsAnonymous(val);
    setAnonymous(val);
  };

  const handleContinue = () => {
    router.push('/(report)/paso2');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 24, color: '#191c1e' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: '#03224d', textAlign: 'center', marginRight: 24 }}>
          Reportar incidente
        </Text>
      </View>

      {/* Step indicator */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: '#03224d' }} />
        <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: '#c4c6d0' }} />
        <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: '#c4c6d0' }} />
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Location section */}
        <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: '#191c1e', marginBottom: 12 }}>
          Ubicación del incidente
        </Text>
        <View style={{
          backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6',
          padding: 16, marginBottom: 8,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 24 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e' }}>{address}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', marginTop: 2 }}>
                {draft?.lat?.toFixed(4)}, {draft?.lng?.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={{ marginBottom: 24 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#3b5ca3', fontWeight: '500' }}>Ajustar ubicación</Text>
        </TouchableOpacity>

        {/* Evidence section */}
        <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: '#191c1e', marginBottom: 12 }}>
          Agregar evidencia <Text style={{ color: '#747780', fontWeight: '400' }}>(opcional)</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          {[
            { icon: '📷', label: 'Foto' },
            { icon: '🎥', label: 'Video' },
            { icon: '🎤', label: 'Audio' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={{
                flex: 1, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6',
                paddingVertical: 20, alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#44474f', fontWeight: '500' }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Anonymous info */}
        <View style={{ backgroundColor: '#eef2f7', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', gap: 8 }}>
          <Text style={{ fontSize: 18 }}>ℹ️</Text>
          <Text style={{ flex: 1, fontFamily: 'Inter', fontSize: 13, color: '#44474f', lineHeight: 18 }}>
            No reveles tu identidad si prefieres reportar de forma anónima. La información compartida será tratada con confidencialidad.
          </Text>
        </View>

        {/* Anonymous toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e', fontWeight: '500' }}>
            Reportar como anónimo
          </Text>
          <Switch
            value={isAnonymous}
            onValueChange={handleAnonymous}
            trackColor={{ false: '#c4c6d0', true: '#afc6fb' }}
            thumbColor={isAnonymous ? '#03224d' : '#ffffff'}
          />
        </View>

        {/* Continue button */}
        <TouchableOpacity
          onPress={handleContinue}
          style={{ backgroundColor: '#03224d', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 40 }}
        >
          <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
