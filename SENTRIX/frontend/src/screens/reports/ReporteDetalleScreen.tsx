import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useReport } from '@/hooks/useReports';
import { Clock, MapPin, Calendar } from '@/components/shared/Icons';

const priorityColors: Record<string, string> = {
  baja: '#22c55e', media: '#eab308', alta: '#f97316', critica: '#ef4444',
};
const priorityLabels: Record<string, string> = {
  baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica',
};

export default function ReporteDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useReport(Number(id));
  const r = (data as any)?.data;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f7f9fc', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#03224d" />
      </View>
    );
  }

  if (!r) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f7f9fc', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#747780', textAlign: 'center' }}>Reporte no encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#03224d', fontWeight: '500' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 24, color: '#191c1e' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: '#03224d', textAlign: 'center', marginRight: 24 }}>
          Detalle del reporte
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Title + priority */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{ flex: 1, fontFamily: 'Inter', fontSize: 17, fontWeight: '700', color: '#191c1e', marginRight: 12 }}>
              {r.title}
            </Text>
            <View style={{ backgroundColor: (priorityColors[r.priority] || '#747780') + '20', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, color: priorityColors[r.priority] || '#747780', fontWeight: '600' }}>
                {priorityLabels[r.priority] || r.priority}
              </Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <MapPin size={18} color="#747780" />
            <Text style={{ flex: 1, fontFamily: 'Inter', fontSize: 14, color: '#44474f' }}>
              {r.address || `${r.latitude?.toFixed(4)}, ${r.longitude?.toFixed(4)}`}
            </Text>
          </View>
        </View>

        {/* Crime type + status */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          {r.crime_type && (
            <View style={{ backgroundColor: '#eef2f7', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flex: 1 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#747780', fontWeight: '500', marginBottom: 2 }}>Tipo</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#03224d', fontWeight: '600' }}>{r.crime_type.name}</Text>
            </View>
          )}
          <View style={{ backgroundColor: '#eef2f7', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flex: 1 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#747780', fontWeight: '500', marginBottom: 2 }}>Estado</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 14, color: r.is_verified ? '#22c55e' : '#eab308', fontWeight: '600' }}>
              {r.is_verified ? 'Verificado' : 'Pendiente'}
            </Text>
          </View>
        </View>

        {/* Description */}
        {r.description && (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500', marginBottom: 6 }}>Descripción</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#44474f', lineHeight: 20 }}>{r.description}</Text>
          </View>
        )}

        {/* Date */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Calendar size={18} color="#747780" />
            <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#44474f' }}>
              {r.incident_date ? new Date(r.incident_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <Clock size={18} color="#747780" />
            <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#44474f' }}>
              Reportado {r.created_at ? new Date(r.created_at).toLocaleDateString('es-PE') : '—'}
            </Text>
          </View>
        </View>

        {/* Media */}
        {r.media && r.media.length > 0 && (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 24 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500', marginBottom: 8 }}>
              Evidencia ({r.media.length})
            </Text>
            {r.media.map((m: any) => (
              <Text key={m.id} style={{ fontFamily: 'Inter', fontSize: 13, color: '#3b5ca3', marginBottom: 4 }}>
                {m.original_name || m.filename}
              </Text>
            ))}
          </View>
        )}

        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: '#03224d', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 40 }}
        >
          <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
