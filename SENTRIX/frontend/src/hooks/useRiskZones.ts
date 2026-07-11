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
      setRiskZones(zones);
      return zones;
    },
    enabled: !!bounds,
  });
}

export function useHeatmap(bounds: Bounds | null, zoom: number) {
  const setHeatmapData = useMapStore((s) => s.setHeatmapData);

  return useQuery({
    queryKey: ['heatmap', bounds, zoom],
    queryFn: async () => {
      if (!bounds) return [];
      const data = await mapService.getHeatmap(bounds, zoom);
      setHeatmapData(data);
      return data;
    },
    enabled: !!bounds,
  });
}

export function useClusters(bounds: Bounds | null, zoom: number) {
  const setClusters = useMapStore((s) => s.setClusters);

  return useQuery({
    queryKey: ['clusters', bounds, zoom],
    queryFn: async () => {
      if (!bounds) return [];
      const clusters = await mapService.getClusters(bounds, zoom);
      setClusters(clusters);
      return clusters;
    },
    enabled: !!bounds,
  });
}
