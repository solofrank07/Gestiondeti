import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useReportStore } from '@/store/reportStore';
import { reportService } from '@/services/reportService';

const crimeLabels: Record<string, string> = {
  hurto: 'Robo/Hurto', 'robo-agravado': 'Robo agravado',
  extorsion: 'Extorsión', sicariato: 'Sicariato', 'zona-insegura': 'Zona insegura',
};

export default function ConfirmarReporteScreen() {
  const { draft, resetDraft } = useReportStore();
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!draft.lat || !draft.lng || !draft.crimeType) return;
    setSending(true);
    try {
      await reportService.createReport({
        title: crimeLabels[draft.crimeType] || draft.crimeType,
        description: draft.description || '',
        latitude: draft.lat,
        longitude: draft.lng,
        priority: 'media',
        incident_date: new Date().toISOString(),
        is_anonymous: draft.isAnonymous,
      });
      const trackingId = `RPT-${Date.now().toString(36).toUpperCase()}`;
      resetDraft();
      router.replace({ pathname: '/(report)/enviado', params: { trackingId } });
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Error al enviar reporte');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 24, color: '#191c1e' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: '#03224d', textAlign: 'center', marginRight: 24 }}>
          Confirmar reporte
        </Text>
      </View>

      {/* Step indicator */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: '#03224d' }} />
        <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: '#03224d' }} />
        <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: '#03224d' }} />
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Location */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 8 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', marginBottom: 4 }}>Ubicación</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e' }}>
            {draft.address || `${draft.lat?.toFixed(4)}, ${draft.lng?.toFixed(4)}`}
          </Text>
        </View>

        {/* Crime type badge */}
        {draft.crimeType && (
          <View style={{
            alignSelf: 'flex-start', backgroundColor: '#eef2f7',
            borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8,
            marginBottom: 8,
          }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#03224d', fontWeight: '600' }}>
              {crimeLabels[draft.crimeType] || draft.crimeType}
            </Text>
          </View>
        )}

        {/* Anonymous badge */}
        {draft.isAnonymous && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <Text style={{ fontSize: 16 }}>🙈</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#747780' }}>Reportado de forma anónima</Text>
          </View>
        )}

        {/* Description */}
        {draft.description ? (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 24 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', marginBottom: 4 }}>Descripción</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e' }}>{draft.description}</Text>
          </View>
        ) : null}

        {/* Send button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={sending}
          style={{ backgroundColor: '#03224d', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 }}
        >
          {sending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>Enviar reporte</Text>
          )}
        </TouchableOpacity>

        {/* Panic button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#c55a11', paddingVertical: 16, borderRadius: 12,
            alignItems: 'center', marginBottom: 40,
            shadowColor: '#c55a11', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
          }}
        >
          <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 14, fontWeight: '700', letterSpacing: 1 }}>
            🔴 BOTÓN DE PÁNICO
          </Text>
          <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 12, marginTop: 4 }}>
            Notifica de inmediato a la Policía
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
