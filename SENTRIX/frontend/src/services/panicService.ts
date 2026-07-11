import api from './api';
import { ENDPOINTS } from '@/constants/api';
import { PanicAlert } from '@/types/risk';

export const panicService = {
  async create(data: { latitude: number; longitude: number; address?: string; message?: string }): Promise<PanicAlert> {
    const res = await api.post(ENDPOINTS.PANIC, data);
    return res.data;
  },

  async getHistory(): Promise<PanicAlert[]> {
    const res = await api.get(ENDPOINTS.PANIC_HISTORY);
    return res.data;
  },

  async getActive(): Promise<PanicAlert[]> {
    const res = await api.get(ENDPOINTS.PANIC_ACTIVE);
    return res.data;
  },

  async attend(id: number): Promise<PanicAlert> {
    const res = await api.post(ENDPOINTS.PANIC_ATTEND(id));
    return res.data;
  },
};
