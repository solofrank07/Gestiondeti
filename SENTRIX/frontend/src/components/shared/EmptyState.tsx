import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = '📭', title, description }: Props) {
  return (
    <View className="flex-1 justify-center items-center px-6 py-12">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-sentrix-900 text-lg font-semibold text-center">{title}</Text>
      {description && <Text className="text-sentrix-400 text-center mt-2">{description}</Text>}
    </View>
  );
}
