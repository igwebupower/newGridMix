'use client';

import { useEffect, useRef, useState } from 'react';
import { StatCard, StatStatus } from './StatCard';
import { HeroMetricCard } from './HeroMetricCard';
import { MetricGroup } from './MetricGroup';
import { Stats, SolarData, FrequencyData, SystemPriceData, GridHealthScore, HistoricalData, getIntensityLevel } from '@/lib/api';

interface LiveStatusProps {
  stats: Stats;
  intensity: number;
  solarData?: SolarData;
  frequencyData?: FrequencyData;
  systemPrice?: SystemPriceData;
  gridHealth?: GridHealthScore;
  netImportExport?: number;
  storageOutput?: number;
  historicalData?: HistoricalData[];
}

// Tracks the change in a metric between consecutive data refreshes (the
// dashboard polls live data every 15-300s), so every card can show a real
// trend instead of only the two that happened to have one baked in.
function useDelta(value: number | undefined) {
  const prevRef = useRef<number | undefined>(undefined);
  const [delta, setDelta] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (value === undefined) return;
    if (prevRef.current !== undefined) {
      setDelta(value - prevRef.current);
    }
    prevRef.current = value;
  }, [value]);

  return delta;
}

function trendFor(delta: number | undefined, format: (d: number) => string) {
  if (delta === undefined) return undefined;
  if (delta === 0) return { direction: 'flat' as const, label: 'Unchanged vs previous reading' };
  return {
    direction: (delta > 0 ? 'up' : 'down') as 'up' | 'down',
    label: `${format(delta)} vs previous reading`,
  };
}

function signed(n: number, decimals = 1) {
  const v = n.toFixed(decimals);
  return n > 0 ? `+${v}` : v;
}

const ICONS = {
  bolt: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  leaf: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  flame: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  ),
  sun: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  pulse: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  shield: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  swap: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  coin: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  battery: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
};

function tier(value: number, goodMin: number, warnMin: number): { status: StatStatus; statusLabel: string } {
  if (value >= goodMin) return { status: 'good', statusLabel: 'High' };
  if (value >= warnMin) return { status: 'warn', statusLabel: 'Moderate' };
  return { status: 'bad', statusLabel: 'Low' };
}

function inverseTier(value: number, goodMax: number, warnMax: number): { status: StatStatus; statusLabel: string } {
  if (value <= goodMax) return { status: 'good', statusLabel: 'Low' };
  if (value <= warnMax) return { status: 'warn', statusLabel: 'Moderate' };
  return { status: 'bad', statusLabel: 'High' };
}

export function LiveStatus({
  stats,
  intensity,
  solarData,
  frequencyData,
  systemPrice,
  gridHealth,
  netImportExport,
  storageOutput,
  historicalData
}: LiveStatusProps) {
  const intensityInfo = getIntensityLevel(intensity);

  // Prepare trend data for hero card (last 24 hours, sampled)
  const trendData = historicalData?.slice(-24).map((point, index) => ({
    value: point.intensity.actual,
    time: new Date(point.to).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  })) || [];

  const lowCarbonDelta = useDelta(stats.low_carbon_perc);
  const renewableDelta = useDelta(stats.renewable_perc);
  const fossilDelta = useDelta(stats.fossil_perc);
  const solarDelta = useDelta(solarData?.generation_mw);
  const demandDelta = useDelta(stats.demand);
  const frequencyDelta = useDelta(frequencyData?.frequency);
  const gridHealthDelta = useDelta(gridHealth?.score);
  const netFlowDelta = useDelta(netImportExport);
  const priceDelta = useDelta(systemPrice?.price);
  const storageDelta = useDelta(storageOutput);

  const lowCarbonTier = tier(stats.low_carbon_perc, 70, 40);
  const renewableTier = tier(stats.renewable_perc, 50, 25);
  const fossilTier = inverseTier(stats.fossil_perc, 30, 50);
  const priceTier = systemPrice ? inverseTier(systemPrice.price, 50, 100) : undefined;
  const gridHealthTier = gridHealth
    ? gridHealth.score >= 80
      ? { status: 'good' as StatStatus, statusLabel: 'Good' }
      : gridHealth.score >= 60
      ? { status: 'warn' as StatStatus, statusLabel: 'Fair' }
      : { status: 'bad' as StatStatus, statusLabel: 'Poor' }
    : undefined;
  const frequencyTier = frequencyData
    ? frequencyData.status === 'stable'
      ? { status: 'good' as StatStatus, statusLabel: 'Stable' }
      : frequencyData.status === 'warning'
      ? { status: 'warn' as StatStatus, statusLabel: 'Watch' }
      : { status: 'bad' as StatStatus, statusLabel: 'Alert' }
    : undefined;

  // Some cards depend on data sources that load independently (e.g.
  // frequencyData), so a group's card count can vary between renders.
  // Sizing the grid to the actual count avoids ever leaving an orphaned
  // half-empty row, instead of assuming every group is always full.
  const generationColumns = Math.min(3 + (solarData ? 1 : 0), 4) as 1 | 2 | 3 | 4;
  const operationsColumns = Math.min(
    1 + (frequencyData && frequencyTier ? 1 : 0) + (gridHealth && gridHealthTier ? 1 : 0) + (netImportExport !== undefined ? 1 : 0),
    4
  ) as 1 | 2 | 3 | 4;
  const marketColumns = Math.min((systemPrice && priceTier ? 1 : 0) + (storageOutput !== undefined ? 1 : 0), 4) as 1 | 2 | 3 | 4;

  return (
    <div className="space-y-6">
      {/* Hero Metric: Carbon Intensity */}
      <HeroMetricCard
        title="Carbon Intensity"
        value={intensity}
        unit="gCO₂/kWh"
        level={intensityInfo.level}
        description={
          intensityInfo.level === 'Very Low' || intensityInfo.level === 'Low'
            ? 'Great time to use electricity! The grid is running clean.'
            : intensityInfo.level === 'Moderate'
            ? 'Moderate carbon levels. Consider delaying high-energy tasks.'
            : 'High carbon intensity. Best to wait if possible.'
        }
        color={intensityInfo.level === 'Very Low' || intensityInfo.level === 'Low' ? 'green' : intensityInfo.level === 'Moderate' ? 'yellow' : 'red'}
        icon={
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        }
        trendData={trendData}
      />

      {/* Energy Generation Mix */}
      <MetricGroup title="Energy Generation" icon={ICONS.bolt} delay={0.1} columns={generationColumns}>
        <StatCard
          title="Low Carbon"
          value={stats.low_carbon_perc.toFixed(1)}
          unit="%"
          icon={ICONS.leaf}
          status={lowCarbonTier.status}
          statusLabel={lowCarbonTier.statusLabel}
          trend={trendFor(lowCarbonDelta, (d) => `${signed(d)}pp`)}
          delay={0.05}
        />

        <StatCard
          title="Renewables"
          value={stats.renewable_perc.toFixed(1)}
          unit="%"
          icon={ICONS.bolt}
          status={renewableTier.status}
          statusLabel={renewableTier.statusLabel}
          trend={trendFor(renewableDelta, (d) => `${signed(d)}pp`)}
          delay={0.1}
        />

        <StatCard
          title="Fossil Fuels"
          value={stats.fossil_perc.toFixed(1)}
          unit="%"
          icon={ICONS.flame}
          status={fossilTier.status}
          statusLabel={fossilTier.statusLabel}
          trend={trendFor(fossilDelta, (d) => `${signed(d)}pp`)}
          delay={0.15}
        />

        {solarData && (
          <StatCard
            title="Solar Generation"
            value={solarData.generation_mw > 1000 ? (solarData.generation_mw / 1000).toFixed(2) : solarData.generation_mw.toFixed(0)}
            unit={solarData.generation_mw > 1000 ? 'GW' : 'MW'}
            icon={ICONS.sun}
            trend={trendFor(solarDelta, (d) => `${signed(d, 0)} MW`)}
            delay={0.2}
          />
        )}
      </MetricGroup>

      {/* Grid Operations */}
      <MetricGroup title="Grid Operations" icon={ICONS.pulse} delay={0.2} columns={operationsColumns}>
        <StatCard
          title="Demand"
          value={stats.demand > 1000 ? (stats.demand / 1000).toFixed(2) : stats.demand.toFixed(0)}
          unit={stats.demand > 1000 ? 'GW' : 'MW'}
          icon={ICONS.bolt}
          trend={trendFor(demandDelta, (d) => `${signed(d, 0)} MW`)}
          delay={0}
        />

        {frequencyData && frequencyTier && (
          <StatCard
            title="Grid Frequency"
            value={frequencyData.frequency.toFixed(3)}
            unit="Hz"
            icon={ICONS.pulse}
            status={frequencyTier.status}
            statusLabel={frequencyTier.statusLabel}
            trend={trendFor(frequencyDelta, (d) => `${signed(d, 3)} Hz`)}
            delay={0}
          />
        )}

        {gridHealth && gridHealthTier && (
          <StatCard
            title="Grid Health"
            value={gridHealth.score}
            badge={gridHealth.grade}
            icon={ICONS.shield}
            status={gridHealthTier.status}
            statusLabel={gridHealthTier.statusLabel}
            trend={trendFor(gridHealthDelta, (d) => `${signed(d, 0)} pts`)}
            delay={0}
          />
        )}

        {netImportExport !== undefined && (
          <StatCard
            title="Net Flow"
            value={Math.abs(netImportExport).toFixed(0)}
            unit={netImportExport > 0 ? 'MW importing' : netImportExport < 0 ? 'MW exporting' : 'MW'}
            icon={ICONS.swap}
            trend={trendFor(netFlowDelta, (d) => `${signed(d, 0)} MW`)}
            delay={0}
          />
        )}
      </MetricGroup>

      {/* Market & Economics */}
      {(systemPrice || storageOutput !== undefined) && (
        <MetricGroup title="Market & Economics" icon={ICONS.coin} delay={0.3} columns={marketColumns}>
          {systemPrice && priceTier && (
            <StatCard
              title="System Price"
              value={systemPrice.price.toFixed(2)}
              unit="£/MWh"
              icon={ICONS.coin}
              status={priceTier.status}
              statusLabel={priceTier.statusLabel}
              trend={trendFor(priceDelta, (d) => `${signed(d, 2)} £/MWh`)}
              delay={0}
            />
          )}

          {storageOutput !== undefined && (
            <StatCard
              title="Storage"
              value={Math.abs(storageOutput).toFixed(0)}
              unit={storageOutput > 0 ? 'MW discharging' : storageOutput < 0 ? 'MW charging' : 'MW'}
              icon={ICONS.battery}
              trend={trendFor(storageDelta, (d) => `${signed(d, 0)} MW`)}
              delay={0}
            />
          )}
        </MetricGroup>
      )}
    </div>
  );
}
