import api from './api';
import { CrimeType } from '@/types/report';

export const crimeTypeService = {
  async getAll(): Promise<CrimeType[]> {
    const res = await api.get<CrimeType[]>('/crime-types');
    return res.data;
  },
};
