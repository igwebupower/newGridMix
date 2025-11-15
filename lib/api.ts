// GridMix API Integration Layer
// Integrates with BMRS (Balancing Mechanism Reporting Service) Elexon API
// and Sheffield Solar PVLive for accurate solar data

const BMRS_API_BASE = 'https://data.elexon.co.uk/bmrs/api/v1';
const PVLIVE_API_BASE = 'https://api0.solar.sheffield.ac.uk/pvlive/api/v4';

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
    index?: string;
  };
  demand?: number;
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

export interface SolarData {
  generation_mw: number;
  datetime: string;
  capacity_percent: number;
  installed_capacity_mw?: number;
}

export interface SolarIntradayData {
  datetime: string;
  generation_mw: number;
}

export interface FrequencyData {
  frequency: number;
  datetime: string;
  status: 'stable' | 'warning' | 'critical';
}

export interface SystemPriceData {
  price: number;
  datetime: string;
}

export interface GridHealthScore {
  score: number;
  grade: string;
  factors: {
    frequency: number;
    carbon: number;
    renewable: number;
  };
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

// ============================================
// Sheffield Solar PVLive API Functions
// ============================================

// Fetch current solar generation (national)
export async function getCurrentSolarData(): Promise<SolarData> {
  try {
    // Directly fetch from Sheffield Solar API (server-side)
    const response = await fetch(
      'https://api0.solar.sheffield.ac.uk/pvlive/v3/gsp/0?extra_fields=capacity_mwp',
      {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch solar data');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return {
        generation_mw: 0,
        datetime: new Date().toISOString(),
        capacity_percent: 0,
      };
    }

    // Latest data point: [gsp_id, datetime, generation_mw]
    const latest = data.data[0];

    // Estimate installed capacity (GB has ~15-16 GW of solar capacity as of 2024)
    const estimatedCapacityMW = 16000;
    const capacityPercent = (latest[2] / estimatedCapacityMW) * 100;

    return {
      generation_mw: latest[2] || 0,
      datetime: latest[1],
      capacity_percent: Math.min(capacityPercent, 100),
      installed_capacity_mw: estimatedCapacityMW,
    };
  } catch (error) {
    console.error('Error fetching solar data:', error);
    return {
      generation_mw: 0,
      datetime: new Date().toISOString(),
      capacity_percent: 0,
    };
  }
}

// Fetch today's solar generation curve (intraday)
export async function getTodaySolarCurve(): Promise<SolarIntradayData[]> {
  try {
    // Directly fetch from Sheffield Solar API (server-side)
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://api0.solar.sheffield.ac.uk/pvlive/v3/gsp/0?start=${today}T00:00:00&extra_fields=capacity_mwp`,
      {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch intraday solar data');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Convert to our format and reverse (API returns newest first)
    return data.data
      .map((item: any) => ({
        datetime: item[1],
        generation_mw: item[2] || 0,
      }))
      .reverse();
  } catch (error) {
    console.error('Error fetching intraday solar data:', error);
    return [];
  }
}

// Fetch yesterday's solar curve for comparison
export async function getYesterdaySolarCurve(): Promise<SolarIntradayData[]> {
  try {
    // Use proxy route to bypass CORS restrictions
    const response = await fetch('/api/solar/yesterday', {
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

    return data.data
      .map((item: any) => ({
        datetime: item[1],
        generation_mw: item[2] || 0,
      }))
      .reverse();
  } catch (error) {
    console.error('Error fetching yesterday solar data:', error);
    return [];
  }
}

// Helper: Get today's peak solar generation
export function getTodaysPeak(intradayData: SolarIntradayData[]): {
  peak_mw: number;
  peak_time: string;
} {
  if (!intradayData || intradayData.length === 0) {
    return { peak_mw: 0, peak_time: '' };
  }

  const peak = intradayData.reduce((max, item) =>
    item.generation_mw > max.generation_mw ? item : max
  );

  return {
    peak_mw: peak.generation_mw,
    peak_time: formatTimestamp(peak.datetime),
  };
}

// ============================================
// Grid Frequency and Advanced Metrics
// ============================================

// Fetch current grid frequency
export async function getCurrentFrequency(): Promise<FrequencyData> {
  try {
    const response = await fetch(
      `${BMRS_API_BASE}/datasets/FREQ?format=json`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch frequency data');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return {
        frequency: 50.0,
        datetime: new Date().toISOString(),
        status: 'stable',
      };
    }

    // Get the most recent frequency reading
    const latest = data.data[0];
    const freq = latest.frequency;

    // Determine status based on frequency deviation
    let status: 'stable' | 'warning' | 'critical';
    if (freq >= 49.8 && freq <= 50.2) {
      status = 'stable';
    } else if (freq >= 49.5 && freq <= 50.5) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    return {
      frequency: freq,
      datetime: latest.measurementTime,
      status,
    };
  } catch (error) {
    console.error('Error fetching frequency:', error);
    return {
      frequency: 50.0,
      datetime: new Date().toISOString(),
      status: 'stable',
    };
  }
}

// Calculate Grid Health Score (0-100)
export function calculateGridHealthScore(
  frequency: number,
  carbonIntensity: number,
  renewablePerc: number
): GridHealthScore {
  // Frequency score (0-40 points)
  // Perfect: 50.00 Hz = 40 points
  // Acceptable: 49.8-50.2 Hz = 30-40 points
  // Warning: 49.5-50.5 Hz = 10-30 points
  // Critical: outside = 0-10 points
  const freqDeviation = Math.abs(frequency - 50.0);
  let freqScore = 0;
  if (freqDeviation <= 0.02) {
    freqScore = 40;
  } else if (freqDeviation <= 0.2) {
    freqScore = 40 - (freqDeviation - 0.02) * 55.56; // Linear scale
  } else if (freqDeviation <= 0.5) {
    freqScore = 30 - (freqDeviation - 0.2) * 66.67;
  } else {
    freqScore = Math.max(0, 10 - freqDeviation * 2);
  }

  // Carbon score (0-30 points)
  // Excellent: <100 gCO2/kWh = 30 points
  // Good: 100-200 = 20-30 points
  // Fair: 200-300 = 10-20 points
  // Poor: >300 = 0-10 points
  let carbonScore = 0;
  if (carbonIntensity < 100) {
    carbonScore = 30;
  } else if (carbonIntensity < 200) {
    carbonScore = 30 - ((carbonIntensity - 100) / 100) * 10;
  } else if (carbonIntensity < 300) {
    carbonScore = 20 - ((carbonIntensity - 200) / 100) * 10;
  } else {
    carbonScore = Math.max(0, 10 - ((carbonIntensity - 300) / 100) * 2);
  }

  // Renewable score (0-30 points)
  // Excellent: >75% = 30 points
  // Good: 50-75% = 20-30 points
  // Fair: 25-50% = 10-20 points
  // Poor: <25% = 0-10 points
  let renewableScore = 0;
  if (renewablePerc > 75) {
    renewableScore = 30;
  } else if (renewablePerc > 50) {
    renewableScore = 20 + ((renewablePerc - 50) / 25) * 10;
  } else if (renewablePerc > 25) {
    renewableScore = 10 + ((renewablePerc - 25) / 25) * 10;
  } else {
    renewableScore = (renewablePerc / 25) * 10;
  }

  const totalScore = Math.round(freqScore + carbonScore + renewableScore);

  // Determine grade
  let grade = '';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 85) grade = 'A';
  else if (totalScore >= 80) grade = 'A-';
  else if (totalScore >= 75) grade = 'B+';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 65) grade = 'B-';
  else if (totalScore >= 60) grade = 'C+';
  else if (totalScore >= 55) grade = 'C';
  else if (totalScore >= 50) grade = 'C-';
  else if (totalScore >= 45) grade = 'D+';
  else if (totalScore >= 40) grade = 'D';
  else grade = 'F';

  return {
    score: totalScore,
    grade,
    factors: {
      frequency: Math.round(freqScore),
      carbon: Math.round(carbonScore),
      renewable: Math.round(renewableScore),
    },
  };
}

// Fetch current system price (Market Index Data - MID)
export async function getCurrentSystemPrice(): Promise<SystemPriceData> {
  try {
    // MID endpoint requires date range parameters
    // Get data from last 3 hours to ensure we have recent data
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const from = threeHoursAgo.toISOString();
    const to = now.toISOString();

    const response = await fetch(
      `${BMRS_API_BASE}/datasets/MID?from=${from}&to=${to}&format=json`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch system price data');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return {
        price: 0,
        datetime: new Date().toISOString(),
      };
    }

    // Filter for APXMIDP provider (N2EXMIDP is always 0)
    // and get the most recent price
    const apxData = data.data
      .filter((item: any) => item.dataProvider === 'APXMIDP' && item.price > 0)
      .sort((a: any, b: any) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

    if (apxData.length === 0) {
      return {
        price: 0,
        datetime: new Date().toISOString(),
      };
    }

    const latest = apxData[0];

    return {
      price: latest.price || 0,
      datetime: latest.startTime,
    };
  } catch (error) {
    console.error('Error fetching system price:', error);
    return {
      price: 0,
      datetime: new Date().toISOString(),
    };
  }
}
