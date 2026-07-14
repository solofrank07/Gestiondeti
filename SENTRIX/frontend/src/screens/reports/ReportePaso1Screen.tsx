import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useReportStore } from '@/store/reportStore';
import { Camera, Video, Mic, MapPin } from '@/components/shared/Icons';
import MapView, { Marker, Circle } from '@/components/map/MapView';
import Slider from '@/components/shared/Slider';

export default function ReportePaso1Screen() {
  const { draft, setLocation, setAnonymous, addEvidence, setRadius } = useReportStore();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [address, setAddress] = useState('Obteniendo ubicacion...');
  const [radius, setLocalRadius] = useState(draft.radius || 100);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se puede obtener la ubicacion');
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
        setAddress([g.street, g.district, g.region].filter(Boolean).join(', ') || 'Ubicacion actual');
      }
    })();
  }, []);

  const handleAnonymous = (val: boolean) => {
    setIsAnonymous(val);
    setAnonymous(val);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      addEvidence(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la camara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      addEvidence(result.assets[0].uri);
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      addEvidence(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    setRadius(radius);
    router.push('/(report)/paso2');
  };

  const lat = draft?.lat;
  const lng = draft?.lng;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 24, color: '#191c1e' }}>{'<'}</Text>
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
          Ubicacion del incidente
        </Text>
        <View style={{
          backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6',
          padding: 16, marginBottom: 8,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <MapPin size={24} color="#03224d" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e' }}>{address}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', marginTop: 2 }}>
                {lat?.toFixed(4)}, {lng?.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>

        {/* Map with circle */}
        {lat && lng ? (
          <View style={{ height: 280, borderRadius: 12, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#e0e3e6' }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: lat,
                longitude: lng,
                latitudeDelta: radius > 500 ? 0.05 : 0.02,
                longitudeDelta: radius > 500 ? 0.05 : 0.02,
              }}
            >
              <Circle
                center={{ latitude: lat, longitude: lng }}
                radius={radius}
                fillColor="#03224d"
                strokeColor="#03224d"
                strokeWidth={2}
              />
              <Marker coordinate={{ latitude: lat, longitude: lng }}>
                <View style={{
                  width: 18, height: 18, borderRadius: 9,
                  backgroundColor: '#ef4444', borderWidth: 3, borderColor: '#ffffff',
                  shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
                }} />
              </Marker>
            </MapView>
          </View>
        ) : (
          <View style={{ height: 200, borderRadius: 12, backgroundColor: '#eef2f7', marginBottom: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780' }}>Cargando ubicacion...</Text>
          </View>
        )}

        {/* Radius slider */}
        <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: '#191c1e', marginBottom: 8 }}>
          Area afectada: <Text style={{ color: '#03224d' }}>{radius} m</Text>
        </Text>
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 16 }}>
          <Slider
            value={radius}
            min={10}
            max={1000}
            step={10}
            onValueChange={setLocalRadius}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#747780' }}>10 m</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#747780' }}>500 m</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#747780' }}>1000 m</Text>
          </View>
        </View>

        {/* Evidence section */}
        <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: '#191c1e', marginBottom: 12 }}>
          Agregar evidencia <Text style={{ color: '#747780', fontWeight: '400' }}>(opcional)</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
          <TouchableOpacity
            onPress={takePhoto}
            style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', paddingVertical: 20, alignItems: 'center' }}
          >
            <Camera size={28} color="#03224d" style={{ marginBottom: 8 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#44474f', fontWeight: '500' }}>Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickVideo}
            style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', paddingVertical: 20, alignItems: 'center' }}
          >
            <Video size={28} color="#03224d" style={{ marginBottom: 8 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#44474f', fontWeight: '500' }}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickImage}
            style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', paddingVertical: 20, alignItems: 'center' }}
          >
            <Mic size={28} color="#03224d" style={{ marginBottom: 8 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#44474f', fontWeight: '500' }}>Audio</Text>
          </TouchableOpacity>
        </View>

        {/* Evidence preview */}
        {draft.evidence && draft.evidence.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {draft.evidence.map((uri, i) => (
              <View key={i} style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', backgroundColor: '#e0e3e6' }}>
                {uri.match(/\.(jpg|jpeg|png|gif)/i) ? (
                  <Image source={{ uri }} style={{ width: 60, height: 60 }} />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#03224d' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffffff' }} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Anonymous info */}
        <View style={{ backgroundColor: '#eef2f7', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', gap: 8 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 16, color: '#3b5ca3', fontWeight: '600' }}>i</Text>
          <Text style={{ flex: 1, fontFamily: 'Inter', fontSize: 13, color: '#44474f', lineHeight: 18 }}>
            No reveles tu identidad si prefieres reportar de forma anonima. La informacion compartida sera tratada con confidencialidad.
          </Text>
        </View>

        {/* Anonymous toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e', fontWeight: '500' }}>
            Reportar como anonimo
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
