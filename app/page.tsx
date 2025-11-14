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
import { SolarIntradayChart } from '@/components/SolarIntradayChart';
import {
  getCurrentGridData,
  getGridStats,
  getHistoricalIntensity,
  getIntensityForecast,
  getCurrentSolarData,
  getTodaySolarCurve,
  getYesterdaySolarCurve,
  getCurrentFrequency,
  getCurrentSystemPrice,
  calculateGridHealthScore,
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

  // Fetch solar data
  const { data: solarData } = useSWR(
    'solarCurrent',
    getCurrentSolarData,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // Fetch today's solar curve
  const { data: todaySolarCurve } = useSWR(
    'solarToday',
    getTodaySolarCurve,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  // Fetch yesterday's solar curve
  const { data: yesterdaySolarCurve } = useSWR(
    'solarYesterday',
    getYesterdaySolarCurve,
    {
      refreshInterval: 3600000, // Refresh every hour
    }
  );

  // Fetch frequency data
  const { data: frequencyData } = useSWR(
    'frequency',
    getCurrentFrequency,
    {
      refreshInterval: 15000, // Refresh every 15 seconds (frequency updates rapidly)
      revalidateOnFocus: true,
    }
  );

  // Fetch system price
  const { data: systemPrice } = useSWR(
    'systemPrice',
    getCurrentSystemPrice,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  useEffect(() => {
    if (gridData) {
      setLastUpdated(formatTimestamp(gridData.to));
    }
  }, [gridData]);

  // Calculate derived values
  const storageOutput = gridData?.generationmix.find(item => item.fuel === 'hydro')?.mw || 0;
  const netImportExport = (gridData?.totalImports || 0) - (gridData?.totalExports || 0);

  // Calculate grid health score
  const gridHealth = gridData && stats && frequencyData
    ? calculateGridHealthScore(
        frequencyData.frequency,
        gridData.intensity.actual || gridData.intensity.forecast,
        stats.renewable_perc
      )
    : undefined;

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
          solarData={solarData}
          frequencyData={frequencyData}
          systemPrice={systemPrice}
          gridHealth={gridHealth}
          netImportExport={netImportExport}
          storageOutput={storageOutput}
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

        {/* Solar Intraday Section */}
        <Card
          title="☀️ Solar Generation Today"
          subtitle={
            solarData && solarData.generation_mw === 0
              ? "🌙 Nighttime - No solar generation (see yesterday's curve for reference)"
              : "Live solar output curve with yesterday comparison"
          }
          delay={0.4}
        >
          {todaySolarCurve && todaySolarCurve.length > 0 ? (
            <SolarIntradayChart
              todayData={todaySolarCurve}
              yesterdayData={yesterdaySolarCurve}
            />
          ) : (
            <div className="text-center py-12">
              <div className="glass p-8 rounded-lg inline-block">
                <svg
                  className="w-16 h-16 text-yellow-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading solar data...
                </p>
              </div>
            </div>
          )}
        </Card>

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
        <footer className="text-center py-8 space-y-4">
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
            {' '}and{' '}
            <a
              href="https://www.solar.sheffield.ac.uk/pvlive/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              Sheffield Solar PVLive
            </a>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Updates every 30 seconds
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <a href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/cookies" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Cookie Policy
            </a>
            <span>•</span>
            <a href="mailto:hello@gridmix.co.uk" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Contact
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
