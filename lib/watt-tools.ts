// Watt tool definitions — the only way Watt is allowed to learn anything.
// Each tool wraps a real GridMix data source and returns its result together
// with a source + timestamp so every answer can be cited. Watt must never
// answer from model knowledge alone; if no tool covers a question, it refuses.

import fs from 'fs';
import path from 'path';
import {
  getCurrentGridData,
  getGridStats,
  getHistoricalIntensity,
  getIntensityForecast,
  getCurrentFrequency,
  getCurrentSystemPrice,
  calculateGridHealthScore,
} from './api';
import type {
  HistoricalElectricityDataset,
  MonthlyElectricityData,
  AnnualElectricitySummary,
} from './historical-types';

const PVLIVE_API_BASE = 'https://api.pvlive.uk/pvlive/api/v4';
const HISTORICAL_DATA_PATH = path.join(
  process.cwd(),
  'data',
  'historical',
  'uk-electricity-2000-2026.json'
);

type RecordMetric =
  | 'renewable_pct'
  | 'wind_pct'
  | 'solar_pct'
  | 'nuclear_pct'
  | 'gas_pct'
  | 'coal_pct'
  | 'carbon_intensity_gco2kwh'
  | 'grid_health_index'
  | 'price'
  | 'demand';

let cachedDataset: HistoricalElectricityDataset | null | undefined;

// Loaded once per server instance and reused — this file only changes when
// the monthly report pipeline regenerates it, not per-request.
function loadHistoricalDataset(): HistoricalElectricityDataset | null {
  if (cachedDataset !== undefined) return cachedDataset;
  try {
    const raw = fs.readFileSync(HISTORICAL_DATA_PATH, 'utf-8');
    cachedDataset = JSON.parse(raw) as HistoricalElectricityDataset;
  } catch (error) {
    console.error('Watt: failed to load historical dataset', error);
    cachedDataset = null;
  }
  return cachedDataset;
}

function getAnnualMetric(entry: AnnualElectricitySummary, metric: RecordMetric): number | null {
  switch (metric) {
    case 'renewable_pct': return entry.renewable_pct;
    case 'wind_pct': return entry.wind_pct;
    case 'solar_pct': return entry.solar_pct;
    case 'nuclear_pct': return entry.nuclear_pct;
    case 'gas_pct': return entry.gas_pct;
    case 'coal_pct': return entry.coal_pct;
    case 'carbon_intensity_gco2kwh': return entry.carbon_intensity_gco2kwh;
    case 'grid_health_index': return entry.grid_health_index;
    case 'price': return entry.avg_price_gbp_mwh;
    case 'demand': return entry.peak_demand_gw;
    default: return null;
  }
}

function getMonthlyMetric(entry: MonthlyElectricityData, metric: RecordMetric): number | null {
  switch (metric) {
    case 'renewable_pct': return entry.generation.renewable_pct;
    case 'wind_pct': return entry.generation.wind_pct;
    case 'solar_pct': return entry.generation.solar_pct;
    case 'nuclear_pct': return entry.generation.nuclear_pct;
    case 'gas_pct': return entry.generation.gas_pct;
    case 'coal_pct': return entry.generation.coal_pct;
    case 'carbon_intensity_gco2kwh': return entry.carbon_intensity_gco2kwh;
    case 'grid_health_index': return entry.grid_health_index;
    case 'price': return entry.price.avg_gbp_mwh;
    case 'demand': return entry.demand.peak_gw;
    default: return null;
  }
}

export interface WattToolResult {
  data: unknown;
  source: string;
  timestamp: string;
}

export interface WattTool {
  definition: {
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  };
  execute: (args: Record<string, unknown>) => Promise<WattToolResult>;
}

interface SolarCurvePoint {
  datetime: string;
  generation_mw: number;
}

// Models reliably misread long raw arrays (e.g. claiming a daytime curve was
// "consistently 0 MW" when skimming 48 half-hourly points). Pre-computing the
// stats a question is likely to need keeps Watt's answers grounded in numbers
// it didn't have to eyeball.
function summarizeCurve(curve: SolarCurvePoint[]) {
  if (curve.length === 0) {
    return { peak_mw: 0, peak_time: null, latest_mw: 0, data_points: 0 };
  }
  const peak = curve.reduce((max, p) => (p.generation_mw > max.generation_mw ? p : max));
  return {
    peak_mw: Math.round(peak.generation_mw),
    peak_time: peak.datetime,
    latest_mw: Math.round(curve[curve.length - 1].generation_mw),
    data_points: curve.length,
  };
}

function summarizeIntensity(points: Array<{ from: string; intensity: { actual?: number; forecast: number } }>) {
  const withValue = points
    .map((p) => ({ from: p.from, value: p.intensity.actual ?? p.intensity.forecast }))
    .filter((p) => typeof p.value === 'number' && !Number.isNaN(p.value));

  if (withValue.length === 0) {
    return { average: null, min: null, max: null, count: 0 };
  }

  const min = withValue.reduce((a, b) => (b.value < a.value ? b : a));
  const max = withValue.reduce((a, b) => (b.value > a.value ? b : a));
  const average = Math.round(withValue.reduce((sum, p) => sum + p.value, 0) / withValue.length);

  return {
    average,
    min: min.value,
    min_time: min.from,
    max: max.value,
    max_time: max.from,
    count: withValue.length,
  };
}

function clampHours(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(168, Math.max(1, Math.round(n)));
}

// lib/api.ts's solar functions hit relative proxy paths ("/api/solar/current")
// which only resolve in the browser. Watt runs server-side, so it talks to
// Sheffield Solar PVLive directly here instead — same data, same shape.
async function fetchPVLive(params: string): Promise<any[]> {
  const response = await fetch(`${PVLIVE_API_BASE}/gsp/0?${params}`, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'GridMix/1.0 (https://gridmix.co.uk)',
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`PVLive API responded with status ${response.status}`);
  }
  const json = await response.json();
  return json.data || [];
}

export const wattTools: WattTool[] = [
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_current_mix',
        description:
          'Get the live UK electricity generation mix right now: fuel breakdown (wind, gas, nuclear, biomass, hydro, etc.) in MW and %, carbon intensity, and interconnector import/export flows.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    execute: async () => {
      const grid = await getCurrentGridData();
      return { data: grid, source: 'Elexon BMRS (FUELINST)', timestamp: grid.to };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_stats',
        description:
          'Get current summary statistics: renewable %, fossil %, nuclear %, low-carbon %, and demand. Use this for "what % is renewable/green right now" style questions.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    execute: async () => {
      const stats = await getGridStats();
      return { data: stats, source: 'Elexon BMRS (derived)', timestamp: new Date().toISOString() };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_intensity_history',
        description:
          'Get carbon intensity (gCO2/kWh) for each settlement period over the last N hours. Use for "how has carbon intensity changed today/recently" style questions.',
        parameters: {
          type: 'object',
          properties: {
            hours: {
              type: 'integer',
              description: 'How many hours of history to return (1-168). Defaults to 24.',
            },
          },
          required: [],
        },
      },
    },
    execute: async (args) => {
      const hours = clampHours(args.hours, 24);
      const history = await getHistoricalIntensity(hours);
      return {
        data: { hours_covered: hours, ...summarizeIntensity(history) },
        source: 'Elexon BMRS (FUELHH)',
        timestamp: history[history.length - 1]?.from || new Date().toISOString(),
      };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_intensity_forecast',
        description:
          'Get the carbon intensity outlook for the next N hours. Use for "is it a good time to charge later" or "what will carbon intensity look like tonight" style questions.',
        parameters: {
          type: 'object',
          properties: {
            hours: {
              type: 'integer',
              description: 'How many hours ahead to look (1-168). Defaults to 48.',
            },
          },
          required: [],
        },
      },
    },
    execute: async (args) => {
      const hours = clampHours(args.hours, 48);
      const forecast = await getIntensityForecast(hours);
      return {
        data: { hours_covered: hours, ...summarizeIntensity(forecast) },
        source: 'Elexon BMRS (FUELHH)',
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_solar',
        description:
          'Get UK solar generation data. period="current" gives the live snapshot, "today" gives today\'s intraday curve so far, "yesterday" gives yesterday\'s full curve for comparison.',
        parameters: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['current', 'today', 'yesterday'],
              description: 'Which solar window to fetch. Defaults to "current".',
            },
          },
          required: [],
        },
      },
    },
    execute: async (args) => {
      const period = (args.period as string) || 'current';

      if (period === 'today') {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const rows = await fetchPVLive(
          `start=${start.toISOString().split('.')[0]}&extra_fields=capacity_mwp`
        );
        const curve = rows.map((r) => ({ datetime: r[1], generation_mw: r[2] || 0 })).reverse();
        return {
          data: summarizeCurve(curve),
          source: "Sheffield Solar PVLive (today's curve, summarized)",
          timestamp: new Date().toISOString(),
        };
      }

      if (period === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const rows = await fetchPVLive(
          `start=${start.toISOString().split('.')[0]}&end=${end.toISOString().split('.')[0]}&extra_fields=capacity_mwp`
        );
        const curve = rows.map((r) => ({ datetime: r[1], generation_mw: r[2] || 0 })).reverse();
        return {
          data: summarizeCurve(curve),
          source: "Sheffield Solar PVLive (yesterday's curve, summarized)",
          timestamp: new Date().toISOString(),
        };
      }

      const rows = await fetchPVLive('extra_fields=capacity_mwp');
      const latest = rows[0];
      if (!latest) {
        return {
          data: { generation_mw: 0, capacity_percent: 0 },
          source: 'Sheffield Solar PVLive',
          timestamp: new Date().toISOString(),
        };
      }
      const installedCapacityMW = latest[3] || 20200;
      return {
        data: {
          generation_mw: latest[2] || 0,
          capacity_percent: Math.min(((latest[2] || 0) / installedCapacityMW) * 100, 100),
          installed_capacity_mw: installedCapacityMW,
        },
        source: 'Sheffield Solar PVLive',
        timestamp: latest[1],
      };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_frequency',
        description:
          'Get the current grid frequency in Hz and its stability status (stable/warning/critical). Use for grid-stability questions.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    execute: async () => {
      const freq = await getCurrentFrequency();
      return { data: freq, source: 'Elexon BMRS (FREQ)', timestamp: freq.datetime };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_price',
        description:
          'Get the current GB wholesale system electricity price in GBP/MWh. Use for price-related questions.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    execute: async () => {
      const price = await getCurrentSystemPrice();
      return { data: price, source: 'Elexon BMRS (MID, APXMIDP)', timestamp: price.datetime };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_health_score',
        description:
          'Get GridMix\'s composite Grid Health Score (0-100, with a letter grade) combining frequency stability, carbon intensity, and renewable share right now.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    execute: async () => {
      const [grid, freq, stats] = await Promise.all([
        getCurrentGridData(),
        getCurrentFrequency(),
        getGridStats(),
      ]);
      const intensity = grid.intensity.actual || grid.intensity.forecast;
      const score = calculateGridHealthScore(freq.frequency, intensity, stats.renewable_perc);
      return { data: score, source: 'GridMix composite score (Elexon BMRS)', timestamp: grid.to };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_historical_year',
        description:
          'Get the annual summary (renewable %, prices, demand, carbon intensity) for a single calendar year. Dataset covers 2000-2025. Use for "what was the grid like in <year>" style questions.',
        parameters: {
          type: 'object',
          properties: {
            year: { type: 'integer', description: 'Calendar year, e.g. 2015.' },
          },
          required: ['year'],
        },
      },
    },
    execute: async (args) => {
      const dataset = loadHistoricalDataset();
      if (!dataset) {
        return {
          data: { error: 'Historical archive is unavailable right now.' },
          source: 'GridMix historical archive',
          timestamp: new Date().toISOString(),
        };
      }
      const year = typeof args.year === 'number' ? args.year : parseInt(String(args.year), 10);
      const entry = dataset.annual_summary.find((e) => e.year === year);
      return {
        data: entry || { error: `No annual data for ${year}. Dataset covers ${dataset.metadata.period.start} to ${dataset.metadata.period.end}.` },
        source: 'GridMix historical archive (GOV.UK / NESO / DESNZ Energy Trends)',
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_historical_month',
        description:
          'Get the monthly snapshot (renewable %, prices, demand, carbon intensity) for a specific year and month. Dataset covers 2000-01 through 2025. Use for "what was it like in March 2015" style questions.',
        parameters: {
          type: 'object',
          properties: {
            year: { type: 'integer', description: 'Calendar year, e.g. 2015.' },
            month: { type: 'integer', description: 'Month number, 1-12.' },
          },
          required: ['year', 'month'],
        },
      },
    },
    execute: async (args) => {
      const dataset = loadHistoricalDataset();
      if (!dataset) {
        return {
          data: { error: 'Historical archive is unavailable right now.' },
          source: 'GridMix historical archive',
          timestamp: new Date().toISOString(),
        };
      }
      const year = typeof args.year === 'number' ? args.year : parseInt(String(args.year), 10);
      const month = Math.min(12, Math.max(1, typeof args.month === 'number' ? args.month : parseInt(String(args.month), 10)));
      const entry = dataset.monthly_data.find((e) => e.year === year && e.month === month);
      return {
        data: entry || { error: `No monthly data for ${year}-${month}. Dataset covers ${dataset.metadata.period.start} to ${dataset.metadata.period.end}.` },
        source: 'GridMix historical archive (GOV.UK / NESO / DESNZ Energy Trends)',
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_historical_record',
        description:
          'Find the highest or lowest value of a metric across GridMix\'s historical archive (2000-2025). Use for "when was renewable share highest ever" or "what was the lowest carbon intensity on record" style questions.',
        parameters: {
          type: 'object',
          properties: {
            metric: {
              type: 'string',
              enum: ['renewable_pct', 'wind_pct', 'solar_pct', 'nuclear_pct', 'gas_pct', 'coal_pct', 'carbon_intensity_gco2kwh', 'grid_health_index', 'price', 'demand'],
              description: 'Which metric to find a record for. Defaults to renewable_pct.',
            },
            direction: {
              type: 'string',
              enum: ['highest', 'lowest'],
              description: 'Find the highest or lowest value. Defaults to highest.',
            },
            scope: {
              type: 'string',
              enum: ['monthly', 'annual'],
              description: 'Search month-by-month (more precise) or year-by-year (smoother trend). Defaults to monthly.',
            },
          },
          required: [],
        },
      },
    },
    execute: async (args) => {
      const dataset = loadHistoricalDataset();
      if (!dataset) {
        return {
          data: { error: 'Historical archive is unavailable right now.' },
          source: 'GridMix historical archive',
          timestamp: new Date().toISOString(),
        };
      }

      const metric = (args.metric as RecordMetric) || 'renewable_pct';
      const direction = args.direction === 'lowest' ? 'lowest' : 'highest';
      const scope = args.scope === 'annual' ? 'annual' : 'monthly';

      let best: { period: string; value: number; data_quality?: string } | null = null;

      if (scope === 'annual') {
        for (const entry of dataset.annual_summary) {
          const value = getAnnualMetric(entry, metric);
          if (value === null || value === undefined) continue;
          if (!best || (direction === 'highest' ? value > best.value : value < best.value)) {
            best = { period: String(entry.year), value };
          }
        }
      } else {
        for (const entry of dataset.monthly_data) {
          const value = getMonthlyMetric(entry, metric);
          if (value === null || value === undefined) continue;
          if (!best || (direction === 'highest' ? value > best.value : value < best.value)) {
            best = { period: `${entry.year}-${String(entry.month).padStart(2, '0')}`, value, data_quality: entry.data_quality };
          }
        }
      }

      if (!best) {
        return {
          data: { error: `No data available for ${metric}.` },
          source: 'GridMix historical archive',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        data: { metric, direction, scope, ...best },
        source: 'GridMix historical archive (GOV.UK / NESO / DESNZ Energy Trends)',
        timestamp: new Date().toISOString(),
      };
    },
  },
];
