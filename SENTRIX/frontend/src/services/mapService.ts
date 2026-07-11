import api from './api';
import { ENDPOINTS } from '@/constants/api';
import { RiskZone, HeatmapPoint, MapCluster, Region, Province, District, Bounds } from '@/types/map';

export const mapService = {
  async getRiskZones(bounds: Bounds): Promise<RiskZone[]> {
    const res = await api.get(ENDPOINTS.RISK_ZONES, { params: bounds });
    return res.data;
  },

  async getHeatmap(bounds: Bounds, zoom: number): Promise<HeatmapPoint[]> {
    const res = await api.get(ENDPOINTS.HEATMAP, { params: { ...bounds, zoom } });
    return res.data;
  },

  async getHeatmapTile(z: number, x: number, y: number): Promise<HeatmapPoint[]> {
    const res = await api.get(ENDPOINTS.HEATMAP_TILE.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y)));
    return res.data;
  },

  async getClusters(bounds: Bounds, zoom: number): Promise<MapCluster[]> {
    const res = await api.get(ENDPOINTS.CLUSTERS, { params: { ...bounds, zoom } });
    return res.data;
  },

  async getRegions(): Promise<Region[]> {
    const res = await api.get(ENDPOINTS.REGIONS);
    return res.data;
  },

  async getProvinces(regionId: number): Promise<Province[]> {
    const res = await api.get(ENDPOINTS.PROVINCES + `/${regionId}`);
    return res.data;
  },

  async getDistricts(provinceId: number): Promise<District[]> {
    const res = await api.get(ENDPOINTS.DISTRICTS + `/${provinceId}`);
    return res.data;
  },
};
