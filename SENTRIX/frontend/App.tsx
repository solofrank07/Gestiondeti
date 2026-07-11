import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LocationProvider, useLocationContext } from '@/contexts/LocationContext';
import AppNavigator from '@/navigation/AppNavigator';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { notificationService } from '@/services/notificationService';
import { useGeofenceAuto, registerBackgroundTask } from '@/hooks/useGeofenceAuto';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: any) => {
        const msg = error?.response?.data?.message || error?.message || 'Error inesperado';
        console.error('[API Error]', msg);
      },
    },
  },
});

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { location } = useLocationContext();

  useEffect(() => {
    notificationService.requestPermission();
    registerBackgroundTask();

    const sub = notificationService.addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'geofence' && data?.zone_id) {
        router.push(`/map?zone=${data.zone_id}`);
      } else if (data?.type === 'panic') {
        router.push('/panic');
      }
    });

    return () => sub.remove();
  }, []);

  useGeofenceAuto();

  if (isLoading && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LocationProvider>
            <AppInitializer>
              <AppNavigator />
            </AppInitializer>
            <StatusBar style="light" />
          </LocationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
