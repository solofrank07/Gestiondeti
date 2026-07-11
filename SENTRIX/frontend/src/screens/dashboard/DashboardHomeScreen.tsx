import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useDashboardFull } from '@/hooks/useDashboard';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';

const PERIODS = [
  { key: 'week', label: '7d' },
  { key: 'month', label: '30d' },
  { key: 'quarter', label: '90d' },
  { key: 'year', label: '1a' },
];

const RISK_COLORS: Record<string, string> = {
  'muy-bajo': '#22c55e', 'bajo': '#84cc16', 'medio': '#eab308',
  'alto': '#f97316', 'critico': '#ef4444',
};

export default function DashboardHomeScreen() {
  const [period, setPeriod] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const params = useMemo(() => {
    const now = new Date();
    const days = { week: 7, month: 30, quarter: 90, year: 365 };
    const from = new Date(now.getTime() - (days[period as keyof typeof days] || 30) * 86400000);
    return {
      period: period === 'week' ? 'day' : period === 'month' ? 'day' : period === 'quarter' ? 'week' : 'month',
      from: from.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0],
    };
  }, [period]);

  const { data: dashboard, isLoading, refetch } = useDashboardFull(params);

  const evolutionData = useMemo(() => {
    if (!dashboard?.evolution?.length) return [];
    const items = dashboard.evolution.slice(-30);
    return items.map((p) => ({
      label: (p.date || p.period || '').slice(-5),
      value: p.count,
    }));
  }, [dashboard?.evolution]);

  const crimeData = useMemo(() => {
    if (!dashboard?.crime_types?.length) return [];
    return dashboard.crime_types.slice(0, 8).map((c) => ({
      label: c.name,
      value: c.total,
    }));
  }, [dashboard?.crime_types]);

  const zoneLevelData = useMemo(() => {
    if (!dashboard?.zone_stats?.by_level?.length) return [];
    return dashboard.zone_stats.by_level.map((z) => ({
      label: z.level,
      value: z.count,
      color: RISK_COLORS[z.level] || '#6b7280',
    }));
  }, [dashboard?.zone_stats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  const s = dashboard?.summary;

  return (
    <ScrollView
      className="flex-1 bg-gray-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
    >
      <View className="px-4 pt-12 pb-8">
        <Text className="text-2xl font-bold text-green-500 mb-6">Dashboard</Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="bg-gray-900 p-4 rounded-xl flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-xs">Total Reportes</Text>
            <Text className="text-white text-3xl font-bold">{s?.total_reports || 0}</Text>
          </View>
          <View className="bg-gray-900 p-4 rounded-xl flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-xs">Verificados</Text>
            <Text className="text-green-500 text-3xl font-bold">{s?.verified_reports || 0}</Text>
          </View>
          <View className="bg-gray-900 p-4 rounded-xl flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-xs">Pendientes</Text>
            <Text className="text-yellow-500 text-3xl font-bold">{s?.pending_reports || 0}</Text>
          </View>
          <View className="bg-gray-900 p-4 rounded-xl flex-1 min-w-[45%]">
            <Text className="text-gray-400 text-xs">Tasa Verif.</Text>
            <Text className="text-blue-500 text-3xl font-bold">{s?.verification_rate || 0}%</Text>
          </View>
        </View>

        <View className="flex-row gap-2 mb-6">
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-lg ${period === p.key ? 'bg-green-600' : 'bg-gray-800'}`}
            >
              <Text className="text-white text-sm">{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-gray-900 p-4 rounded-xl mb-4">
          <Text className="text-white font-semibold mb-3">Evolución de Reportes</Text>
          {evolutionData.length > 0 ? (
            <LineChart data={evolutionData} height={100} />
          ) : (
            <Text className="text-gray-500 text-sm">Sin datos en este período</Text>
          )}
        </View>

        {crimeData.length > 0 && (
          <View className="bg-gray-900 p-4 rounded-xl mb-4">
            <Text className="text-white font-semibold mb-3">Tipos de Delito</Text>
            <BarChart data={crimeData} />
          </View>
        )}

        <View className="flex-row gap-3 mb-4">
          <View className="bg-gray-900 p-4 rounded-xl flex-1">
            <Text className="text-gray-400 text-xs">Zonas Activas</Text>
            <Text className="text-white text-2xl font-bold">{dashboard?.zone_stats?.total_zones || 0}</Text>
          </View>
          <View className="bg-gray-900 p-4 rounded-xl flex-1">
            <Text className="text-gray-400 text-xs">Score Prom.</Text>
            <Text className="text-orange-500 text-2xl font-bold">
              {dashboard?.zone_stats?.avg_risk_score?.toFixed(0) || 0}
            </Text>
          </View>
          <View className="bg-gray-900 p-4 rounded-xl flex-1">
            <Text className="text-gray-400 text-xs">Max Score</Text>
            <Text className="text-red-500 text-2xl font-bold">
              {dashboard?.zone_stats?.max_risk_score?.toFixed(0) || 0}
            </Text>
          </View>
        </View>

        {zoneLevelData.length > 0 && (
          <View className="bg-gray-900 p-4 rounded-xl mb-4">
            <Text className="text-white font-semibold mb-3">Zonas por Nivel</Text>
            <BarChart data={zoneLevelData} />
          </View>
        )}

        {dashboard?.provinces && dashboard.provinces.length > 0 && (
          <View className="bg-gray-900 p-4 rounded-xl mb-4">
            <Text className="text-white font-semibold mb-3">Reportes por Provincia</Text>
            <BarChart
              data={dashboard.provinces.map((p) => ({ label: p.name, value: p.total }))}
            />
          </View>
        )}

        <Text className="text-white font-semibold text-lg mb-3 mt-2">Zonas Críticas</Text>
        {s?.critical_zones?.length ? (
          s.critical_zones.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              className="bg-gray-900 p-4 rounded-xl mb-3 border border-gray-800"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-medium flex-1">{zone.name}</Text>
                <View className="bg-red-900/50 px-3 py-1 rounded-full">
                  <Text className="text-red-500 font-bold">{zone.risk_score.toFixed(0)}</Text>
                </View>
              </View>
              <Text className="text-gray-500 text-sm mt-1">{zone.level}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-gray-500 text-sm mb-6">No hay zonas críticas</Text>
        )}
      </View>
    </ScrollView>
  );
}
