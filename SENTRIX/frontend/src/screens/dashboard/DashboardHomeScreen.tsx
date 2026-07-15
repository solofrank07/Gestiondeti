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
    return items.map((p: { date?: string; period?: string; count: number }) => ({
      label: (p.date || p.period || '').slice(-5),
      value: p.count,
    }));
  }, [dashboard?.evolution]);

  const crimeData = useMemo(() => {
    if (!dashboard?.crime_types?.length) return [];
    return dashboard.crime_types.slice(0, 8).map((c: { name: string; total: number }) => ({
      label: c.name,
      value: c.total,
    }));
  }, [dashboard?.crime_types]);

  const zoneLevelData = useMemo(() => {
    if (!dashboard?.zone_stats?.by_level?.length) return [];
    return dashboard.zone_stats.by_level.map((z: { level: string; count: number }) => ({
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
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color="#03224d" />
      </View>
    );
  }

  const s = dashboard?.summary;

  return (
    <ScrollView
      className="flex-1 bg-surface"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#03224d" />}
    >
      <View className="px-4 pt-12 pb-8">
        <Text className="text-2xl font-bold text-sentrix-600 mb-6">Dashboard</Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="bg-surface-card p-4 rounded-xl flex-1 min-w-[45%] shadow-sm border border-[#e0e3e6]">
            <Text className="text-sentrix-400 text-xs">Total Reportes</Text>
            <Text className="text-sentrix-900 text-3xl font-bold">{s?.total_reports || 0}</Text>
          </View>
          <View className="bg-surface-card p-4 rounded-xl flex-1 min-w-[45%] shadow-sm border border-[#e0e3e6]">
            <Text className="text-sentrix-400 text-xs">Verificados</Text>
            <Text className="text-safe text-3xl font-bold">{s?.verified_reports || 0}</Text>
          </View>
          <View className="bg-surface-card p-4 rounded-xl flex-1 min-w-[45%] shadow-sm border border-[#e0e3e6]">
            <Text className="text-sentrix-400 text-xs">Pendientes</Text>
            <Text className="text-warning text-3xl font-bold">{s?.pending_reports || 0}</Text>
          </View>
          <View className="bg-surface-card p-4 rounded-xl flex-1 min-w-[45%] shadow-sm border border-[#e0e3e6]">
            <Text className="text-sentrix-400 text-xs">Tasa Verif.</Text>
            <Text className="text-secondary text-3xl font-bold">{s?.verification_rate || 0}%</Text>
          </View>
        </View>

        <View className="flex-row gap-2 mb-6">
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-xl ${period === p.key ? 'bg-sentrix-600' : 'bg-surface-container'}`}
            >
              <Text className={`text-sm ${period === p.key ? 'text-white' : 'text-sentrix-900'}`}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-surface-card p-4 rounded-xl mb-4 shadow-sm border border-[#e0e3e6]">
          <Text className="text-sentrix-900 font-semibold mb-3">Evolución de Reportes</Text>
          {evolutionData.length > 0 ? (
            <LineChart data={evolutionData} height={100} />
          ) : (
            <Text className="text-sentrix-400 text-sm">Sin datos en este período</Text>
          )}
        </View>

        {crimeData.length > 0 && (
          <View className="bg-surface-card p-4 rounded-xl mb-4 shadow-sm border border-[#e0e3e6]">
            <Text className="text-sentrix-900 font-semibold mb-3">Tipos de Delito</Text>
            <BarChart data={crimeData} />
          </View>
        )}

        <View className="flex-row gap-3 mb-4">
          <View className="bg-surface-card p-4 rounded-xl flex-1 shadow-sm border border-[#e0e3e6]">
            <Text className="text-sentrix-400 text-xs">Zonas Activas</Text>
            <Text className="text-sentrix-900 text-2xl font-bold">{dashboard?.zone_stats?.total_zones || 0}</Text>
          </View>
          <View className="bg-surface-card p-4 rounded-xl flex-1 shadow-sm border border-[#e0e3e6]">
            <Text className="text-sentrix-400 text-xs">Score Prom.</Text>
            <Text className="text-warning text-2xl font-bold">
              {dashboard?.zone_stats?.avg_risk_score?.toFixed(0) || 0}
            </Text>
          </View>
          <View className="bg-surface-card p-4 rounded-xl flex-1 shadow-sm border border-[#e0e3e6]">
            <Text className="text-sentrix-400 text-xs">Max Score</Text>
            <Text className="text-risk-critical text-2xl font-bold">
              {dashboard?.zone_stats?.max_risk_score?.toFixed(0) || 0}
            </Text>
          </View>
        </View>

        {zoneLevelData.length > 0 && (
          <View className="bg-surface-card p-4 rounded-xl mb-4 shadow-sm border border-[#e0e3e6]">
            <Text className="text-sentrix-900 font-semibold mb-3">Zonas por Nivel</Text>
            <BarChart data={zoneLevelData} />
          </View>
        )}

        {dashboard?.provinces && dashboard.provinces.length > 0 && (
          <View className="bg-surface-card p-4 rounded-xl mb-4 shadow-sm border border-[#e0e3e6]">
            <Text className="text-sentrix-900 font-semibold mb-3">Reportes por Provincia</Text>
            <BarChart
              data={dashboard.provinces.map((p: { name: string; total: number }) => ({ label: p.name, value: p.total }))}
            />
          </View>
        )}

        <Text className="text-sentrix-900 font-semibold text-lg mb-3 mt-2">Zonas Críticas</Text>
        {s?.critical_zones?.length ? (
          s.critical_zones.map((zone: { id: number; name: string; risk_score: number; level: string }) => (
            <TouchableOpacity
              key={zone.id}
              className="bg-surface-card p-4 rounded-xl mb-3 border border-alert-subtle shadow-sm"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-sentrix-900 font-medium flex-1">{zone.name}</Text>
                <View className="bg-alert-subtle px-3 py-1 rounded-full">
                  <Text className="text-alert font-bold">{(Number(zone.risk_score) || 0).toFixed(0)}</Text>
                </View>
              </View>
              <Text className="text-sentrix-400 text-sm mt-1">{zone.level}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-sentrix-400 text-sm mb-6">No hay zonas críticas</Text>
        )}
      </View>
    </ScrollView>
  );
}
