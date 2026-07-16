import { useQuery } from '@tanstack/react-query';
import { mapService } from '@/services/mapService';
import { useMapStore } from '@/store/mapStore';
import { Bounds } from '@/types/map';

export function useRiskZones(bounds: Bounds | null) {
  const setRiskZones = useMapStore((s) => s.setRiskZones);

  return useQuery({
    queryKey: ['riskZones', bounds],
    queryFn: async () => {
      if (!bounds) return [];
      const zones = await mapService.getRiskZones(bounds);
      const safeZones = Array.isArray(zones) ? zones : [];
      setRiskZones(safeZones);
      return safeZones;
    },
    enabled: !!bounds,
    staleTime: 60_000,
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
