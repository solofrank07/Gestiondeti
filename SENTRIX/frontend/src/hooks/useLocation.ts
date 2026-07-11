import { useEffect, useRef } from 'react';
import { useLocationContext } from '@/contexts/LocationContext';
import { useGeofenceCheck } from './useGeofence';

export function useLocationTracking() {
  const { location, startTracking, stopTracking } = useLocationContext();
  const checkMutation = useGeofenceCheck();
  const lastCheckRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  useEffect(() => {
    if (!location) return;

    const lat = location.coords.latitude;
    const lng = location.coords.longitude;

    if (
      !lastCheckRef.current ||
      haversineDistance(lastCheckRef.current, { lat, lng }) > 100
    ) {
      lastCheckRef.current = { lat, lng };
      checkMutation.mutate({ lat, lng });
    }
  }, [location]);

  return { location, isChecking: checkMutation.isPending, lastAlert: checkMutation.data };
}

function haversineDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const a2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
}
