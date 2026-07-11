import React from 'react';
import { View, Text } from 'react-native';

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  showLabels?: boolean;
}

export function LineChart({ data, height = 120, color = '#22c55e', showLabels = true }: LineChartProps) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View className="w-full">
      <View style={{ height }} className="flex-row items-end gap-[2px]">
        {data.map((point, i) => {
          const barHeight = (point.value / max) * height;
          return (
            <View key={i} className="flex-1 items-center justify-end" style={{ height }}>
              <View
                style={{
                  height: Math.max(barHeight, 2),
                  backgroundColor: point.value > 0 ? color : '#1e293b',
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                  opacity: 0.6 + (point.value / max) * 0.4,
                }}
                className="w-full"
              />
            </View>
          );
        })}
      </View>
      {showLabels && data.length > 1 && (
        <View className="flex-row justify-between mt-1">
          <Text className="text-gray-600 text-[10px]">{data[0].label}</Text>
          <Text className="text-gray-600 text-[10px]">{data[data.length - 1].label}</Text>
        </View>
      )}
    </View>
  );
}
