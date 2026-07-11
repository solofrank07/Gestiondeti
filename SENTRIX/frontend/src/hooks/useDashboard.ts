import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export function useDashboardFull(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['dashboard-full', params],
    queryFn: () => dashboardService.getFull(params),
    refetchInterval: 60000,
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardService.getSummary,
    refetchInterval: 60000,
  });
}

export function useDashboardStatistics(params?: { from?: string; to?: string; province_id?: number }) {
  return useQuery({
    queryKey: ['dashboard-statistics', params],
    queryFn: () => dashboardService.getStatistics(params),
  });
}

export function useCrimeTypes(params?: { from?: string; to?: string; province_id?: number }) {
  return useQuery({
    queryKey: ['crime-types', params],
    queryFn: () => dashboardService.getCrimeTypes(params),
  });
}

export function useReportsByPeriod(period: string = 'day', from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports-by-period', period, from, to],
    queryFn: () => dashboardService.getReportsByPeriod(period, from, to),
  });
}

export function useZoneStats() {
  return useQuery({
    queryKey: ['zone-stats'],
    queryFn: dashboardService.getZoneStats,
  });
}

export function useReportsByProvince(regionId: number) {
  return useQuery({
    queryKey: ['reports-by-province', regionId],
    queryFn: () => dashboardService.getReportsByProvince(regionId),
    enabled: !!regionId,
  });
}

export function useReportsByDistrict(provinceId: number) {
  return useQuery({
    queryKey: ['reports-by-district', provinceId],
    queryFn: () => dashboardService.getReportsByDistrict(provinceId),
    enabled: !!provinceId,
  });
}

export function useEvolution(days: number = 30) {
  return useQuery({
    queryKey: ['evolution', days],
    queryFn: () => dashboardService.getEvolution(days),
  });
}

export function useCriticalZones() {
  return useQuery({
    queryKey: ['critical-zones'],
    queryFn: dashboardService.getCriticalZones,
    refetchInterval: 300000,
  });
}
