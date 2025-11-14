'use client';

import { StatCard } from './StatCard';
import { Stats, SolarData, getIntensityLevel } from '@/lib/api';

interface LiveStatusProps {
  stats: Stats;
  intensity: number;
  solarData?: SolarData;
}

export function LiveStatus({ stats, intensity, solarData }: LiveStatusProps) {
  const intensityInfo = getIntensityLevel(intensity);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Carbon Intensity"
        value={intensity}
        unit="gCO₂/kWh"
        color={intensityInfo.level === 'Very Low' || intensityInfo.level === 'Low' ? 'green' : intensityInfo.level === 'Moderate' ? 'yellow' : 'red'}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        }
        delay={0}
      />

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
        delay={0.1}
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
        delay={0.2}
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
        delay={0.3}
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
          delay={0.4}
        />
      )}
    </div>
  );
}
