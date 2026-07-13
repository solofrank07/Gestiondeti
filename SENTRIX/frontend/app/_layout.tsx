import '../src/global.css';
import React, { useEffect } from 'react';
import { Slot, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider, useLocationContext } from '@/contexts/LocationContext';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { notificationService } from '@/services/notificationService';
import { useGeofenceAuto, registerBackgroundTask } from '@/hooks/useGeofenceAuto';
import { useAuthStore } from '@/store/authStore';

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
    // Notification permission requires user gesture on web; wrap safely
    try { notificationService.requestPermission(); } catch {}
    registerBackgroundTask();

    const sub = notificationService.addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'geofence' && data?.zone_id) {
        router.push(`/(tabs)/mapa?zone=${data.zone_id}`);
      } else if (data?.type === 'panic') {
        router.push('/(tabs)/mapa');
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

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LocationProvider>
              <AppInitializer>
                <Slot />
              </AppInitializer>
              <StatusBar style="dark" />
            </LocationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
