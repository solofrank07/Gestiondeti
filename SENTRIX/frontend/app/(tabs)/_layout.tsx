import { Tabs, router } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/authStore';

const tabConfig = {
  mapa: { icon: '📍', label: 'Mapa' },
  alertas: { icon: '🔔', label: 'Alertas' },
  perfil: { icon: '👤', label: 'Perfil' },
};

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const config = tabConfig[routeName as keyof typeof tabConfig];
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: focused ? 22 : 18 }}>{config?.icon || '●'}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  const isAuthority = user?.roles?.some((r) => r.name === 'Autoridad' || r.name === 'Administrador');

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
        tabBarLabel: tabConfig[route.name as keyof typeof tabConfig]?.label || route.name,
        tabBarActiveTintColor: '#03224d',
        tabBarInactiveTintColor: '#747780',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e3e6',
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      })}
    >
      <Tabs.Screen name="mapa" />
      <Tabs.Screen
        name="alertas"
        options={{ href: isAuthority ? '/(tabs)/alertas' : null }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarButton: () => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/perfil')}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 4,
              }}
            >
              <Text style={{ fontSize: 22 }}>{'👤'}</Text>
              <Text style={{ fontSize: 11, fontWeight: '500', color: '#747780', marginTop: 1 }}>Perfil</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
