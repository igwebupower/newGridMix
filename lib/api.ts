// GridMix API Integration Layer
// Integrates with BMRS (Balancing Mechanism Reporting Service) Elexon API

const BMRS_API_BASE = 'https://data.elexon.co.uk/bmrs/api/v1';

// Types
export interface GenerationMix {
  fuel: string;
  perc: number;
  mw: number;
}

export interface Interconnector {
  name: string;
  country: string;
  flow: number; // Positive = import, Negative = export
  capacity: number;
}

export interface BMRSFuelItem {
  startTime: string;
  settlementDate: string;
  settlementPeriod: number;
  fuelType: string;
  generation: number; // MW
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
  interconnectors: Interconnector[];
  totalGeneration: number;
  totalImports: number;
  totalExports: number;
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

// Map BMRS fuel types to our display types
const fuelTypeMapping: Record<string, string> = {
  'BIOMASS': 'biomass',
  'CCGT': 'gas',
  'OCGT': 'gas',
  'COAL': 'coal',
  'OIL': 'oil',
  'NPSHYD': 'hydro',
  'PS': 'hydro',
  'NUCLEAR': 'nuclear',
  'WIND': 'wind',
  'OTHER': 'other',
};

// Interconnector name mapping
const interconnectorMapping: Record<string, { name: string; country: string; capacity: number }> = {
  'INTELEC': { name: 'ElecLink', country: 'France', capacity: 1000 },
  'INTEW': { name: 'East-West', country: 'Ireland', capacity: 500 },
  'INTFR': { name: 'IFA', country: 'France', capacity: 2000 },
  'INTGRNL': { name: 'Greenlink', country: 'Ireland', capacity: 500 },
  'INTIFA2': { name: 'IFA2', country: 'France', capacity: 1000 },
  'INTIRL': { name: 'Moyle', country: 'N. Ireland', capacity: 500 },
  'INTNED': { name: 'BritNed', country: 'Netherlands', capacity: 1000 },
  'INTNEM': { name: 'Nemo', country: 'Belgium', capacity: 1000 },
  'INTNSL': { name: 'NSL', country: 'Norway', capacity: 1400 },
  'INTVKL': { name: 'Viking', country: 'Denmark', capacity: 1400 },
};

// Fetch current instantaneous generation mix
export async function getCurrentGridData(): Promise<GridData> {
  try {
    // Fetch instantaneous generation data (FUELINST)
    const response = await fetch(
      `${BMRS_API_BASE}/datasets/FUELINST?format=json`,
      {
        cache: 'no-store', // Disable caching for real-time data
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

    // Separate interconnectors and generation
    const interconnectorData: BMRSFuelItem[] = [];
    const generationData: BMRSFuelItem[] = [];

    latestData.forEach(item => {
      if (item.fuelType.startsWith('INT')) {
        interconnectorData.push(item);
      } else if (fuelTypeMapping[item.fuelType]) {
        generationData.push(item);
      }
    });

    // Calculate total generation (excluding interconnectors)
    const totalGeneration = generationData.reduce((sum, item) => sum + Math.max(0, item.generation), 0);

    // Process interconnectors
    const interconnectors: Interconnector[] = interconnectorData.map(item => {
      const info = interconnectorMapping[item.fuelType] || {
        name: item.fuelType,
        country: 'Unknown',
        capacity: 1000,
      };
      return {
        name: info.name,
        country: info.country,
        flow: item.generation,
        capacity: info.capacity,
      };
    });

    // Calculate total imports/exports
    const totalImports = interconnectors
      .filter(ic => ic.flow > 0)
      .reduce((sum, ic) => sum + ic.flow, 0);

    const totalExports = Math.abs(
      interconnectors
        .filter(ic => ic.flow < 0)
        .reduce((sum, ic) => sum + ic.flow, 0)
    );

    // Calculate percentages for generation mix
    const generationmix: GenerationMix[] = generationData.map(item => ({
      fuel: fuelTypeMapping[item.fuelType] || 'other',
      mw: Math.max(0, item.generation),
      perc: (Math.max(0, item.generation) / totalGeneration) * 100,
    }));

    // Aggregate same fuel types
    const aggregatedMix = aggregateFuelTypes(generationmix);

    // Get the latest timestamp
    const latestTime = latestData[0]?.startTime || new Date().toISOString();

    // Carbon intensity estimation
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
      interconnectors,
      totalGeneration,
      totalImports,
      totalExports,
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
    if (!latestByType[item.fuelType] ||
        new Date(item.startTime) > new Date(latestByType[item.fuelType].startTime)) {
      latestByType[item.fuelType] = item;
    }
  });

  return Object.values(latestByType);
}

// Aggregate fuel types (combine different gas types, etc.)
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

  return Object.values(aggregated).filter(item => item.mw > 0);
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
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return 0;
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

    const imports_perc = (gridData.totalImports / gridData.totalGeneration) * 100;

    const low_carbon_perc = renewable_perc + nuclear_perc;

    return {
      demand,
      frequency: 50.0,
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

// Fetch historical generation data
export async function getHistoricalGeneration(hours: number = 24): Promise<HistoricalData[]> {
  try {
    const now = new Date();
    const from = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const response = await fetch(
      `${BMRS_API_BASE}/datasets/FUELHH?from=${from.toISOString()}&to=${now.toISOString()}&format=json`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return [];
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
function groupBySettlementPeriod(data: any[]): any[] {
  const grouped: Record<string, any[]> = {};

  data.forEach(item => {
    const key = `${item.settlementDate}_${item.settlementPeriod}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  return Object.entries(grouped).map(([key, items]) => {
    const genItems = items.filter(item =>
      !item.fuelType.startsWith('INT') &&
      fuelTypeMapping[item.fuelType]
    );

    const totalGen = genItems.reduce((sum, item) => sum + Math.max(0, item.generation), 0);

    const mix = genItems.map(item => ({
      fuel: fuelTypeMapping[item.fuelType] || 'other',
      mw: Math.max(0, item.generation),
      perc: (Math.max(0, item.generation) / totalGen) * 100,
    }));

    const aggregated = aggregateFuelTypes(mix);
    const intensity = estimateCarbonIntensity(aggregated);

    return {
      startTime: items[0].startTime,
      intensity,
    };
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

// Fetch forecast
export async function getIntensityForecast(hours: number = 24): Promise<HistoricalData[]> {
  return getHistoricalGeneration(hours);
}

// Fetch historical intensity data
export async function getHistoricalIntensity(hours: number = 24): Promise<HistoricalData[]> {
  return getHistoricalGeneration(hours);
}

// Helper: Format fuel names for display
export function formatFuelName(fuel: string): string {
  const fuelNames: Record<string, string> = {
    'biomass': 'Biomass',
    'coal': 'Coal',
    'oil': 'Oil',
    'gas': 'Gas',
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
