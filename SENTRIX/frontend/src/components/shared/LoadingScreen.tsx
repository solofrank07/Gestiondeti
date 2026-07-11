import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface Props {
  message?: string;
}

export function LoadingScreen({ message = 'Cargando...' }: Props) {
  return (
    <View className="flex-1 bg-gray-950 justify-center items-center">
      <ActivityIndicator size="large" color="#22c55e" />
      <Text className="text-gray-400 mt-4 text-lg">{message}</Text>
    </View>
  );
}
