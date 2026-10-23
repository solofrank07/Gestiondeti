import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useLocationContext } from '@/contexts/LocationContext';
import { geofenceService } from '@/services/geofenceService';
import { notificationService } from '@/services/notificationService';

const GEOFENCE_TASK = 'SENTRIX_GEOFENCE_BACKGROUND';
const CHECK_INTERVAL_MS = 60000;
const NOTIFICATION_DEDUP_MS = 300000;
const notifiedZonesRef = new Map<number, number>();

async function sendGeofenceNotifications(result: { total_alerts: number; alerts: Array<{ zone_id: number; risk_level: string; zone_name: string; risk_score: number }> }) {
  if (!result || result.total_alerts === 0) return;

  for (const alert of result.alerts) {
    const lastNotified = notifiedZonesRef.get(alert.zone_id);
    if (lastNotified && Date.now() - lastNotified < NOTIFICATION_DEDUP_MS) continue;

    notifiedZonesRef.set(alert.zone_id, Date.now());

    await notificationService.sendLocalNotification(
      `⚠️ Zona ${alert.risk_level.toUpperCase()}`,
      `"${alert.zone_name}" — Score: ${(Number(alert.risk_score) || 0).toFixed(0)}/100`,
      { zone_id: alert.zone_id, type: 'geofence', screen: 'Map' }
    );

    if (notifiedZonesRef.size > 100) {
      notifiedZonesRef.clear();
    }
  }
}

if (Platform.OS !== 'web') {
  TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
    if (error) return;
    const { locations } = data as { locations: Location.LocationObject[] };
    if (!locations?.length) return;

    const { latitude, longitude } = locations[0].coords;
    try {
      const result = await geofenceService.checkProximity(latitude, longitude);
      await sendGeofenceNotifications(result);
    } catch {}
  });
}

export async function registerBackgroundTask() {
  if (Platform.OS === 'web') return;

  const hasStarted = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
  if (hasStarted) return;

  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted') return;

  await Location.startLocationUpdatesAsync(GEOFENCE_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: CHECK_INTERVAL_MS,
    distanceInterval: 150,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'SENTRIX',
      notificationBody: 'Monitoreando zonas de riesgo cercanas...',
      notificationColor: '#ef4444',
    },
  });
}

export function useGeofenceAuto() {
  const { location } = useLocationContext();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const runCheck = useCallback(async () => {
    if (!location) return;
    try {
      const result = await geofenceService.checkProximity(
        location.coords.latitude,
        location.coords.longitude
      );
      await sendGeofenceNotifications(result);
    } catch {}
  }, [location]);

  useEffect(() => {
    registerBackgroundTask();

    intervalRef.current = setInterval(runCheck, CHECK_INTERVAL_MS);
    runCheck();

    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        runCheck();
      }
      appStateRef.current = nextState;
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [runCheck]);
}
