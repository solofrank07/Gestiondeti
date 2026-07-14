import { Tabs, router } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import { MapPin, Bell, User } from '@/components/shared/Icons';

type IconName = 'mapa' | 'alertas' | 'perfil';

const tabConfig: Record<IconName, { icon: React.ReactNode; label: string }> = {
  mapa: { icon: <MapPin size={22} />, label: 'Mapa' },
  alertas: { icon: <Bell size={22} />, label: 'Alertas' },
  perfil: { icon: <User size={22} />, label: 'Perfil' },
};

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const config = tabConfig[routeName as IconName];
  if (!config) return <View />;
  return (
    <View style={{ alignItems: 'center', opacity: focused ? 1 : 0.6 }}>
      {config.icon}
    </View>
  );
}

export default function TabsLayout() {
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
      <Tabs.Screen name="alertas" />
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
              <User size={22} color="#747780" />
              <Text style={{ fontSize: 11, fontWeight: '500', color: '#747780', marginTop: 1 }}>Perfil</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
