import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="etl" />
      <Stack.Screen name="zonas-riesgo" />
      <Stack.Screen name="reportes" />
    </Stack>
  );
}
