import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { useDashboardFull } from '@/hooks/useDashboard';
import { useVerifyReport } from '@/hooks/useReports';
import { router } from 'expo-router';
import { Bell, Search, Clipboard, AlertTriangle, Clock, MapPin } from '@/components/shared/Icons';

const PERIODS = [
  { key: 'week', label: '7d' },
  { key: 'month', label: '30d' },
  { key: 'quarter', label: '90d' },
  { key: 'year', label: '1a' },
];

export default function DashboardAuthorityScreen() {
  const [period, setPeriod] = useState('month');
  const [refreshing, setRefreshing] = useState(false);

  const params = useMemo(() => {
    const now = new Date();
    const days: Record<string, number> = { week: 7, month: 30, quarter: 90, year: 365 };
    const from = new Date(now.getTime() - (days[period] || 30) * 86400000);
    return {
      period: period === 'week' || period === 'month' ? 'day' : 'week',
      from: from.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0],
    };
  }, [period]);

  const { data: dashboard, isLoading, refetch } = useDashboardFull(params);
  const verifyMutation = useVerifyReport();
  const s = dashboard?.summary;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f7f9fc', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#03224d" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f7f9fc' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refetch(); setRefreshing(false); }} tintColor="#03224d" />}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => { try { router.back(); } catch { router.replace('/(tabs)/mapa'); } }}>
          <Text style={{ fontSize: 24, color: '#191c1e' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 22, fontWeight: '700', fontFamily: 'Inter', color: '#03224d', textAlign: 'center', marginRight: 24 }}>
          Alerta Piura
        </Text>
        <TouchableOpacity>
          <Bell size={22} color="#747780" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
          borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', paddingHorizontal: 16,
        }}>
          <Search size={18} color="#747780" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, fontFamily: 'Inter', fontSize: 14, color: '#191c1e' }}
            placeholder="Buscar incidentes, zonas..."
            placeholderTextColor="#747780"
          />
        </View>
      </View>

      {/* KPI Cards */}
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e0e3e6' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Clipboard size={20} />
              <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#375623', fontWeight: '600' }}>↑ 12%</Text>
            </View>
            <Text style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: '700', color: '#191c1e' }}>{s?.total_reports || 0}</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780' }}>Reportes hoy</Text>
          </View>
          <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e0e3e6' }}>
            <AlertTriangle size={20} style={{ marginBottom: 8 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: '700', color: '#191c1e' }}>{s?.pending_reports || 0}</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780' }}>Alertas activas (Alta Prioridad)</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#ef4444' }}>requieren atención</Text>
          </View>
          <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e0e3e6' }}>
            <Clock size={20} style={{ marginBottom: 8 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: '700', color: '#191c1e' }}>0 min</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780' }}>Tiempo de respuesta prom.</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#375623' }}>↓ -2 min vs ayer</Text>
          </View>
          <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e0e3e6' }}>
            <MapPin size={20} style={{ marginBottom: 8 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: '700', color: '#191c1e' }}>{s?.critical_zones?.length || 0}</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780' }}>Zonas críticas</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#ef4444' }}>focos detectados</Text>
          </View>
        </View>

        {/* Recent reports */}
        <Text style={{ fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: '#191c1e', marginBottom: 12 }}>
          Reportes recientes
        </Text>
        {dashboard?.reports?.slice(0, 4).map((r: any, i: number) => (
          <View key={r.id || i} style={{
            backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6',
            padding: 16, marginBottom: 8,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: r.is_verified ? '#22c55e' : '#eab308' }} />
              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500' }}>
                {r.is_verified ? 'Resuelto' : 'Nuevo'}
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780' }}>{r.crime_type || r.title}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#747780', marginLeft: 'auto' }}>
                {r.incident_date ? new Date(r.incident_date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}
              </Text>
            </View>
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#191c1e', marginBottom: 8 }} numberOfLines={2}>{r.description}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <MapPin size={14} color="#747780" />
              <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780' }}>
                {r.address || `${r.latitude?.toFixed(4)}, ${r.longitude?.toFixed(4)}`}
              </Text>
            </View>
            {!r.is_verified && (
              <TouchableOpacity
                onPress={() => {
                  verifyMutation.mutate(r.id, {
                    onSuccess: () => { refetch(); },
                    onError: (e: any) => { Alert.alert('Error', e?.response?.data?.message || 'Error al verificar'); },
                  });
                }}
                disabled={verifyMutation.isPending}
                style={{ backgroundColor: '#22c55e', borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}
              >
                <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 13, fontWeight: '600' }}>
                  {verifyMutation.isPending ? 'Verificando...' : 'Verificar reporte'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Admin navigation */}
        <Text style={{ fontSize: 16, fontWeight: '700', fontFamily: 'Inter', color: '#191c1e', marginBottom: 12, marginTop: 8 }}>
          Administracion
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/reportes')}
          style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <Clipboard size={20} color="#03224d" />
          <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e', fontWeight: '500' }}>Gestionar reportes</Text>
          <Text style={{ marginLeft: 'auto', color: '#c4c6d0', fontSize: 18 }}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/zonas-riesgo')}
          style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <MapPin size={20} color="#03224d" />
          <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e', fontWeight: '500' }}>Gestionar zonas de riesgo</Text>
          <Text style={{ marginLeft: 'auto', color: '#c4c6d0', fontSize: 18 }}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/etl')}
          style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <Clipboard size={20} color="#03224d" />
          <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e', fontWeight: '500' }}>Importacion de datos (ETL)</Text>
          <Text style={{ marginLeft: 'auto', color: '#c4c6d0', fontSize: 18 }}>{'>'}</Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}
