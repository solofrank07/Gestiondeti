import api from './api';
import { ENDPOINTS } from '@/constants/api';
import { DashboardSummary, ReportStatistics, FullDashboard, CrimeTypeDistribution, ZoneStats, EvolutionPoint, ProvinceReport } from '@/types/risk';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await api.get(ENDPOINTS.DASHBOARD_SUMMARY);
    return res.data;
  },

  async getFull(params?: Record<string, any>): Promise<FullDashboard> {
    const res = await api.get('/dashboard/full', { params });
    return res.data;
  },

  async getStatistics(params?: { from?: string; to?: string; province_id?: number; district_id?: number }): Promise<ReportStatistics> {
    const res = await api.get(ENDPOINTS.DASHBOARD_STATISTICS, { params });
    return res.data;
  },

  async getCrimeTypes(params?: { from?: string; to?: string; province_id?: number }): Promise<CrimeTypeDistribution[]> {
    const res = await api.get('/dashboard/crime-types', { params });
    return res.data;
  },

  async getReportsByPeriod(period: string = 'day', from?: string, to?: string): Promise<EvolutionPoint[]> {
    const res = await api.get('/dashboard/reports-by-period', { params: { period, from, to } });
    return res.data;
  },

  async getZoneStats(): Promise<ZoneStats> {
    const res = await api.get('/dashboard/zone-stats');
    return res.data;
  },

  async getReportsByProvince(regionId: number): Promise<ProvinceReport[]> {
    const res = await api.get(ENDPOINTS.REPORTS_BY_PROVINCE(regionId));
    return res.data;
  },

  async getReportsByDistrict(provinceId: number): Promise<ProvinceReport[]> {
    const res = await api.get(ENDPOINTS.REPORTS_BY_DISTRICT(provinceId));
    return res.data;
  },

  async getEvolution(days: number = 30): Promise<EvolutionPoint[]> {
    const res = await api.get(ENDPOINTS.DASHBOARD_EVOLUTION, { params: { days } });
    return res.data;
  },

  async getCriticalZones(): Promise<DashboardSummary['critical_zones']> {
    const res = await api.get(ENDPOINTS.CRITICAL_ZONES);
    return res.data;
  },
};
