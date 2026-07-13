import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface Props {
  message?: string;
}

export function LoadingScreen({ message = 'Cargando...' }: Props) {
  return (
    <View className="flex-1 bg-surface justify-center items-center">
      <ActivityIndicator size="large" color="#03224d" />
      <Text className="text-sentrix-400 mt-4 text-lg">{message}</Text>
    </View>
  );
}
