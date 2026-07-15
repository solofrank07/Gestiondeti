import { Stack, Redirect } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuthStore();

  const isAdmin = user?.roles?.some(r => r.name === 'Administrador');
  if (!isAuthenticated || !isAdmin) {
    return <Redirect href="/(tabs)/" />;
  }

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
