import api from './api';
import { ENDPOINTS } from '@/constants/api';
import { User } from '@/types/auth';

export const adminService = {
  async getUsers(page: number = 1, perPage: number = 20): Promise<{ data: User[]; total: number }> {
    const res = await api.get(ENDPOINTS.ADMIN_USERS, { params: { page, per_page: perPage } });
    return res.data;
  },

  async getUser(id: number): Promise<User> {
    const res = await api.get(ENDPOINTS.ADMIN_USER(id));
    return res.data;
  },

  async updateUserRole(id: number, role: string): Promise<User> {
    const res = await api.put(ENDPOINTS.ADMIN_USER_ROLE(id), { role });
    return res.data;
  },

  async importCsv(file: FormData): Promise<{ imported: number; errors: any[] }> {
    const res = await api.post(ENDPOINTS.ADMIN_ETL_IMPORT_CSV, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async importApi(source: string, data: any[]): Promise<{ imported: number; errors: any[] }> {
    const res = await api.post(ENDPOINTS.ADMIN_ETL_IMPORT_API, { source, data });
    return res.data;
  },

  async getEtlHistory(): Promise<any[]> {
    const res = await api.get(ENDPOINTS.ADMIN_ETL_HISTORY);
    return res.data;
  },

  async fetchExternalSource(source: string): Promise<{ imported: number; errors: any[]; skipped: number; total: number }> {
    const res = await api.post(ENDPOINTS.ADMIN_ETL_FETCH, { source });
    return res.data;
  },

  async getEtlImportDetail(id: number): Promise<any> {
    const res = await api.get(ENDPOINTS.ADMIN_ETL_IMPORT(id));
    return res.data;
  },

  async getSettings(): Promise<any[]> {
    const res = await api.get(ENDPOINTS.ADMIN_SETTINGS);
    return res.data;
  },

  async updateSetting(key: string, value: any): Promise<any> {
    const res = await api.put(ENDPOINTS.ADMIN_SETTINGS, { key, value });
    return res.data;
  },
};
