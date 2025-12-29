import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import type { EnergyData, CarbonForecast, CleanestPeriod, RenewableProject, InterconnectorFlow } from '@/types/energy';
import { INTERCONNECTOR_COUNTRIES, INTERCONNECTOR_CAPACITIES } from '@/types/energy';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Energy data
export async function fetchCurrentEnergy(): Promise<EnergyData> {
  const response = await api.get(API_ENDPOINTS.energyCurrent);
  return response.data;
}

export async function fetchEnergyHistory(hours: number = 24): Promise<EnergyData[]> {
  const response = await api.get(API_ENDPOINTS.energyHistory, {
    params: { hours },
  });
  return response.data;
}

// Carbon forecast
export async function fetchCarbonForecast(): Promise<CarbonForecast> {
  const response = await api.get(API_ENDPOINTS.carbonForecast);
  return response.data;
}

export async function fetchCleanestPeriods(): Promise<CleanestPeriod[]> {
  const response = await api.get(API_ENDPOINTS.carbonForecastCleanest);
  return response.data;
}

// Projects
export async function fetchProjects(params?: {
  technology?: string;
  region?: string;
  limit?: number;
}): Promise<RenewableProject[]> {
  const response = await api.get(API_ENDPOINTS.repdProjects, { params });
  return response.data;
}

// Interconnectors
interface BMRSInterconnectorData {
  fuelType: string;
  quantity: number;
  settlementDate: string;
  activeFlag: string;
}

export async function fetchInterconnectors(): Promise<InterconnectorFlow[]> {
  const response = await api.get<BMRSInterconnectorData[]>(API_ENDPOINTS.bmrsInterconnectors, {
    params: { hours: 1 },
  });

  // Handle empty response
  if (!response.data || response.data.length === 0) {
    return [];
  }

  // Get latest reading for each interconnector code (by settlement date)
  const latestReadings = new Map<string, BMRSInterconnectorData>();

  for (const item of response.data) {
    if (item.activeFlag === 'Y' && item.fuelType.startsWith('INT')) {
      const existing = latestReadings.get(item.fuelType);
      if (!existing || item.settlementDate > existing.settlementDate) {
        latestReadings.set(item.fuelType, item);
      }
    }
  }

  // Extract flow values from latest readings
  const aggregated = new Map<string, number>();
  for (const [code, item] of latestReadings) {
    aggregated.set(code, item.quantity);
  }

  // Transform to InterconnectorFlow format, grouped by country
  const countryFlows = new Map<string, InterconnectorFlow>();

  for (const [code, flow] of aggregated) {
    const country = INTERCONNECTOR_COUNTRIES[code] || code;
    const capacity = INTERCONNECTOR_CAPACITIES[code] || 1000;

    const existing = countryFlows.get(country);
    if (existing) {
      // Aggregate flows for same country (e.g., France has INTFR, INTELEC, INTIFA2)
      existing.flow += flow;
      existing.capacity += capacity;
    } else {
      countryFlows.set(country, {
        name: country,
        code,
        flow,
        capacity,
        direction: flow >= 0 ? 'import' : 'export',
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
  return response.data;
}

export default api;
