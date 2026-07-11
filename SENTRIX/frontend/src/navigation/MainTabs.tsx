import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import MapScreen from '@/screens/map/MapScreen';
import HeatmapScreen from '@/screens/map/HeatmapScreen';
import CreateReportScreen from '@/screens/reports/CreateReportScreen';
import ReportHistoryScreen from '@/screens/reports/ReportHistoryScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import DashboardHomeScreen from '@/screens/dashboard/DashboardHomeScreen';
import AIInsightsScreen from '@/screens/ai/AIInsightsScreen';

export type MainTabParamList = {
  Map: undefined;
  Heatmap: undefined;
  CreateReport: undefined;
  Reports: undefined;
  Profile: undefined;
  Dashboard: undefined;
  AI: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<string, string> = {
  Map: '🗺️',
  Heatmap: '🔥',
  CreateReport: '+',
  Reports: '📋',
  Profile: '👤',
  Dashboard: '📊',
  AI: '🧠',
};

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: focused ? 24 : 20 }}>{icons[routeName] || '●'}</Text>
    </View>
  );
}

const tabLabels: Record<string, string> = {
  Map: 'Mapa',
  Heatmap: 'Calor',
  CreateReport: 'Reportar',
  Reports: 'Reportes',
  Profile: 'Perfil',
  Dashboard: 'Dashboard',
  AI: 'IA',
};

export default function MainTabs() {
  const user = useAuthStore((s) => s.user);
  const isAuthority = user?.roles?.some((r) => r.name === 'Autoridad' || r.name === 'Administrador');

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
        tabBarLabel: tabLabels[route.name] || route.name,
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11 },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Heatmap" component={HeatmapScreen} />
      <Tab.Screen name="CreateReport" component={CreateReportScreen} />
      <Tab.Screen name="Reports" component={ReportHistoryScreen} />
      {isAuthority && <Tab.Screen name="Dashboard" component={DashboardHomeScreen} />}
      {isAuthority && <Tab.Screen name="AI" component={AIInsightsScreen} />}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
