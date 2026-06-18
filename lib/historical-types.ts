/**
 * Types for UK Electricity Historical Data
 * Data covers 2000-2025 from GOV.UK, NESO, and Energy Trends sources
 */

// Monthly data point for electricity metrics
export interface MonthlyElectricityData {
  year: number;
  month: number;

  // Price data
  price: {
    avg_gbp_mwh: number | null;
    peak_gbp_mwh: number | null;
    min_gbp_mwh: number | null;
  };

  // Demand data
  demand: {
    avg_gw: number | null;
    peak_gw: number | null;
    min_gw: number | null;
    total_twh: number | null;
  };

  // Generation mix (percentages)
  generation: {
    renewable_pct: number | null;
    wind_pct: number | null;
    solar_pct: number | null;
    hydro_pct: number | null;
    biomass_pct: number | null;
    nuclear_pct: number | null;
    gas_pct: number | null;
    coal_pct: number | null;
    other_pct: number | null;
    imports_pct: number | null;
  };

  // Absolute generation values
  generation_twh: {
    total: number | null;
    renewable: number | null;
    wind: number | null;
    solar: number | null;
    nuclear: number | null;
    gas: number | null;
    coal: number | null;
  };

  // Environmental metrics
  carbon_intensity_gco2kwh: number | null;

  // Composite health score (0-100)
  grid_health_index: number | null;

  // Data quality indicator
  data_quality: 'complete' | 'partial' | 'estimated' | 'interpolated';

  // Notes for anomalies or special events
  notes?: string;
}

// Annual summary
export interface AnnualElectricitySummary {
  year: number;
  avg_price_gbp_mwh: number | null;
  total_demand_twh: number | null;
  peak_demand_gw: number | null;
  renewable_pct: number | null;
  wind_pct: number | null;
  solar_pct: number | null;
  nuclear_pct: number | null;
  gas_pct: number | null;
  coal_pct: number | null;
  carbon_intensity_gco2kwh: number | null;
  grid_health_index: number | null;
}

// Full dataset structure
export interface HistoricalElectricityDataset {
  metadata: {
    generated_at: string;
    version: string;
    sources: DataSource[];
    period: {
      start: string; // YYYY-MM format
      end: string;   // YYYY-MM format
    };
    notes: string[];
  };
  monthly_data: MonthlyElectricityData[];
  annual_summary: AnnualElectricitySummary[];
}

// Data source tracking
export interface DataSource {
  name: string;
  url: string;
  last_updated: string;
  coverage: string;
  notes?: string;
}

// Raw data structures for parsing

// GOV.UK Historical Electricity Excel structure
export interface GovUKElectricityRow {
  year: number;
  coal_twh?: number;
  oil_twh?: number;
  gas_twh?: number;
  nuclear_twh?: number;
  hydro_twh?: number;
  wind_solar_twh?: number;
  other_twh?: number;
  total_twh?: number;
  imports_twh?: number;
  exports_twh?: number;
}

// NESO Demand CSV structure (half-hourly)
export interface NESODemandRow {
  settlement_date: string;
  settlement_period: number;
  nd: number; // National demand (MW)
  tsd: number; // Transmission system demand (MW)
  england_wales_demand?: number;
  embedded_wind?: number;
  embedded_solar?: number;
}

// Energy Trends structure for renewable generation
export interface EnergyTrendsRow {
  quarter?: string;
  year: number;
  month?: number;
  wind_onshore_gwh?: number;
  wind_offshore_gwh?: number;
  solar_gwh?: number;
  hydro_gwh?: number;
  biomass_gwh?: number;
  total_renewable_gwh?: number;
}

// Carbon intensity factors (gCO2/kWh) by fuel type
export const CARBON_INTENSITY_FACTORS: Record<string, number> = {
  coal: 937,
  gas: 394,
  oil: 935,
  nuclear: 0,
  wind: 0,
  solar: 0,
  hydro: 0,
  biomass: 120, // Lifecycle average
  imports: 200, // UK average for interconnector mix
  other: 300,
};

// Grid health calculation weights
export const GRID_HEALTH_WEIGHTS = {
  renewable_score: 0.4,    // Higher renewable % = higher score
  diversity_score: 0.3,    // Shannon diversity index
  margin_score: 0.3,       // Capacity headroom
};

// CSV output column order
export const CSV_COLUMNS = [
  'year',
  'month',
  'avg_system_price_gbp_mwh',
  'peak_price_gbp_mwh',
  'avg_demand_gw',
  'peak_demand_gw',
  'total_demand_twh',
  'renewable_generation_twh',
  'renewable_pct',
  'wind_pct',
  'solar_pct',
  'hydro_pct',
  'biomass_pct',
  'nuclear_pct',
  'gas_pct',
  'coal_pct',
  'other_pct',
  'imports_pct',
  'carbon_intensity_gco2kwh',
  'grid_health_index',
  'data_quality',
  'notes',
] as const;

export type CSVColumn = typeof CSV_COLUMNS[number];
