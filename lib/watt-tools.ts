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
  getPriceHistory,
  getConditionsHistory,
  calculateGridHealthScore,
  type HistoricalPricePoint,
  type ConditionsPoint,
} from './api';
import { getAllInsights, getInsightBySlug } from './posts';
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

function summarizePriceHistory(points: HistoricalPricePoint[]) {
  if (points.length === 0) {
    return { average: null, min: null, max: null, count: 0 };
  }

  const min = points.reduce((a, b) => (b.price < a.price ? b : a));
  const max = points.reduce((a, b) => (b.price > a.price ? b : a));
  const average = Math.round(points.reduce((sum, p) => sum + p.price, 0) / points.length);

  return {
    average,
    min: min.price,
    min_time: min.from,
    max: max.price,
    max_time: max.from,
    count: points.length,
  };
}

// Price (MID) and generation-mix (FUELHH) settlement periods both come from
// BMRS and line up on the same half-hourly grid, but FUELHH's "from"/"to"
// range is unreliable — it silently truncates to roughly its most recent 12
// hours regardless of how far back "from" asks. So a price peak outside that
// window has no real match, and returning the nearest one anyway would wrongly
// present a several-hour-old snapshot as "conditions at the peak". Require the
// match to fall within one settlement period (or a small allowance for the two
// feeds updating a few minutes apart) and return null otherwise.
const CONDITIONS_MATCH_TOLERANCE_MS = 45 * 60 * 1000;

function findNearestConditions(points: ConditionsPoint[], targetIso: string | null): ConditionsPoint | null {
  if (!targetIso || points.length === 0) return null;
  const targetMs = new Date(targetIso).getTime();
  const nearest = points.reduce((closest, p) => {
    const diff = Math.abs(new Date(p.from).getTime() - targetMs);
    const closestDiff = Math.abs(new Date(closest.from).getTime() - targetMs);
    return diff < closestDiff ? p : closest;
  });
  if (Math.abs(new Date(nearest.from).getTime() - targetMs) > CONDITIONS_MATCH_TOLERANCE_MS) return null;
  return nearest;
}

// Forecast points are half-hourly settlement periods, so a "window" is just a
// run of consecutive slots. Slides a fixed-width window across the forecast and
// returns the run with the lowest mean intensity — the actual answer to "when
// should I run my dishwasher / charge the car", which callers previously had to
// guess at from a min/max summary.
function findCleanestWindow(
  points: Array<{ from: string; to: string; intensity: { forecast: number; actual: number } }>,
  durationHours: number
) {
  const slotsNeeded = Math.max(1, Math.round(durationHours * 2));
  const now = Date.now();

  // Only consider windows that haven't started yet; recommending a slot that
  // began an hour ago is worse than saying nothing.
  const upcoming = points
    .filter((p) => new Date(p.to).getTime() > now)
    .filter((p) => typeof p.intensity.forecast === 'number' && !Number.isNaN(p.intensity.forecast));

  if (upcoming.length < slotsNeeded) return null;

  let best: { startIndex: number; mean: number } | null = null;
  let sum = 0;

  for (let i = 0; i < upcoming.length; i++) {
    sum += upcoming[i].intensity.forecast;
    if (i >= slotsNeeded) sum -= upcoming[i - slotsNeeded].intensity.forecast;
    if (i >= slotsNeeded - 1) {
      const mean = sum / slotsNeeded;
      if (!best || mean < best.mean) best = { startIndex: i - slotsNeeded + 1, mean };
    }
  }

  if (!best) return null;

  const startSlot = upcoming[best.startIndex];
  const endSlot = upcoming[best.startIndex + slotsNeeded - 1];
  const horizonMean =
    upcoming.reduce((acc, p) => acc + p.intensity.forecast, 0) / upcoming.length;

  return {
    starts_at: startSlot.from,
    ends_at: endSlot.to,
    duration_hours: slotsNeeded / 2,
    avg_intensity_gco2kwh: Math.round(best.mean),
    horizon_avg_gco2kwh: Math.round(horizonMean),
    // Signed so the model can say "23% cleaner than average" without doing arithmetic.
    pct_cleaner_than_average:
      horizonMean > 0 ? Math.round(((horizonMean - best.mean) / horizonMean) * 100) : 0,
    basis: 'forecast',
    slots_considered: upcoming.length,
  };
}

// Without this, "best recipe for lasagne" matches every article: "for" clears
// the length filter and appears in nearly every title and excerpt, which counts
// as a strong hit and drags unrelated posts into the results.
const SEARCH_STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'was', 'but', 'not', 'you', 'all', 'can', 'has',
  'have', 'with', 'that', 'this', 'from', 'what', 'why', 'how', 'does', 'did',
  'will', 'its', 'their', 'there', 'when', 'who', 'out', 'get', 'got', 'any',
  'use', 'about', 'into', 'than', 'then', 'they', 'them', 'been', 'being',
  'much', 'many', 'more', 'most', 'some', 'such', 'over', 'under', 'between',
  'best', 'good', 'tell', 'give', 'know', 'like', 'want', 'need', 'make',
]);

function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !SEARCH_STOPWORDS.has(t));
}

interface ArticleMatch {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  url: string;
  score: number;
}

// Deliberately dumb keyword scoring — the corpus is a handful of posts, so a
// title hit beating a body hit is all the ranking this needs.
function scoreArticles(query: string): ArticleMatch[] {
  const terms = tokenizeQuery(query);

  if (terms.length === 0) return [];

  return getAllInsights()
    .map((post) => {
      const title = (post.title || '').toLowerCase();
      const tags = (post.tags || []).join(' ').toLowerCase();
      const excerpt = (post.excerpt || '').toLowerCase();
      const content = (post.content || '').toLowerCase();

      let score = 0;
      let matchedTerms = 0;
      let strongHit = false;

      for (const term of terms) {
        let termScore = 0;
        if (title.includes(term)) { termScore += 5; strongHit = true; }
        if (tags.includes(term)) { termScore += 3; strongHit = true; }
        if (excerpt.includes(term)) { termScore += 2; strongHit = true; }
        if (content.includes(term)) termScore += 1;
        if (termScore > 0) matchedTerms++;
        score += termScore;
      }

      return {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        date: post.date,
        url: `https://gridmix.co.uk/insights/${post.slug}`,
        score,
        matchedTerms,
        strongHit,
      };
    })
    // A single passing mention in the body is not a match — "nuclear fusion
    // tokamak" would otherwise return an article about gas prices because the
    // word "nuclear" appears in it once. Demand a title/tag/excerpt hit, or
    // that most of the query's terms turned up somewhere.
    .filter((m) => m.strongHit || m.matchedTerms >= Math.ceil(terms.length / 2))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ matchedTerms: _m, strongHit: _s, ...rest }) => rest);
}

// Posts run to ~13k characters. Watt answers in 1-3 sentences, so returning a
// whole article would cost a lot of context to say very little — return the
// passage around the best keyword hit instead.
function extractRelevantPassage(content: string, query: string, maxChars = 1800): string {
  if (content.length <= maxChars) return content;

  const terms = tokenizeQuery(query);
  const haystack = content.toLowerCase();

  let hit = -1;
  for (const term of terms) {
    const index = haystack.indexOf(term);
    if (index !== -1 && (hit === -1 || index < hit)) hit = index;
  }

  if (hit === -1) return content.slice(0, maxChars) + '…';

  const start = Math.max(0, hit - Math.floor(maxChars / 3));
  const passage = content.slice(start, start + maxChars);
  return (start > 0 ? '…' : '') + passage + (start + maxChars < content.length ? '…' : '');
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
        name: 'get_price_history',
        description:
          'Get the GB wholesale system price over the last N hours: its average, and the exact time it was highest and lowest — plus the generation mix and demand at the moment it peaked, so you can explain why. Use for "when was the price highest today/this week and why" style questions.',
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
      // Independent BMRS feeds (MID vs FUELHH) — fetch concurrently rather
      // than paying two round-trips back to back.
      const [priceHistory, conditions] = await Promise.all([
        getPriceHistory(hours),
        getConditionsHistory(hours),
      ]);

      if (priceHistory.length === 0) {
        return {
          data: { error: `No price data available for the last ${hours} hours.` },
          source: 'Elexon BMRS (MID, APXMIDP)',
          timestamp: new Date().toISOString(),
        };
      }

      const summary = summarizePriceHistory(priceHistory);
      const peakConditions = findNearestConditions(conditions, summary.max_time ?? null);

      return {
        data: {
          hours_covered: hours,
          ...summary,
          conditions_at_peak: peakConditions
            ? {
                time: peakConditions.from,
                demand_mw: peakConditions.demand_mw,
                carbon_intensity_gco2kwh: peakConditions.carbon_intensity_gco2kwh,
                mix_pct: peakConditions.mix
                  .map((m) => ({ fuel: m.fuel, pct: Math.round(m.perc) }))
                  .sort((a, b) => b.pct - a.pct),
              }
            : {
                error:
                  'Generation-mix data is not available that far back for this window — only the most recent few hours are covered. Do not guess a cause for the peak; report the price figures only.',
              },
        },
        source: 'Elexon BMRS (MID for price, FUELHH for generation mix/demand)',
        timestamp: priceHistory[priceHistory.length - 1].from,
      };
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
          'Find the highest or lowest value of a metric across GridMix\'s historical archive (2000-2025). Returns the rest of that period\'s generation mix, demand and any recorded notes alongside the value, so you can explain why the record happened, not just when. Use for "when was renewable share highest ever" or "what was the lowest carbon intensity on record" style questions.',
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

      let best:
        | { period: string; value: number; entry: AnnualElectricitySummary | MonthlyElectricityData }
        | null = null;

      if (scope === 'annual') {
        for (const entry of dataset.annual_summary) {
          const value = getAnnualMetric(entry, metric);
          if (value === null || value === undefined) continue;
          if (!best || (direction === 'highest' ? value > best.value : value < best.value)) {
            best = { period: String(entry.year), value, entry };
          }
        }
      } else {
        for (const entry of dataset.monthly_data) {
          const value = getMonthlyMetric(entry, metric);
          if (value === null || value === undefined) continue;
          if (!best || (direction === 'highest' ? value > best.value : value < best.value)) {
            best = { period: `${entry.year}-${String(entry.month).padStart(2, '0')}`, value, entry };
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

      // The rest of the record period's mix/demand — not just the one metric
      // that was searched for — is what actually lets the model explain *why*
      // a record happened (e.g. a price record alongside a high gas share and
      // near-peak demand) rather than just reporting the number.
      const context =
        scope === 'annual'
          ? (() => {
              const e = best!.entry as AnnualElectricitySummary;
              return {
                renewable_pct: e.renewable_pct,
                wind_pct: e.wind_pct,
                solar_pct: e.solar_pct,
                nuclear_pct: e.nuclear_pct,
                gas_pct: e.gas_pct,
                coal_pct: e.coal_pct,
                carbon_intensity_gco2kwh: e.carbon_intensity_gco2kwh,
                peak_demand_gw: e.peak_demand_gw,
                avg_price_gbp_mwh: e.avg_price_gbp_mwh,
              };
            })()
          : (() => {
              const e = best!.entry as MonthlyElectricityData;
              return {
                renewable_pct: e.generation.renewable_pct,
                wind_pct: e.generation.wind_pct,
                solar_pct: e.generation.solar_pct,
                nuclear_pct: e.generation.nuclear_pct,
                gas_pct: e.generation.gas_pct,
                coal_pct: e.generation.coal_pct,
                carbon_intensity_gco2kwh: e.carbon_intensity_gco2kwh,
                peak_demand_gw: e.demand.peak_gw,
                avg_price_gbp_mwh: e.price.avg_gbp_mwh,
                notes: e.notes,
              };
            })();

      return {
        data: {
          metric,
          direction,
          scope,
          period: best.period,
          value: best.value,
          data_quality: scope === 'monthly' ? (best.entry as MonthlyElectricityData).data_quality : undefined,
          context,
        },
        source: 'GridMix historical archive (GOV.UK / NESO / DESNZ Energy Trends)',
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'find_cleanest_window',
        description:
          'Find the upcoming time window with the lowest average carbon intensity, for "when should I charge my EV / run the washing machine / is now a good time" questions. Returns the start and end time of the best window and how much cleaner it is than the average over the period looked at. These are forecast values, not measurements.',
        parameters: {
          type: 'object',
          properties: {
            duration_hours: {
              type: 'number',
              description: 'How long the appliance/charge needs to run, in hours (0.5-12). Defaults to 2.',
            },
            within_hours: {
              type: 'integer',
              description: 'How far ahead to look for the window (1-48). Defaults to 24.',
            },
          },
          required: [],
        },
      },
    },
    execute: async (args) => {
      const rawDuration = typeof args.duration_hours === 'number'
        ? args.duration_hours
        : parseFloat(String(args.duration_hours));
      const durationHours = Number.isFinite(rawDuration)
        ? Math.min(12, Math.max(0.5, rawDuration))
        : 2;
      const withinHours = Math.min(48, clampHours(args.within_hours, 24));

      const forecast = await getIntensityForecast(withinHours);
      const window = findCleanestWindow(forecast, durationHours);

      if (!window) {
        return {
          data: {
            error: `No forecast available covering a ${durationHours}-hour window in the next ${withinHours} hours.`,
          },
          source: 'NESO Carbon Intensity forecast',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        data: { searched_ahead_hours: withinHours, ...window },
        source: 'NESO Carbon Intensity forecast (api.carbonintensity.org.uk)',
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'search_articles',
        description:
          "Search GridMix's own published explainer and analysis articles. Use this for background/conceptual questions that live data can't answer — what grid frequency is, why prices follow gas, how interconnectors work — and for pointing the user at further reading. Returns titles, summaries and URLs; call get_article to read one.",
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Keywords describing the topic, e.g. "grid frequency" or "interconnectors".',
            },
            limit: {
              type: 'integer',
              description: 'How many articles to return (1-5). Defaults to 3.',
            },
          },
          required: ['query'],
        },
      },
    },
    execute: async (args) => {
      const query = typeof args.query === 'string' ? args.query : '';
      const rawLimit = typeof args.limit === 'number' ? args.limit : parseInt(String(args.limit), 10);
      const limit = Number.isFinite(rawLimit) ? Math.min(5, Math.max(1, rawLimit)) : 3;

      const matches = scoreArticles(query).slice(0, limit);

      return {
        data: matches.length > 0
          ? { query, results: matches.map(({ score: _score, ...m }) => m) }
          : { query, results: [], note: 'No GridMix article covers this topic.' },
        source: 'GridMix Insights',
        timestamp: new Date().toISOString(),
      };
    },
  },
  {
    definition: {
      type: 'function',
      function: {
        name: 'get_article',
        description:
          'Read the relevant part of one GridMix article, by slug (get slugs from search_articles). Use when a search result looks like it answers the question and you need the detail to summarise it accurately.',
        parameters: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'Article slug from search_articles.' },
            query: {
              type: 'string',
              description: "What you're looking for in the article — used to pick which passage to return.",
            },
          },
          required: ['slug'],
        },
      },
    },
    execute: async (args) => {
      const slug = typeof args.slug === 'string' ? args.slug.trim() : '';
      const query = typeof args.query === 'string' ? args.query : '';
      const post = slug ? getInsightBySlug(slug) : undefined;

      if (!post) {
        return {
          data: { error: `No GridMix article with slug "${slug}". Use search_articles to find valid slugs.` },
          source: 'GridMix Insights',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        data: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          author: post.author,
          date: post.date,
          url: `https://gridmix.co.uk/insights/${post.slug}`,
          extract: extractRelevantPassage(post.content || '', query),
        },
        source: `GridMix Insights — "${post.title}"`,
        timestamp: post.date,
      };
    },
  },
];
