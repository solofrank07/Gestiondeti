import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useLocationContext } from '@/contexts/LocationContext';
import { geofenceService } from '@/services/geofenceService';
import { notificationService } from '@/services/notificationService';

const GEOFENCE_TASK = 'SENTRIX_GEOFENCE_BACKGROUND';
const CHECK_INTERVAL_MS = 60000;
const MIN_DISTANCE_METERS = 150;
const NOTIFICATION_DEDUP_MS = 900000;
const notifiedZonesRef = new Map<number, number>();

function haversine(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const a2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
}

async function sendGeofenceNotifications(result: { total_alerts: number; alerts: Array<{ zone_id: number; risk_level: string; zone_name: string; risk_score: number }> }) {
  if (!result || result.total_alerts === 0) return;

  for (const alert of result.alerts) {
    const lastNotified = notifiedZonesRef.get(alert.zone_id);
    if (lastNotified && Date.now() - lastNotified < NOTIFICATION_DEDUP_MS) continue;

    notifiedZonesRef.set(alert.zone_id, Date.now());

    await notificationService.sendLocalNotification(
      `⚠️ Zona ${alert.risk_level.toUpperCase()}`,
      `"${alert.zone_name}" — Score: ${alert.risk_score.toFixed(0)}/100`,
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
    distanceInterval: MIN_DISTANCE_METERS,
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
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const runCheck = useCallback(async () => {
    if (!location) return;
    const lat = location.coords.latitude;
    const lng = location.coords.longitude;

    if (
      lastPosRef.current &&
      haversine(lastPosRef.current, { lat, lng }) < MIN_DISTANCE_METERS
    ) {
      return;
    }

    lastPosRef.current = { lat, lng };

    try {
      const result = await geofenceService.checkProximity(lat, lng);
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
