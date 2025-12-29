// Energy data types (matching web app schema)

export interface EnergyMix {
  wind: number;
  solar: number;
  nuclear: number;
  gas: number;
  coal: number;
  hydro: number;
  biomass: number;
  imports: number;
  other: number;
}

export interface RegionalData {
  england: EnergyMix;
  scotland: EnergyMix;
  wales: EnergyMix;
}

export interface SystemStatus {
  frequency: number;
  reserveMargin: number;
  netImports: number;
}

export interface EnergyData {
  id: number;
  timestamp: string;
  totalDemand: number;
  carbonIntensity: number;
  frequency: number;
  energyMix: EnergyMix;
  regionalData?: RegionalData;
  systemStatus?: SystemStatus;
}

export interface CarbonForecastPeriod {
  timestamp: string;
  forecast: number;
}

export interface CleanestPeriod {
  start_time: string;
  end_time: string;
  avg_intensity: number;
  duration_hours: number;
}

export interface CarbonForecast {
  forecast: CarbonForecastPeriod[];
  cleanest_periods: CleanestPeriod[];
}

export interface InterconnectorFlow {
  name: string;
  code: string;
  flow: number;
  capacity: number;
  direction: 'import' | 'export';
}

// Interconnector country mappings
export const INTERCONNECTOR_COUNTRIES: Record<string, string> = {
  INTFR: 'France',
  INTIRL: 'Ireland',
  INTNED: 'Netherlands',
  INTBEL: 'Belgium',
  INTNOR: 'Norway',
  INTEW: 'Ireland',
  INTNEM: 'Belgium',
  INTELEC: 'France',
  INTVKL: 'Denmark',
  INTNSL: 'Norway',
  INTGRNL: 'Ireland',
  INTIFA2: 'France',
};

// Interconnector capacities in MW
export const INTERCONNECTOR_CAPACITIES: Record<string, number> = {
  INTFR: 2000,
  INTIRL: 500,
  INTNED: 1000,
  INTBEL: 1000,
  INTNOR: 1400,
  INTEW: 500,
  INTNEM: 1000,
  INTELEC: 1000,
  INTVKL: 1400,
  INTNSL: 1400,
  INTGRNL: 500,
  INTIFA2: 1000,
};

// Country flag emojis
export const COUNTRY_FLAGS: Record<string, string> = {
  France: '🇫🇷',
  Ireland: '🇮🇪',
  Netherlands: '🇳🇱',
  Belgium: '🇧🇪',
  Norway: '🇳🇴',
  Denmark: '🇩🇰',
};

export interface RenewableProject {
  id: string;
  projectName: string;
  technologyType: string;
  installedCapacity: number;
  developmentStatus: string;
  region: string;
  country?: string;
  address?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  developerName?: string;
  planningAuthority?: string;
  liveGeneration?: {
    currentOutput: number;
    capacityFactor: number;
    lastUpdated: string;
    status: string;
    dailyOutput?: number;
    monthlyOutput?: number;
    annualOutput?: number;
  };
}
