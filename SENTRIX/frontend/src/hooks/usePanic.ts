import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { panicService } from '@/services/panicService';
import { useLocationContext } from '@/contexts/LocationContext';
import { notificationService } from '@/services/notificationService';

export function usePanicAlert() {
  const { location } = useLocationContext();

  return useMutation({
    mutationFn: async (message?: string) => {
      if (!location) throw new Error('Ubicación no disponible');
      return panicService.create({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        message,
      });
    },
    onSuccess: () => {
      notificationService.sendLocalNotification(
        'Alerta de Pánico',
        'Tu alerta ha sido enviada a las autoridades.',
      );
    },
  });
}

export function usePanicHistory() {
  return useQuery({
    queryKey: ['panic-history'],
    queryFn: panicService.getHistory,
  });
}

export function useActivePanicAlerts() {
  return useQuery({
    queryKey: ['panic-active'],
    queryFn: panicService.getActive,
    refetchInterval: 30000,
  });
}

export function useAttendPanic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => panicService.attend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panic-active'] });
      queryClient.invalidateQueries({ queryKey: ['panic-history'] });
    },
  });
}
