// Data Aggregation Service for Automated Report Generation
// Collects and analyzes historical grid data for weekly/monthly reports

import { getHistoricalIntensity, getCurrentGridData } from './api';
import { DataSnapshot } from './types';
import fs from 'fs/promises';
import path from 'path';

const SNAPSHOTS_DIR = path.join(process.cwd(), 'data', 'snapshots');

// Ensure snapshots directory exists
async function ensureSnapshotsDir() {
  try {
    await fs.mkdir(SNAPSHOTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating snapshots directory:', error);
  }
}

// Helper functions for date calculations
function getLastWeekStart(): Date {
  const now = new Date();
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - now.getDay() - 6); // Last Monday
  lastMonday.setHours(0, 0, 0, 0);
  return lastMonday;
}

function getLastWeekEnd(): Date {
  const now = new Date();
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - now.getDay()); // Last Sunday
  lastSunday.setHours(23, 59, 59, 999);
  return lastSunday;
}

function getLastMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

function getLastMonthEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
}

// Calculate average from array of values
function calculateAvg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// Find peak value and timestamp
function findPeak(data: Array<{ value: number; timestamp: string }>): { value: number; timestamp: string } | undefined {
  if (data.length === 0) return undefined;
  return data.reduce((max, item) => (item.value > max.value ? item : max));
}

// Find lowest value and timestamp
function findLowest(data: Array<{ value: number; timestamp: string }>): { value: number; timestamp: string } | undefined {
  if (data.length === 0) return undefined;
  return data.reduce((min, item) => (item.value < min.value ? item : min));
}

// Detect anomalies and notable events
function detectNotableEvents(data: any[]): string[] {
  const events: string[] = [];

  // Check for record carbon intensity
  const carbonValues = data.map(d => d.intensity?.actual || 0);
  const minCarbon = Math.min(...carbonValues);
  const maxCarbon = Math.max(...carbonValues);

  if (minCarbon < 50) {
    events.push(`Record low carbon intensity: ${minCarbon}g CO2/kWh`);
  }

  if (maxCarbon > 400) {
    events.push(`High carbon intensity event: ${maxCarbon}g CO2/kWh`);
  }

  return events;
}

/**
 * Aggregates data for the past week
 * This is the main function called by the cron job
 */
export async function aggregateWeeklyData(): Promise<DataSnapshot> {
  const startDate = getLastWeekStart();
  const endDate = getLastWeekEnd();

  // Fetch 7 days of historical data (168 hours)
  const historicalData = await getHistoricalIntensity(168);

  // Extract metrics
  const carbonValues = historicalData
    .map(d => d.intensity?.actual || d.intensity?.forecast || 0)
    .filter(v => v > 0);

  const demandValues = historicalData
    .map(d => d.demand || 0)
    .filter(v => v > 0);

  // Calculate records
  const carbonData = historicalData.map(d => ({
    value: d.intensity?.actual || d.intensity?.forecast || 0,
    timestamp: d.from,
  }));

  const demandData = historicalData.map(d => ({
    value: d.demand || 0,
    timestamp: d.from,
  }));

  const lowestCarbon = findLowest(carbonData);
  const peakDemand = findPeak(demandData);

  // Get current grid data for renewable percentage calculation
  let renewablePerc = 0;
  try {
    const currentData = await getCurrentGridData();
    const renewableFuels = ['wind', 'solar', 'hydro'];
    const renewableMW = currentData.generationmix
      .filter(g => renewableFuels.includes(g.fuel.toLowerCase()))
      .reduce((sum, g) => sum + g.mw, 0);
    renewablePerc = (renewableMW / currentData.totalGeneration) * 100;
  } catch (error) {
    console.error('Error fetching current grid data:', error);
  }

  // Create snapshot
  const snapshot: DataSnapshot = {
    id: `weekly-${startDate.toISOString().split('T')[0]}`,
    period_start: startDate.toISOString(),
    period_end: endDate.toISOString(),
    type: 'weekly',
    summary: {
      avgCarbonIntensity: Math.round(calculateAvg(carbonValues)),
      peakRenewable: Math.round(renewablePerc),
      totalDemand: Math.round(demandValues.reduce((sum, v) => sum + v, 0)),
      avgFrequency: 50.0, // Will be populated when we have historical frequency data
      interconnectorFlow: 0, // Will be populated when we have interconnector history
    },
    records: {
      lowestCarbon,
      peakDemand,
    },
    notable_events: detectNotableEvents(historicalData),
    sources: [
      'Elexon BMRS',
      'Sheffield Solar PVLive',
    ],
    created_at: new Date().toISOString(),
  };

  return snapshot;
}

/**
 * Aggregates data for the past month
 */
export async function aggregateMonthlyData(): Promise<DataSnapshot> {
  const startDate = getLastMonthStart();
  const endDate = getLastMonthEnd();

  // For monthly, we'll fetch 30 days of data (720 hours)
  // Note: BMRS API may limit this, so we might need to make multiple requests
  const historicalData = await getHistoricalIntensity(168); // 7 days max for now

  // Similar aggregation as weekly but with monthly context
  const carbonValues = historicalData
    .map(d => d.intensity?.actual || d.intensity?.forecast || 0)
    .filter(v => v > 0);

  const demandValues = historicalData
    .map(d => d.demand || 0)
    .filter(v => v > 0);

  const carbonData = historicalData.map(d => ({
    value: d.intensity?.actual || d.intensity?.forecast || 0,
    timestamp: d.from,
  }));

  const demandData = historicalData.map(d => ({
    value: d.demand || 0,
    timestamp: d.from,
  }));

  const snapshot: DataSnapshot = {
    id: `monthly-${startDate.toISOString().split('T')[0]}`,
    period_start: startDate.toISOString(),
    period_end: endDate.toISOString(),
    type: 'monthly',
    summary: {
      avgCarbonIntensity: Math.round(calculateAvg(carbonValues)),
      peakRenewable: 0, // Will be enhanced later
      totalDemand: Math.round(demandValues.reduce((sum, v) => sum + v, 0)),
      avgFrequency: 50.0,
      interconnectorFlow: 0,
    },
    records: {
      lowestCarbon: findLowest(carbonData),
      peakDemand: findPeak(demandData),
    },
    notable_events: detectNotableEvents(historicalData),
    sources: [
      'Elexon BMRS',
      'Sheffield Solar PVLive',
    ],
    created_at: new Date().toISOString(),
  };

  return snapshot;
}

/**
 * Saves a data snapshot to disk
 */
export async function saveDataSnapshot(snapshot: DataSnapshot): Promise<void> {
  await ensureSnapshotsDir();

  const filename = `${snapshot.id}.json`;
  const filepath = path.join(SNAPSHOTS_DIR, filename);

  await fs.writeFile(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`Data snapshot saved: ${filepath}`);
}

/**
 * Loads a data snapshot from disk
 */
export async function loadDataSnapshot(id: string): Promise<DataSnapshot | null> {
  try {
    const filepath = path.join(SNAPSHOTS_DIR, `${id}.json`);
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content) as DataSnapshot;
  } catch (error) {
    console.error(`Error loading snapshot ${id}:`, error);
    return null;
  }
}

/**
 * Lists all available snapshots
 */
export async function listSnapshots(): Promise<string[]> {
  await ensureSnapshotsDir();

  try {
    const files = await fs.readdir(SNAPSHOTS_DIR);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch (error) {
    console.error('Error listing snapshots:', error);
    return [];
  }
}

/**
 * Validates data quality before generating reports
 */
export async function validateReportData(snapshot: DataSnapshot): Promise<boolean> {
  const checks = {
    hasData: snapshot.summary.avgCarbonIntensity > 0,
    validDateRange: new Date(snapshot.period_end) > new Date(snapshot.period_start),
    hasSources: snapshot.sources && snapshot.sources.length > 0,
    realisticCarbon: snapshot.summary.avgCarbonIntensity < 1000, // sanity check
  };

  const allValid = Object.values(checks).every(Boolean);

  if (!allValid) {
    console.error('Data validation failed:', checks);
  }

  return allValid;
}
