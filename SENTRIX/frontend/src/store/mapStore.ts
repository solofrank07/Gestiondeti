import { create } from 'zustand';
import { RiskZone, HeatmapPoint, MapCluster, Bounds } from '@/types/map';

interface MapState {
  riskZones: RiskZone[];
  heatmapData: HeatmapPoint[];
  clusters: MapCluster[];
  bounds: Bounds | null;
  selectedZone: RiskZone | null;
  isLoading: boolean;
  setRiskZones: (zones: RiskZone[]) => void;
  setHeatmapData: (data: HeatmapPoint[]) => void;
  setClusters: (clusters: MapCluster[]) => void;
  setBounds: (bounds: Bounds) => void;
  setSelectedZone: (zone: RiskZone | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  riskZones: [],
  heatmapData: [],
  clusters: [],
  bounds: null,
  selectedZone: null,
  isLoading: false,
  setRiskZones: (riskZones) => set({ riskZones }),
  setHeatmapData: (heatmapData) => set({ heatmapData }),
  setClusters: (clusters) => set({ clusters }),
  setBounds: (bounds) => set({ bounds }),
  setSelectedZone: (selectedZone) => set({ selectedZone }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () =>
    set({
      riskZones: [],
      heatmapData: [],
      clusters: [],
      bounds: null,
      selectedZone: null,
    }),
}));
