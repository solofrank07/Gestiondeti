import { useMutation, useQuery } from '@tanstack/react-query';
import { geofenceService } from '@/services/geofenceService';

export function useGeofenceCheck() {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      geofenceService.checkProximity(lat, lng),
  });
}

export function useGeofenceHistory(limit: number = 50) {
  return useQuery({
    queryKey: ['geofence-history', limit],
    queryFn: () => geofenceService.getHistory(limit),
  });
}
