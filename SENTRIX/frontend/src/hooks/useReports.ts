import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import { useReportStore } from '@/store/reportStore';
import { useAuthStore } from '@/store/authStore';
import { CreateReportRequest } from '@/types/report';
import { handleApiError } from '@/utils/apiHelpers';
import { Alert } from 'react-native';

export function useReports(page: number = 1) {
  const token = useAuthStore((s) => s.token);
  const setReports = useReportStore((s) => s.setReports);
  const setPage = useReportStore((s) => s.setPage);
  const setTotalPages = useReportStore((s) => s.setTotalPages);
  const setLoading = useReportStore((s) => s.setLoading);

  return useQuery({
    queryKey: ['reports', page],
    queryFn: async () => {
      setLoading(true);
      try {
        const res = await reportService.getReports(page);
        setReports(res.data || []);
        setPage(page);
        return res;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!token,
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportService.getReport(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const addReport = useReportStore((s) => s.addReport);

  return useMutation({
    mutationFn: (data: CreateReportRequest) => reportService.createReport(data),
    onSuccess: (report) => {
      addReport(report);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      Alert.alert('Éxito', 'Reporte creado correctamente.');
    },
    onError: (error: any) => {
      Alert.alert('Error', handleApiError(error));
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  const updateReport = useReportStore((s) => s.updateReport);

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateReportRequest> }) =>
      reportService.updateReport(id, data),
    onSuccess: (report) => {
      updateReport(report.id, report);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', handleApiError(error));
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  const removeReport = useReportStore((s) => s.removeReport);

  return useMutation({
    mutationFn: (id: number) => reportService.deleteReport(id),
    onSuccess: (_, id) => {
      removeReport(id);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', handleApiError(error));
    },
  });
}

export function useNearbyReports(lat?: number, lng?: number, radius = 1) {
  return useQuery({
    queryKey: ['reports', 'nearby', lat, lng, radius],
    queryFn: () => reportService.getNearby(lat!, lng!, radius),
    enabled: lat !== undefined && lng !== undefined,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useVerifyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reportService.verifyReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      Alert.alert('Éxito', 'Reporte verificado.');
    },
    onError: (error: any) => {
      Alert.alert('Error', handleApiError(error));
    },
  });
}

export function useRejectReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reportService.rejectReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      Alert.alert('Éxito', 'Reporte rechazado.');
    },
    onError: (error: any) => {
      Alert.alert('Error', handleApiError(error));
    },
  });
}
