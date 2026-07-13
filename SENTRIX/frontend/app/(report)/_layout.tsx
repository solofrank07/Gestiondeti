import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function ReportLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="paso1" />
      <Stack.Screen name="paso2" />
      <Stack.Screen name="confirmar" />
      <Stack.Screen name="enviado" />
    </Stack>
  );
}
