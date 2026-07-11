import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { aiService } from '@/services/aiService';

const TREND_COLORS: Record<string, string> = {
  increasing: '#ef4444', decreasing: '#22c55e', stable: '#eab308',
};

const PATTERN_ICONS: Record<string, string> = {
  hourly_peak: '🕐', day_peak: '📅', hotspot: '📍',
  increasing: '📈', decreasing: '📉',
};

export default function AIInsightsScreen() {
  const { data: insights, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: aiService.getInsights,
    refetchInterval: 300000,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-950 px-4 pt-12"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#22c55e" />}
    >
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-green-500">IA — Insights</Text>
        <Text className="text-gray-600 text-xs">
          {insights?.generated_at ? new Date(insights.generated_at).toLocaleTimeString('es-PE') : ''}
        </Text>
      </View>

      {insights?.patterns?.length > 0 && (
        <View className="mb-6">
          <Text className="text-white font-semibold text-lg mb-3">Patrones Detectados</Text>
          {insights.patterns.map((pattern: any, i: number) => (
            <View key={i} className="bg-gray-900 p-4 rounded-xl mb-2 border border-gray-800">
              <View className="flex-row items-center gap-2 mb-1">
                <Text>{PATTERN_ICONS[pattern.type] || '🔍'}</Text>
                <Text className="text-white font-medium flex-1">{pattern.label}</Text>
              </View>
              <Text className="text-gray-400 text-sm ml-6">{pattern.detail}</Text>
              {pattern.latitude && (
                <Text className="text-gray-600 text-xs ml-6 mt-1">
                  {pattern.latitude.toFixed(4)}, {pattern.longitude.toFixed(4)}
                </Text>
              )}
              <View className="flex-row items-center ml-6 mt-1">
                <View className="flex-1 bg-gray-800 rounded-full h-1.5">
                  <View
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${(pattern.confidence || 0) * 100}%`,
                      backgroundColor: pattern.confidence > 0.7 ? '#22c55e' : pattern.confidence > 0.4 ? '#eab308' : '#6b7280',
                    }}
                  />
                </View>
                <Text className="text-gray-500 text-xs ml-2">
                  {Math.round((pattern.confidence || 0) * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {insights?.critical?.predictions?.length > 0 && (
        <View className="mb-6">
          <Text className="text-white font-semibold text-lg mb-3">
            Zonas en Riesgo de Volverse Críticas
          </Text>
          <Text className="text-gray-500 text-sm mb-3">
            {insights.critical.total_at_risk} zonas identificadas
          </Text>
          {insights.critical.predictions.map((p: any, i: number) => (
            <View key={i} className="bg-gray-900 p-4 rounded-xl mb-2 border border-red-900/30">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-white font-medium flex-1">{p.zone_name}</Text>
                <View className="bg-red-900/50 px-2 py-1 rounded">
                  <Text className="text-red-500 text-xs">{p.current_score}→{Math.round(p.predicted_score)}</Text>
                </View>
              </View>
              <View className="flex-row gap-4 mt-1">
                <Text className="text-gray-500 text-xs">
                  ⏱ {p.days_until_critical} días
                </Text>
                <Text className="text-gray-500 text-xs">
                  Confianza: {Math.round(p.confidence * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {(!insights?.patterns?.length && !insights?.critical?.predictions?.length) && (
        <View className="flex-1 justify-center items-center mt-20">
          <Text className="text-4xl mb-3">🧠</Text>
          <Text className="text-gray-500 text-center">
            Sin datos suficientes para generar insights.{'\n'}Acumula más reportes para ver patrones.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
