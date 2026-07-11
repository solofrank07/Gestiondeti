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
    <TouchableOpacity className="bg-gray-900 p-4 rounded-xl mb-3 border border-gray-800">
      <View className="flex-row justify-between items-start">
        <Text className="text-white font-semibold flex-1">{item.title}</Text>
        <View className="px-2 py-1 rounded" style={{ backgroundColor: priorityColors[item.priority] || '#6b7280' }}>
          <Text className="text-white text-xs uppercase">{item.priority}</Text>
        </View>
      </View>
      <Text className="text-gray-400 mt-2 text-sm" numberOfLines={2}>{item.description}</Text>
      <View className="flex-row mt-3 justify-between">
        <Text className="text-gray-500 text-xs">{new Date(item.incident_date).toLocaleDateString('es-PE')}</Text>
        <Text className={`text-xs ${item.is_verified ? 'text-green-500' : 'text-yellow-500'}`}>
          {item.is_verified ? 'Verificado' : 'Pendiente'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-950 px-4 pt-12">
      <Text className="text-2xl font-bold text-green-500 mb-6">Mis Reportes</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#22c55e" className="mt-10" />
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor="#22c55e" />}
          ListEmptyComponent={<Text className="text-gray-500 text-center mt-10">No tienes reportes aún.</Text>}
        />
      )}
    </View>
  );
}
