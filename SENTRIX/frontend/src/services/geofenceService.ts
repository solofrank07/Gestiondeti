import api from './api';
import { ENDPOINTS } from '@/constants/api';
import { GeofenceCheckResponse, GeofenceHistoryEvent } from '@/types/risk';

export const geofenceService = {
  async checkProximity(lat: number, lng: number, speedMs?: number): Promise<GeofenceCheckResponse> {
    const res = await api.post(ENDPOINTS.GEOFENCE_CHECK, { lat, lng, speed_ms: speedMs });
    return res.data;
  },

  async getHistory(limit: number = 50): Promise<GeofenceHistoryEvent[]> {
    const res = await api.get('/geofence/history', { params: { limit } });
    return res.data;
  },

  async getZones(lat: number, lng: number): Promise<any[]> {
    const res = await api.get(ENDPOINTS.GEOFENCE_ZONES(lat, lng));
    return res.data;
  },
};
