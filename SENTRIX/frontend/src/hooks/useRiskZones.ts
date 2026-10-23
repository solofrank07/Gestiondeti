import { useQuery } from '@tanstack/react-query';
import { mapService } from '@/services/mapService';
import { useMapStore } from '@/store/mapStore';
import type { Bounds } from '@/types/map';

// Peru bounds — always fetch all zones, never filter by viewport
const PERU_BOUNDS = { north: -0.03, south: -18.35, east: -68.65, west: -81.33 };

export function useRiskZones() {
  const setRiskZones = useMapStore((s) => s.setRiskZones);

  return useQuery({
    queryKey: ['riskZones'],
    queryFn: async () => {
      const res = await mapService.getRiskZones(PERU_BOUNDS);
      const safeZones = Array.isArray(res.zones) ? res.zones : [];
      setRiskZones(safeZones);
      return safeZones;
    },
    staleTime: Infinity,
    retry: 1,
  });
}

export function useHeatmap(bounds: Bounds | null, zoom: number) {
  const setHeatmapData = useMapStore((s) => s.setHeatmapData);

  return useQuery({
    queryKey: ['heatmap', bounds, zoom],
    queryFn: async () => {
      if (!bounds) return [];
      const data = await mapService.getHeatmap(bounds, zoom);
      const safeData = Array.isArray(data) ? data : [];
      setHeatmapData(safeData);
      return safeData;
    },
    enabled: !!bounds,
    retry: 1,
  });
}

export function useClusters(bounds: Bounds | null, zoom: number) {
  const setClusters = useMapStore((s) => s.setClusters);

  return useQuery({
    queryKey: ['clusters', bounds, zoom],
    queryFn: async () => {
      if (!bounds) return [];
      const clusters = await mapService.getClusters(bounds, zoom);
      const safeClusters = Array.isArray(clusters) ? clusters : [];
      setClusters(safeClusters);
      return safeClusters;
    },
    enabled: !!bounds,
  });
}
