import api from './api';
import { ENDPOINTS } from '@/constants/api';
import { Report, CreateReportRequest } from '@/types/report';

export const reportService = {
  async getReports(page: number = 1, perPage: number = 15): Promise<{ data: Report[]; [key: string]: any }> {
    const res = await api.get(ENDPOINTS.REPORTS, { params: { page, per_page: perPage } });
    return res.data;
  },

  async getReport(id: number): Promise<Report> {
    const res = await api.get(`${ENDPOINTS.REPORTS}/${id}`);
    return res.data;
  },

  async createReport(data: CreateReportRequest): Promise<Report> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'media' && Array.isArray(value)) {
        value.forEach((file: any) => formData.append('media[]', file));
      } else if (value !== undefined) {
        // Laravel 11 boolean validator: accepts 0/1/"0"/"1", NOT "true"/"false"
        const strVal = typeof value === 'boolean' ? (value ? '1' : '0')
                     : typeof value === 'object' ? JSON.stringify(value)
                     : String(value);
        formData.append(key, strVal);
      }
    });
    const res = await api.post(ENDPOINTS.REPORTS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateReport(id: number, data: Partial<CreateReportRequest>): Promise<Report> {
    const res = await api.put(`${ENDPOINTS.REPORTS}/${id}`, data);
    return res.data;
  },

  async deleteReport(id: number): Promise<void> {
    await api.delete(`${ENDPOINTS.REPORTS}/${id}`);
  },

  async getNearby(lat: number, lng: number, radius: number = 1): Promise<Report[]> {
    const res = await api.get(ENDPOINTS.REPORTS_NEARBY, { params: { lat, lng, radius } });
    return res.data;
  },

  async verifyReport(id: number): Promise<Report> {
    const res = await api.post(ENDPOINTS.REPORTS_VERIFY(id));
    return res.data;
  },

  async rejectReport(id: number): Promise<Report> {
    const res = await api.post(ENDPOINTS.REPORTS_REJECT(id));
    return res.data;
  },
};
