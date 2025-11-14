'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { LiveStatus } from '@/components/LiveStatus';
import { EnergyMixChart } from '@/components/EnergyMixChart';
import { IntensityChart } from '@/components/IntensityChart';
import { SourceBreakdown } from '@/components/SourceBreakdown';
import { InterconnectorFlows } from '@/components/InterconnectorFlows';
import {
  getCurrentGridData,
  getGridStats,
  getHistoricalIntensity,
  getIntensityForecast,
  formatTimestamp,
} from '@/lib/api';

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch current grid data
  const { data: gridData, error: gridError } = useSWR(
    'currentGrid',
    getCurrentGridData,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // Fetch stats
  const { data: stats, error: statsError } = useSWR(
    'gridStats',
    getGridStats,
    {
      refreshInterval: 30000,
    }
  );

  // Fetch historical data
  const { data: historicalData, error: historicalError } = useSWR(
    'historical',
    () => getHistoricalIntensity(24),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  // Fetch forecast data
  const { data: forecastData, error: forecastError } = useSWR(
    'forecast',
    () => getIntensityForecast(48),
    {
      refreshInterval: 300000,
    }
  );

  useEffect(() => {
    if (gridData) {
      setLastUpdated(formatTimestamp(gridData.to));
    }
  }, [gridData]);

  const isLoading = !gridData || !stats;
  const hasError = gridError || statsError;

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Failed to load data
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please check your connection and try again
              </p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header lastUpdated={lastUpdated} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Live Status Cards */}
        <LiveStatus
          stats={stats}
          intensity={gridData.intensity.actual || gridData.intensity.forecast}
        />

        {/* Energy Mix Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            title="Energy Mix"
            subtitle="Current generation sources"
            delay={0.2}
          >
            <EnergyMixChart data={gridData.generationmix} />
          </Card>

          <Card
            title="Source Breakdown"
            subtitle="Detailed view of all sources"
            delay={0.3}
          >
            <SourceBreakdown data={gridData.generationmix} />
          </Card>
        </div>

        {/* Interconnector Flows */}
        {gridData.interconnectors && gridData.interconnectors.length > 0 && (
          <Card
            title="Interconnector Flows"
            subtitle="Energy imports and exports across GB borders"
            delay={0.4}
          >
            <InterconnectorFlows
              interconnectors={gridData.interconnectors}
              totalImports={gridData.totalImports}
              totalExports={gridData.totalExports}
            />
          </Card>
        )}

        {/* Trends Section */}
        {historicalData && historicalData.length > 0 && (
          <Card
            title="Carbon Intensity Trends"
            subtitle="Last 24 hours"
            delay={0.4}
          >
            <IntensityChart data={historicalData} type="area" />
          </Card>
        )}

        {/* Forecast Section */}
        {forecastData && forecastData.length > 0 && (
          <Card
            title="Intensity Forecast"
            subtitle="Next 48 hours"
            delay={0.5}
          >
            <IntensityChart data={forecastData} type="line" />
          </Card>
        )}

        {/* Footer */}
        <footer className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data provided by{' '}
            <a
              href="https://www.elexon.co.uk/data/balancing-mechanism-reporting-agent/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              Elexon BMRS
            </a>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Updates every 30 seconds
          </p>
        </footer>
      </main>
    </div>
  );
}
