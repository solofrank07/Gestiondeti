import api from './api';

export const aiService = {
  async getInsights(): Promise<{ patterns: any[]; critical: any; generated_at: string }> {
    const res = await api.get('/ai/insights');
    return res.data;
  },

  async getPatterns(): Promise<{ patterns: any[]; total_patterns: number }> {
    const res = await api.get('/ai/patterns');
    return res.data;
  },

  async predictZone(zoneId: number): Promise<any> {
    const res = await api.get(`/ai/predict-zone/${zoneId}`);
    return res.data;
  },

  async safeRoute(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<any> {
    const res = await api.get('/ai/safe-route', { params: { from_lat: fromLat, from_lng: fromLng, to_lat: toLat, to_lng: toLng } });
    return res.data;
  },

  async classifyReport(reportId: number): Promise<any> {
    const res = await api.post(`/ai/classify-report/${reportId}`);
    return res.data;
  },

  async detectFalse(reportId: number): Promise<any> {
    const res = await api.get(`/ai/detect-false/${reportId}`);
    return res.data;
  },

  async getCriticalPredictions(): Promise<{ predictions: any[]; total_at_risk: number }> {
    const res = await api.get('/ai/critical-zones');
    return res.data;
  },
};
