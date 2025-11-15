'use client';

import { StatCard } from './StatCard';
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
      <MetricGroup
        title="Energy Generation"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
        delay={0.1}
      >

        <StatCard
          title="Low Carbon"
          value={stats.low_carbon_perc.toFixed(1)}
          unit="%"
          color="green"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          delay={0.05}
        />

        <StatCard
          title="Renewables"
          value={stats.renewable_perc.toFixed(1)}
          unit="%"
          color="green"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          delay={0.1}
        />

        <StatCard
          title="Fossil Fuels"
          value={stats.fossil_perc.toFixed(1)}
          unit="%"
          color={stats.fossil_perc > 50 ? 'red' : stats.fossil_perc > 30 ? 'yellow' : 'green'}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
          delay={0.15}
        />

        {solarData && (
          <StatCard
            title="Solar Generation"
            value={solarData.generation_mw > 1000 ? (solarData.generation_mw / 1000).toFixed(2) : solarData.generation_mw.toFixed(0)}
            unit={solarData.generation_mw > 1000 ? 'GW' : 'MW'}
            color="yellow"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            delay={0.2}
          />
        )}
      </MetricGroup>

      {/* Grid Operations */}
      <MetricGroup
        title="Grid Operations"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        delay={0.2}
      >
        <StatCard
          title="Demand"
          value={stats.demand > 1000 ? (stats.demand / 1000).toFixed(2) : stats.demand.toFixed(0)}
          unit={stats.demand > 1000 ? 'GW' : 'MW'}
          color="blue"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          delay={0}
        />

        {frequencyData && (
          <StatCard
            title="Grid Frequency"
            value={frequencyData.frequency.toFixed(3)}
            unit="Hz"
            color={frequencyData.status === 'stable' ? 'green' : frequencyData.status === 'warning' ? 'yellow' : 'red'}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            delay={0}
          />
        )}

        {gridHealth && (
          <StatCard
            title="Grid Health"
            value={gridHealth.score}
            unit={gridHealth.grade}
            color={gridHealth.score >= 80 ? 'green' : gridHealth.score >= 60 ? 'yellow' : 'red'}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
            delay={0}
          />
        )}

        {netImportExport !== undefined && (
          <StatCard
            title="Net Flow"
            value={Math.abs(netImportExport).toFixed(0)}
            unit={netImportExport > 0 ? 'MW ↓' : netImportExport < 0 ? 'MW ↑' : 'MW'}
            color={netImportExport > 0 ? 'green' : 'orange'}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            }
            delay={0}
          />
        )}
      </MetricGroup>

      {/* Market & Economics */}
      {(systemPrice || storageOutput !== undefined) && (
        <MetricGroup
          title="Market & Economics"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          delay={0.3}
        >
          {systemPrice && (
            <StatCard
              title="System Price"
              value={systemPrice.price.toFixed(2)}
              unit="£/MWh"
              color={systemPrice.price > 100 ? 'red' : systemPrice.price > 50 ? 'yellow' : 'green'}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              delay={0}
            />
          )}

          {storageOutput !== undefined && (
            <StatCard
              title="Storage"
              value={Math.abs(storageOutput).toFixed(0)}
              unit={storageOutput > 0 ? 'MW ↑' : storageOutput < 0 ? 'MW ↓' : 'MW'}
              color={storageOutput > 0 ? 'purple' : 'blue'}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
              delay={0}
            />
          )}
        </MetricGroup>
      )}
    </div>
  );
}
