import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function ReporteEnviadoScreen() {
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f9fc', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
      {/* Success icon */}
      <View style={{
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#E2EFDA', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
      }}>
        <Text style={{ fontSize: 40 }}>✓</Text>
      </View>

      {/* Title */}
      <Text style={{
        fontSize: 22, fontWeight: '700', fontFamily: 'Inter',
        color: '#375623', textAlign: 'center', marginBottom: 8,
      }}>
        Reporte enviado con éxito
      </Text>
      <Text style={{
        fontSize: 15, fontFamily: 'Inter', color: '#44474f',
        textAlign: 'center', lineHeight: 22, marginBottom: 32,
      }}>
        Tu reporte ayuda a mantener informada a tu comunidad.
      </Text>

      {/* Details */}
      <View style={{
        backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6',
        padding: 20, width: '100%', marginBottom: 32,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#747780' }} />
          <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e', flex: 1 }}>
            Tiempo estimado de revision: 24 horas
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#03224d' }} />
          <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e', flex: 1 }}>
            N° de seguimiento: {trackingId || 'RPT-0000'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/mapa')}
        style={{
          flexDirection: 'row', gap: 8,
          backgroundColor: '#03224d', paddingVertical: 14, borderRadius: 12,
          alignItems: 'center', justifyContent: 'center',
          width: '100%', marginBottom: 12,
        }}
      >
        <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>Ver en el mapa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/alertas')}
        style={{ alignItems: 'center' }}
      >
        <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#03224d', fontWeight: '500' }}>
          Ir a mi historial de reportes
        </Text>
      </TouchableOpacity>
    </View>
  );
}
