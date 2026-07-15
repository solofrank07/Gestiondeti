import { useQuery } from '@tanstack/react-query';
import { crimeTypeService } from '@/services/crimeTypeService';
import { CrimeType } from '@/types/report';

export function useCrimeTypes() {
  return useQuery<CrimeType[]>({
    queryKey: ['crime-types'],
    queryFn: crimeTypeService.getAll,
    staleTime: Infinity,      // never refetch — crime types are static
    gcTime: 30 * 60 * 1000,   // keep in garbage for 30 min
  });
}
