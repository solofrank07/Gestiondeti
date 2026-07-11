import React from 'react';
import { View, Text } from 'react-native';

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarItem[];
  maxBarWidth?: number;
  showValues?: boolean;
}

const COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#a855f7', '#3b82f6'];

export function BarChart({ data, maxBarWidth = 200, showValues = true }: BarChartProps) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View className="w-full gap-2">
      {data.map((item, i) => {
        const barWidth = (item.value / max) * maxBarWidth;
        const color = item.color || COLORS[i % COLORS.length];
        return (
          <View key={i} className="flex-row items-center">
            <Text className="text-gray-400 text-xs w-24 mr-2 text-right" numberOfLines={1}>
              {item.label}
            </Text>
            <View className="flex-row items-center flex-1">
              <View
                style={{
                  width: Math.max(barWidth, 4),
                  backgroundColor: color,
                  borderRadius: 4,
                  opacity: 0.7 + (item.value / max) * 0.3,
                }}
                className="h-5"
              />
              {showValues && (
                <Text className="text-gray-500 text-xs ml-2">{item.value}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
