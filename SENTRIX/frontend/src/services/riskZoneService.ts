import api from './api';
import { ENDPOINTS } from '@/constants/api';

export const riskZoneService = {
  async getAll() {
    const res = await api.get(ENDPOINTS.ADMIN_RISK_ZONES);
    return res.data;
  },

  async get(id: number) {
    const res = await api.get(ENDPOINTS.ADMIN_RISK_ZONE(id));
    return res.data;
  },

  async create(data: any) {
    const res = await api.post(ENDPOINTS.ADMIN_RISK_ZONES, data);
    return res.data;
  },

  async update(id: number, data: any) {
    const res = await api.put(ENDPOINTS.ADMIN_RISK_ZONE(id), data);
    return res.data;
  },

  async deactivate(id: number) {
    const res = await api.delete(ENDPOINTS.ADMIN_RISK_ZONE(id));
    return res.data;
  },

  async getRiskLevels() {
    const res = await api.get(ENDPOINTS.RISK_LEVELS);
    return res.data;
  },
};
