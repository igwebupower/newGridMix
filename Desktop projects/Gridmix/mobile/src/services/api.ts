import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import type { EnergyData, CarbonForecast, CleanestPeriod, InterconnectorFlow, RenewableProject } from '@/types/energy';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Response types (matching actual Next.js API)
interface ApiCurrentResponse {
  timestamp: string;
  demand: {
    total_mw: number;
  };
  generation: {
    total_mw: number;
    mix: Array<{
      fuel: string;
      mw: number;
      percentage: number;
    }>;
  };
  carbon_intensity: {
    actual: number;
    forecast?: number;
  };
  frequency: {
    hz: number;
  };
  interconnectors: Array<{
    name: string;
    country: string;
    flow_mw: number;
    capacity_mw: number;
    direction: 'import' | 'export';
  }>;
  solar?: {
    generation_mw: number;
  };
}

interface ApiForecastResponse {
  data: Array<{
    timestamp: string;
    carbon_intensity: {
      forecast: number;
    };
  }>;
}

// Transform API response to mobile app format
function transformCurrentEnergy(data: ApiCurrentResponse): EnergyData {
  // Build energy mix from generation mix array
  const energyMix = {
    wind: 0,
    solar: 0,
    nuclear: 0,
    gas: 0,
    coal: 0,
    hydro: 0,
    biomass: 0,
    imports: 0,
    other: 0,
  };

  for (const source of data.generation.mix) {
    const fuel = source.fuel.toLowerCase();
    if (fuel === 'wind') energyMix.wind = source.mw;
    else if (fuel === 'solar') energyMix.solar = source.mw;
    else if (fuel === 'nuclear') energyMix.nuclear = source.mw;
    else if (fuel === 'gas' || fuel === 'ccgt' || fuel === 'ocgt') energyMix.gas += source.mw;
    else if (fuel === 'coal') energyMix.coal = source.mw;
    else if (fuel === 'hydro' || fuel === 'pumped') energyMix.hydro += source.mw;
    else if (fuel === 'biomass') energyMix.biomass = source.mw;
    else if (fuel === 'imports' || fuel === 'intfr' || fuel === 'intirl') energyMix.imports += source.mw;
    else energyMix.other += source.mw;
  }

  // Add solar from dedicated field if available
  if (data.solar?.generation_mw) {
    energyMix.solar = data.solar.generation_mw;
  }

  // Calculate imports from interconnectors if not in generation mix
  if (energyMix.imports === 0 && data.interconnectors) {
    const totalImports = data.interconnectors
      .filter(ic => ic.direction === 'import')
      .reduce((sum, ic) => sum + ic.flow_mw, 0);
    energyMix.imports = totalImports;
  }

  return {
    id: Date.now(),
    timestamp: data.timestamp,
    totalDemand: data.demand.total_mw,
    carbonIntensity: data.carbon_intensity.actual,
    frequency: data.frequency.hz,
    energyMix,
  };
}

function transformForecast(data: ApiForecastResponse): CarbonForecast {
  const forecast = data.data.map(item => ({
    timestamp: item.timestamp,
    forecast: item.carbon_intensity.forecast,
  }));

  // Find cleanest periods (lowest carbon intensity windows)
  const cleanestPeriods: CleanestPeriod[] = [];
  if (forecast.length > 0) {
    // Sort by forecast value to find cleanest times
    const sorted = [...forecast].sort((a, b) => a.forecast - b.forecast);
    const cleanest = sorted[0];

    if (cleanest) {
      const startTime = new Date(cleanest.timestamp);
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hour window

      cleanestPeriods.push({
        start_time: cleanest.timestamp,
        end_time: endTime.toISOString(),
        avg_intensity: cleanest.forecast,
        duration_hours: 2,
      });
    }
  }

  return {
    forecast,
    cleanest_periods: cleanestPeriods,
  };
}

// Energy data
export async function fetchCurrentEnergy(): Promise<EnergyData> {
  const response = await api.get<ApiCurrentResponse>(API_ENDPOINTS.energyCurrent);
  return transformCurrentEnergy(response.data);
}

export async function fetchEnergyHistory(hours: number = 24): Promise<EnergyData[]> {
  try {
    const response = await api.get(API_ENDPOINTS.energyHistory, {
      params: { hours },
    });
    // Transform each item if it's an array
    if (Array.isArray(response.data)) {
      return response.data.map(transformCurrentEnergy);
    }
    return [];
  } catch {
    // Historical data might not be available, return empty array
    return [];
  }
}

// Carbon forecast
export async function fetchCarbonForecast(): Promise<CarbonForecast> {
  const response = await api.get<ApiForecastResponse>(API_ENDPOINTS.carbonForecast);
  return transformForecast(response.data);
}

export async function fetchCleanestPeriods(): Promise<CleanestPeriod[]> {
  const forecast = await fetchCarbonForecast();
  return forecast.cleanest_periods;
}

// Projects (not available in current API - returns empty array)
export async function fetchProjects(_params?: {
  technology?: string;
  region?: string;
  limit?: number;
}): Promise<RenewableProject[]> {
  // Projects endpoint not implemented in Next.js API
  return [];
}

// Interconnectors - now fetched from /current endpoint
export async function fetchInterconnectors(): Promise<InterconnectorFlow[]> {
  const response = await api.get<ApiCurrentResponse>(API_ENDPOINTS.energyCurrent);

  if (!response.data.interconnectors || response.data.interconnectors.length === 0) {
    return [];
  }

  return response.data.interconnectors.map(ic => ({
    name: ic.country,
    code: ic.name,
    flow: ic.flow_mw,
    capacity: ic.capacity_mw,
    direction: ic.direction,
  }));
}

// Push notifications (silently fail if not implemented)
export async function registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
  try {
    await api.post(API_ENDPOINTS.notificationRegister, { token, platform });
  } catch {
    // Notification registration not available in current API
  }
}

export async function updateNotificationPreferences(preferences: {
  lowCarbonAlerts: boolean;
  dailySummary: boolean;
  threshold: number;
}): Promise<void> {
  try {
    await api.put(API_ENDPOINTS.notificationPreferences, preferences);
  } catch {
    // Preferences endpoint not available
  }
}

// Health check
export async function checkApiHealth(): Promise<{ status: string }> {
  try {
    const response = await api.get(API_ENDPOINTS.health);
    return { status: response.data ? 'ok' : 'error' };
  } catch {
    return { status: 'error' };
  }
}

export default api;
