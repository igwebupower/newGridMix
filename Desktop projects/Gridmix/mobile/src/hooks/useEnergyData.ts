import { useQuery } from '@tanstack/react-query';
import { fetchCurrentEnergy, fetchEnergyHistory, fetchCarbonForecast, fetchCleanestPeriods, fetchProjects, fetchInterconnectors, fetchSystemPrice, fetchFrequency } from '@/services/api';
import { REFRESH_INTERVALS } from '@/constants/api';

export function useCurrentEnergy() {
  return useQuery({
    queryKey: ['energy', 'current'],
    queryFn: fetchCurrentEnergy,
    refetchInterval: REFRESH_INTERVALS.current,
    staleTime: REFRESH_INTERVALS.current / 2,
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour for offline support
  });
}

export function useEnergyHistory(hours: number = 24) {
  return useQuery({
    queryKey: ['energy', 'history', hours],
    queryFn: () => fetchEnergyHistory(hours),
    refetchInterval: REFRESH_INTERVALS.history,
    staleTime: REFRESH_INTERVALS.history / 2,
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
}

export function useCarbonForecast() {
  return useQuery({
    queryKey: ['carbon', 'forecast'],
    queryFn: fetchCarbonForecast,
    refetchInterval: REFRESH_INTERVALS.forecast,
    staleTime: REFRESH_INTERVALS.forecast / 2,
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
  });
}

export function useCleanestPeriods() {
  return useQuery({
    queryKey: ['carbon', 'cleanest'],
    queryFn: fetchCleanestPeriods,
    refetchInterval: REFRESH_INTERVALS.forecast,
    staleTime: REFRESH_INTERVALS.forecast / 2,
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
  });
}

export function useProjects(params?: {
  technology?: string;
  region?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => fetchProjects(params),
    staleTime: 1000 * 60 * 60, // Projects data is stable, 1 hour stale time
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
}

export function useInterconnectors() {
  return useQuery({
    queryKey: ['interconnectors'],
    queryFn: fetchInterconnectors,
    refetchInterval: REFRESH_INTERVALS.current, // 5 minutes
    staleTime: REFRESH_INTERVALS.current / 2,   // 2.5 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour for offline support
  });
}

export function useSystemPrice() {
  return useQuery({
    queryKey: ['systemPrice'],
    queryFn: fetchSystemPrice,
    refetchInterval: REFRESH_INTERVALS.current, // 5 minutes
    staleTime: REFRESH_INTERVALS.current / 2,
    gcTime: 1000 * 60 * 60,
  });
}

export function useFrequency() {
  return useQuery({
    queryKey: ['frequency'],
    queryFn: fetchFrequency,
    refetchInterval: 15000, // 15 seconds - frequency updates rapidly
    staleTime: 10000,
    gcTime: 1000 * 60 * 60,
  });
}
