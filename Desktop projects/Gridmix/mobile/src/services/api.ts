import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import type { EnergyData, CarbonForecast, CarbonForecastPeriod, CleanestPeriod, RenewableProject, InterconnectorFlow } from '@/types/energy';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for v1 API responses
interface V1CurrentResponse {
  timestamp: string;
  demand: {
    total_mw: number;
    national_mw: number;
    exports_mw: number;
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
    forecast: number;
    level: string;
  };
  frequency: {
    hz: number;
    status: string;
  };
  interconnectors: Array<{
    name: string;
    country: string;
    flow_mw: number;
    capacity_mw: number;
    direction: 'import' | 'export';
  }>;
  solar: {
    generation_mw: number;
    capacity_percent: number;
    installed_capacity_mw: number;
  };
  system_price: {
    price_gbp_per_mwh: number;
    timestamp: string;
  };
}

interface V1ForecastResponse {
  generated_at: string;
  forecast_hours: number;
  data_points: number;
  data: Array<{
    timestamp: string;
    carbon_intensity: {
      forecast: number;
      level: string;
    };
  }>;
}

interface V1HistoricalResponse {
  period: {
    from: string;
    to: string;
    hours: number;
  };
  data: Array<{
    timestamp: string;
    demand_mw: number;
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
      level: string;
    };
  }>;
}

// Helper to map fuel types from API to our format
function mapFuelToMix(mix: Array<{ fuel: string; mw: number }>): {
  wind: number;
  solar: number;
  nuclear: number;
  gas: number;
  coal: number;
  hydro: number;
  biomass: number;
  imports: number;
  other: number;
} {
  const result = {
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

  for (const item of mix) {
    const fuel = item.fuel.toLowerCase();
    if (fuel === 'wind') result.wind = item.mw;
    else if (fuel === 'solar') result.solar = item.mw;
    else if (fuel === 'nuclear') result.nuclear = item.mw;
    else if (fuel === 'gas' || fuel === 'ccgt' || fuel === 'ocgt') result.gas += item.mw;
    else if (fuel === 'coal') result.coal = item.mw;
    else if (fuel === 'hydro') result.hydro = item.mw;
    else if (fuel === 'biomass') result.biomass = item.mw;
    else if (fuel === 'imports' || fuel.startsWith('int')) result.imports += item.mw;
    else result.other += item.mw;
  }

  return result;
}

// Energy data - transforms v1/current response
export async function fetchCurrentEnergy(): Promise<EnergyData> {
  const response = await api.get<V1CurrentResponse>(API_ENDPOINTS.current);
  const data = response.data;

  return {
    id: Date.now(),
    timestamp: data.timestamp,
    totalDemand: data.demand.total_mw,
    carbonIntensity: data.carbon_intensity.actual || data.carbon_intensity.forecast,
    frequency: data.frequency.hz,
    energyMix: mapFuelToMix(data.generation.mix),
    systemStatus: {
      frequency: data.frequency.hz,
      reserveMargin: 0, // Not available in current API
      netImports: data.interconnectors.reduce((sum, ic) =>
        sum + (ic.direction === 'import' ? ic.flow_mw : -ic.flow_mw), 0),
    },
  };
}

export async function fetchEnergyHistory(hours: number = 24): Promise<EnergyData[]> {
  const response = await api.get<V1HistoricalResponse>(API_ENDPOINTS.historical, {
    params: { hours },
  });
  const data = response.data;

  return data.data.map((item, index) => ({
    id: index,
    timestamp: item.timestamp,
    totalDemand: item.demand_mw,
    carbonIntensity: item.carbon_intensity.actual,
    frequency: 50, // Not available in historical
    energyMix: mapFuelToMix(item.generation.mix),
  }));
}

// Carbon forecast - transforms v1/forecast response
export async function fetchCarbonForecast(): Promise<CarbonForecast> {
  const response = await api.get<V1ForecastResponse>(API_ENDPOINTS.forecast, {
    params: { hours: 48 },
  });
  const data = response.data;

  const forecast: CarbonForecastPeriod[] = data.data.map(item => ({
    timestamp: item.timestamp,
    forecast: item.carbon_intensity.forecast,
  }));

  // Calculate cleanest periods from forecast data
  const cleanestPeriods = findCleanestPeriods(forecast);

  return {
    forecast,
    cleanest_periods: cleanestPeriods,
  };
}

// Helper to find cleanest periods in forecast
function findCleanestPeriods(forecast: CarbonForecastPeriod[]): CleanestPeriod[] {
  if (forecast.length === 0) return [];

  // Sort by intensity to find lowest periods
  const sorted = [...forecast].sort((a, b) => a.forecast - b.forecast);

  // Take top 3 cleanest consecutive periods
  const periods: CleanestPeriod[] = [];
  const used = new Set<number>();

  for (const item of sorted) {
    const index = forecast.findIndex(f => f.timestamp === item.timestamp);
    if (used.has(index)) continue;

    // Find consecutive low-carbon hours
    let endIndex = index;
    while (endIndex < forecast.length - 1 &&
           forecast[endIndex + 1].forecast <= item.forecast * 1.2 &&
           !used.has(endIndex + 1)) {
      endIndex++;
    }

    // Mark as used
    for (let i = index; i <= endIndex; i++) {
      used.add(i);
    }

    const periodForecasts = forecast.slice(index, endIndex + 1);
    const avgIntensity = periodForecasts.reduce((sum, f) => sum + f.forecast, 0) / periodForecasts.length;

    periods.push({
      start_time: forecast[index].timestamp,
      end_time: forecast[endIndex].timestamp,
      avg_intensity: Math.round(avgIntensity),
      duration_hours: endIndex - index + 1,
    });

    if (periods.length >= 3) break;
  }

  return periods.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

export async function fetchCleanestPeriods(): Promise<CleanestPeriod[]> {
  const forecast = await fetchCarbonForecast();
  return forecast.cleanest_periods;
}

// Projects - placeholder (not available in current API)
export async function fetchProjects(_params?: {
  technology?: string;
  region?: string;
  limit?: number;
}): Promise<RenewableProject[]> {
  // Projects endpoint not available in current API
  // Return empty array for now
  return [];
}

// Interconnectors - extracted from v1/current response
export async function fetchInterconnectors(): Promise<InterconnectorFlow[]> {
  const response = await api.get<V1CurrentResponse>(API_ENDPOINTS.current);
  const data = response.data;

  if (!data.interconnectors || data.interconnectors.length === 0) {
    return [];
  }

  // Group by country and aggregate flows
  const countryFlows = new Map<string, InterconnectorFlow>();

  for (const ic of data.interconnectors) {
    const country = ic.country || ic.name;
    const existing = countryFlows.get(country);

    if (existing) {
      existing.flow += ic.flow_mw;
      existing.capacity += ic.capacity_mw;
    } else {
      countryFlows.set(country, {
        name: country,
        code: ic.name,
        flow: ic.flow_mw,
        capacity: ic.capacity_mw,
        direction: ic.direction,
      });
    }
  }

  // Update direction based on final aggregated flow
  const flows = Array.from(countryFlows.values()).map(f => ({
    ...f,
    direction: (f.flow >= 0 ? 'import' : 'export') as 'import' | 'export',
  }));

  // Sort by absolute flow value (highest first)
  return flows.sort((a, b) => Math.abs(b.flow) - Math.abs(a.flow));
}

// System price - extracted from v1/current
export async function fetchSystemPrice(): Promise<{ price: number; timestamp: string }> {
  const response = await api.get<V1CurrentResponse>(API_ENDPOINTS.current);
  return {
    price: response.data.system_price.price_gbp_per_mwh,
    timestamp: response.data.system_price.timestamp,
  };
}

// Grid frequency - extracted from v1/current
export async function fetchFrequency(): Promise<{ hz: number; status: string }> {
  const response = await api.get<V1CurrentResponse>(API_ENDPOINTS.current);
  return {
    hz: response.data.frequency.hz,
    status: response.data.frequency.status,
  };
}

// Push notifications
export async function registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
  await api.post(API_ENDPOINTS.notificationRegister, { token, platform });
}

export async function updateNotificationPreferences(preferences: {
  lowCarbonAlerts: boolean;
  dailySummary: boolean;
  threshold: number;
}): Promise<void> {
  await api.put(API_ENDPOINTS.notificationPreferences, preferences);
}

// Health check
export async function checkApiHealth(): Promise<{ status: string }> {
  const response = await api.get(API_ENDPOINTS.health);
  return { status: response.data ? 'ok' : 'error' };
}

export default api;
