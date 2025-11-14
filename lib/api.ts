// GridMix API Integration Layer
// Integrates with BMRS (Balancing Mechanism Reporting Service) Elexon API

const BMRS_API_BASE = 'https://data.elexon.co.uk/bmrs/api/v1';

// Types
export interface GenerationMix {
  fuel: string;
  perc: number;
  mw: number;
}

export interface BMRSFuelItem {
  startTime: string;
  settlementDate: string;
  settlementPeriod: number;
  psrType: string; // Fuel type
  quantity: number; // MW
}

export interface DemandData {
  startTime: string;
  demand: number;
  forecast?: number;
}

export interface GridData {
  from: string;
  to: string;
  intensity: {
    forecast: number;
    actual: number;
    index: string;
  };
  generationmix: GenerationMix[];
  totalGeneration: number;
}

export interface HistoricalData {
  from: string;
  to: string;
  intensity: {
    forecast: number;
    actual: number;
  };
}

export interface Stats {
  demand: number;
  frequency: number;
  low_carbon_perc: number;
  renewable_perc: number;
  fossil_perc: number;
  nuclear_perc: number;
  imports_perc: number;
}

// Map BMRS PSR types to our fuel types
const fuelTypeMapping: Record<string, string> = {
  'Biomass': 'biomass',
  'Fossil Gas': 'gas',
  'Fossil Hard coal': 'coal',
  'Fossil Oil': 'oil',
  'Hydro Pumped Storage': 'hydro',
  'Hydro Run-of-river and poundage': 'hydro',
  'Nuclear': 'nuclear',
  'Solar': 'solar',
  'Wind Offshore': 'wind',
  'Wind Onshore': 'wind',
  'Other': 'other',
  'Interconnector': 'imports',
};

// Fetch current instantaneous generation mix
export async function getCurrentGridData(): Promise<GridData> {
  try {
    // Fetch instantaneous generation data (FUELINST)
    const response = await fetch(
      `${BMRS_API_BASE}/datasets/FUELINST?format=json`,
      {
        next: { revalidate: 30 }, // Revalidate every 30 seconds
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch grid data');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('No generation data available');
    }

    // Get the most recent data point for each fuel type
    const latestData = getLatestDataByFuelType(data.data);

    // Calculate total generation
    const totalGeneration = latestData.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate percentages
    const generationmix: GenerationMix[] = latestData.map(item => ({
      fuel: fuelTypeMapping[item.psrType] || 'other',
      mw: item.quantity,
      perc: (item.quantity / totalGeneration) * 100,
    }));

    // Aggregate same fuel types
    const aggregatedMix = aggregateFuelTypes(generationmix);

    // Get the latest timestamp
    const latestTime = latestData[0]?.startTime || new Date().toISOString();

    // Carbon intensity estimation (simplified)
    const intensity = estimateCarbonIntensity(aggregatedMix);

    return {
      from: latestTime,
      to: latestTime,
      intensity: {
        forecast: intensity,
        actual: intensity,
        index: getIntensityIndex(intensity),
      },
      generationmix: aggregatedMix,
      totalGeneration,
    };
  } catch (error) {
    console.error('Error fetching grid data:', error);
    throw error;
  }
}

// Get latest data for each fuel type
function getLatestDataByFuelType(data: BMRSFuelItem[]): BMRSFuelItem[] {
  const latestByType: Record<string, BMRSFuelItem> = {};

  data.forEach(item => {
    if (!latestByType[item.psrType] ||
        new Date(item.startTime) > new Date(latestByType[item.psrType].startTime)) {
      latestByType[item.psrType] = item;
    }
  });

  return Object.values(latestByType);
}

// Aggregate fuel types (combine wind, hydro, etc.)
function aggregateFuelTypes(mix: GenerationMix[]): GenerationMix[] {
  const aggregated: Record<string, GenerationMix> = {};

  mix.forEach(item => {
    if (aggregated[item.fuel]) {
      aggregated[item.fuel].mw += item.mw;
      aggregated[item.fuel].perc += item.perc;
    } else {
      aggregated[item.fuel] = { ...item };
    }
  });

  return Object.values(aggregated);
}

// Estimate carbon intensity based on generation mix
function estimateCarbonIntensity(mix: GenerationMix[]): number {
  const carbonFactors: Record<string, number> = {
    'coal': 820,
    'gas': 370,
    'oil': 650,
    'biomass': 120,
    'nuclear': 0,
    'hydro': 0,
    'wind': 0,
    'solar': 0,
    'other': 200,
    'imports': 300, // Average
  };

  let totalCarbon = 0;
  mix.forEach(item => {
    const factor = carbonFactors[item.fuel] || 0;
    totalCarbon += (item.perc / 100) * factor;
  });

  return Math.round(totalCarbon);
}

// Get intensity index
function getIntensityIndex(intensity: number): string {
  if (intensity < 100) return 'very low';
  if (intensity < 150) return 'low';
  if (intensity < 200) return 'moderate';
  if (intensity < 250) return 'high';
  return 'very high';
}

// Fetch current demand
export async function getCurrentDemand(): Promise<number> {
  try {
    const response = await fetch(
      `${BMRS_API_BASE}/datasets/INDDEM?format=json`,
      {
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch demand data');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return 0;
    }

    // Get the most recent demand value
    const latest = data.data.sort((a: any, b: any) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )[0];

    return latest.demand || 0;
  } catch (error) {
    console.error('Error fetching demand:', error);
    return 0;
  }
}

// Fetch statistics (calculated from generation mix)
export async function getGridStats(): Promise<Stats> {
  try {
    const gridData = await getCurrentGridData();
    const demand = await getCurrentDemand();
    const mix = gridData.generationmix;

    // Calculate percentages
    const renewable_perc = mix
      .filter(item => ['wind', 'solar', 'hydro'].includes(item.fuel))
      .reduce((sum, item) => sum + item.perc, 0);

    const fossil_perc = mix
      .filter(item => ['gas', 'coal', 'oil'].includes(item.fuel))
      .reduce((sum, item) => sum + item.perc, 0);

    const nuclear_perc = mix.find(item => item.fuel === 'nuclear')?.perc || 0;

    const imports_perc = mix.find(item => item.fuel === 'imports')?.perc || 0;

    const low_carbon_perc = renewable_perc + nuclear_perc;

    return {
      demand,
      frequency: 50.0, // Standard UK grid frequency
      low_carbon_perc,
      renewable_perc,
      fossil_perc,
      nuclear_perc,
      imports_perc,
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    throw error;
  }
}

// Fetch historical generation data (last 24-48 hours)
export async function getHistoricalGeneration(hours: number = 24): Promise<HistoricalData[]> {
  try {
    const now = new Date();
    const from = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const response = await fetch(
      `${BMRS_API_BASE}/datasets/FUELHH?from=${from.toISOString()}&to=${now.toISOString()}&format=json`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch historical data');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Group by settlement period and calculate intensity
    const groupedData = groupBySettlementPeriod(data.data);

    return groupedData.map(group => ({
      from: group.startTime,
      to: group.startTime,
      intensity: {
        forecast: group.intensity,
        actual: group.intensity,
      },
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
}

// Group data by settlement period
function groupBySettlementPeriod(data: BMRSFuelItem[]): any[] {
  const grouped: Record<string, BMRSFuelItem[]> = {};

  data.forEach(item => {
    const key = `${item.settlementDate}_${item.settlementPeriod}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  return Object.entries(grouped).map(([key, items]) => {
    const totalGen = items.reduce((sum, item) => sum + item.quantity, 0);
    const mix = items.map(item => ({
      fuel: fuelTypeMapping[item.psrType] || 'other',
      mw: item.quantity,
      perc: (item.quantity / totalGen) * 100,
    }));

    const aggregated = aggregateFuelTypes(mix);
    const intensity = estimateCarbonIntensity(aggregated);

    return {
      startTime: items[0].startTime,
      intensity,
    };
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

// Fetch forecast (uses historical as placeholder for now)
export async function getIntensityForecast(hours: number = 24): Promise<HistoricalData[]> {
  // For now, return historical data as forecast placeholder
  // In production, you would use FOU2T14D dataset
  return getHistoricalGeneration(hours);
}

// Fetch historical intensity data (wrapper)
export async function getHistoricalIntensity(hours: number = 24): Promise<HistoricalData[]> {
  return getHistoricalGeneration(hours);
}

// Helper: Format fuel names for display
export function formatFuelName(fuel: string): string {
  const fuelNames: Record<string, string> = {
    'biomass': 'Biomass',
    'coal': 'Coal',
    'oil': 'Oil',
    'imports': 'Imports',
    'gas': 'Natural Gas',
    'nuclear': 'Nuclear',
    'other': 'Other',
    'hydro': 'Hydro',
    'solar': 'Solar',
    'wind': 'Wind',
  };

  return fuelNames[fuel] || fuel.charAt(0).toUpperCase() + fuel.slice(1);
}

// Helper: Get color for fuel type
export function getFuelColor(fuel: string): string {
  const colors: Record<string, string> = {
    'wind': '#10b981',
    'solar': '#f59e0b',
    'hydro': '#3b82f6',
    'biomass': '#84cc16',
    'nuclear': '#8b5cf6',
    'gas': '#ef4444',
    'coal': '#1f2937',
    'oil': '#78350f',
    'imports': '#6b7280',
    'other': '#9ca3af',
  };

  return colors[fuel] || '#9ca3af';
}

// Helper: Format timestamp
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper: Get intensity level description
export function getIntensityLevel(intensity: number): {
  level: string;
  color: string;
} {
  if (intensity < 100) return { level: 'Very Low', color: '#10b981' };
  if (intensity < 150) return { level: 'Low', color: '#84cc16' };
  if (intensity < 200) return { level: 'Moderate', color: '#f59e0b' };
  if (intensity < 250) return { level: 'High', color: '#ef4444' };
  return { level: 'Very High', color: '#dc2626' };
}
