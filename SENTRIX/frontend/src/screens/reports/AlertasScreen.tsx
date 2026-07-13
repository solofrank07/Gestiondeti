import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useReports } from '@/hooks/useReports';
import { useReportStore } from '@/store/reportStore';

const statusTabs = [
  { key: 'all', label: 'Todos' },
  { key: 'review', label: 'En revisión' },
  { key: 'attended', label: 'Atendidos' },
  { key: 'rejected', label: 'Rechazados' },
];

const statusColors: Record<string, string> = {
  review: '#eab308', attended: '#22c55e', rejected: '#ef4444',
};

const statusLabels: Record<string, string> = {
  review: 'En revisión', attended: 'Atendido', rejected: 'Rechazado',
};

export default function AlertasScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const { currentPage, setPage, reports, isLoading } = useReportStore();
  const { refetch, isFetching } = useReports(currentPage);

  const filtered = activeTab === 'all' ? reports : reports;

  const renderReport = ({ item }: any) => {
    const statusKey = item.is_verified ? 'attended' : 'review';
    const statusColor = statusColors[statusKey] || '#747780';
    const statusLabel = statusLabels[statusKey] || (item.is_verified ? 'Atendido' : 'En revisión');

    return (
      <View style={{
        backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6',
        padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Status pip */}
          <View style={{ width: 4, height: 48, borderRadius: 2, backgroundColor: statusColor, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: '#191c1e', marginBottom: 2 }}>
              {item.title || item.crime_type || 'Reporte'}
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', marginBottom: 4 }}>
              {item.address || `${item.latitude?.toFixed(4)}, ${item.longitude?.toFixed(4)}`}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780' }}>
                {item.incident_date ? new Date(item.incident_date).toLocaleDateString('es-PE') : ''}
              </Text>
              <View style={{ backgroundColor: statusColor + '20', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 12, color: statusColor, fontWeight: '500' }}>{statusLabel}</Text>
              </View>
            </View>
          </View>
          <Text style={{ color: '#c4c6d0', fontSize: 20, marginLeft: 8 }}>›</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', fontFamily: 'Inter', color: '#03224d' }}>Mis reportes</Text>
      </View>

      {/* Status tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 }}>
        {statusTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              paddingHorizontal: 16, paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: activeTab === tab.key ? '#03224d' : '#ffffff',
              borderWidth: 1,
              borderColor: activeTab === tab.key ? '#03224d' : '#e0e3e6',
            }}
          >
            <Text style={{
              fontFamily: 'Inter', fontSize: 13, fontWeight: '500',
              color: activeTab === tab.key ? '#ffffff' : '#44474f',
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#03224d" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderReport}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor="#03224d" />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#747780', textAlign: 'center' }}>
                No tienes reportes aún.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
