import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useReports } from '@/hooks/useReports';
import { useReportStore } from '@/store/reportStore';

const priorityColors: Record<string, string> = {
  baja: '#22c55e', media: '#eab308', alta: '#f97316', critica: '#ef4444',
};

export default function ReportHistoryScreen() {
  const { currentPage, setPage, reports, isLoading } = useReportStore();
  const { refetch, isFetching } = useReports(currentPage);

  const renderReport = ({ item }: any) => (
    <TouchableOpacity className="bg-surface-card p-4 rounded-xl mb-3 border border-[#e0e3e6] shadow-sm">
      <View className="flex-row justify-between items-start">
        <Text className="text-sentrix-900 font-semibold flex-1">{item.title}</Text>
        <View className="px-2 py-1 rounded-lg" style={{ backgroundColor: priorityColors[item.priority] || '#747780' }}>
          <Text className="text-white text-xs uppercase font-medium">{item.priority}</Text>
        </View>
      </View>
      <Text className="text-sentrix-400 mt-2 text-sm" numberOfLines={2}>{item.description}</Text>
      <View className="flex-row mt-3 justify-between">
        <Text className="text-sentrix-400 text-xs">{new Date(item.incident_date).toLocaleDateString('es-PE')}</Text>
        <Text className={`text-xs font-medium ${item.is_verified ? 'text-safe' : 'text-warning'}`}>
          {item.is_verified ? 'Verificado' : 'Pendiente'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-surface px-4 pt-12">
      <Text className="text-2xl font-bold text-sentrix-600 mb-6">Mis Reportes</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#03224d" className="mt-10" />
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor="#03224d" />}
          ListEmptyComponent={<Text className="text-sentrix-400 text-center mt-10">No tienes reportes aún.</Text>}
        />
      )}
    </View>
  );
}
