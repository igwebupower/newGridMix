'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Rocket,
  Radio,
  Code2,
  AlertTriangle,
  Target,
  BatteryCharging,
  Home,
  BarChart3,
  DollarSign,
  Leaf,
  Zap,
  ClipboardList,
  Heart,
  FileCode,
  Box
} from 'lucide-react';

export default function APIDocsPage() {
  const [activeTab, setActiveTab] = useState('javascript');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check API status on load
  useEffect(() => {
    fetch('/api/v1')
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const testEndpoint = async (endpoint: string, fullPath: string) => {
    setLoading({ ...loading, [endpoint]: true });
    try {
      const response = await fetch(fullPath);
      const data = await response.json();
      setTestResults({ ...testResults, [endpoint]: data });
      setActiveEndpoint(endpoint);
    } catch (error) {
      setTestResults({
        ...testResults,
        [endpoint]: { error: 'Failed to fetch', message: String(error) }
      });
      setActiveEndpoint(endpoint);
    } finally {
      setLoading({ ...loading, [endpoint]: false });
    }
  };

  const endpoints = [
    {
      id: 'current',
      method: 'GET',
      path: '/api/v1/current',
      title: 'Current Grid Data',
      description: 'Get a real-time snapshot of the UK National Grid including demand, generation mix, carbon intensity, frequency, and interconnectors.',
      params: [],
      response: {
        timestamp: '2025-11-14T14:40:00Z',
        demand: { total_mw: 33193, national_mw: 30276, exports_mw: 2917 },
        generation: {
          total_mw: 33193,
          mix: [
            { fuel: 'wind', mw: 16608, percentage: 50.0 },
            { fuel: 'gas', mw: 8615, percentage: 26.0 },
          ]
        },
        carbon_intensity: { actual: 111, forecast: 111, level: 'low' },
        frequency: { hz: 50.099, status: 'stable' },
        interconnectors: [
          { name: 'IFA', country: 'France', flow_mw: 1000, capacity_mw: 2000, direction: 'import' },
        ],
        solar: { generation_mw: 4596, capacity_percent: 22.8, installed_capacity_mw: 20200 },
        generation_mix_with_solar: {
          total_mw: 37789,
          mix: [
            { fuel: 'wind', mw: 16608, percentage: 44.0 },
            { fuel: 'gas', mw: 8615, percentage: 22.8 },
            { fuel: 'solar', mw: 4596, percentage: 12.2 },
          ],
          note: 'Includes distributed solar from Sheffield Solar PVLive'
        },
        system_price: { price_gbp_per_mwh: 45.50, timestamp: '2025-11-14T14:30:00Z' },
      },
      cacheTime: '30 seconds',
    },
    {
      id: 'solar-current',
      method: 'GET',
      path: '/api/v1/solar/current',
      title: 'Current Solar Generation',
      description: 'Get the current UK solar generation in megawatts and as a percentage of installed capacity.',
      params: [],
      response: {
        timestamp: '2026-02-04T12:30:00Z',
        generation_mw: 4596,
        capacity_percent: 22.8,
        installed_capacity_mw: 20200,
        data_source: 'Sheffield Solar PVLive'
      },
      cacheTime: '30 seconds',
    },
    {
      id: 'solar-intraday',
      method: 'GET',
      path: '/api/v1/solar/intraday',
      title: 'Solar Intraday Curve',
      description: "Get today's complete solar generation curve with statistics including peak generation, average output, and total energy produced.",
      params: [],
      response: {
        date: '2026-02-04',
        data_points: 48,
        statistics: {
          peak_mw: 4596,
          peak_time: '2026-02-04T12:30:00Z',
          average_mw: 1920,
          total_gwh: 46.1
        },
        data: [
          { timestamp: '2026-02-04T00:00:00Z', time: '00:00', generation_mw: 0 },
          { timestamp: '2026-02-04T12:30:00Z', time: '12:30', generation_mw: 4596 },
        ],
        metadata: {
          source: 'Sheffield Solar PVLive',
          api_version: 'v1',
          cache_duration: '5 minutes',
          installed_capacity_mw: 20200
        }
      },
      cacheTime: '5 minutes',
    },
    {
      id: 'historical',
      method: 'GET',
      path: '/api/v1/historical',
      title: 'Historical Data',
      description: 'Get historical carbon intensity and demand data for analysis and trend tracking.',
      params: [
        { name: 'hours', type: 'integer', default: 24, description: 'Number of hours to retrieve (1-168)' },
        { name: 'limit', type: 'integer', default: 100, description: 'Maximum number of data points (1-1000)' }
      ],
      response: {
        hours_requested: 24,
        data_points: 48,
        data: [
          {
            timestamp: '2025-11-14T00:00:00Z',
            demand_mw: 28456,
            carbon_intensity: { actual: 77, forecast: 77, level: 'low' }
          }
        ]
      },
      cacheTime: '5 minutes',
    },
    {
      id: 'forecast',
      method: 'GET',
      path: '/api/v1/forecast',
      title: 'Carbon Intensity Forecast',
      description: 'Get carbon intensity forecasts to plan energy usage during cleaner periods.',
      params: [
        { name: 'hours', type: 'integer', default: 48, description: 'Hours ahead to forecast (1-168)' },
        { name: 'limit', type: 'integer', default: 100, description: 'Maximum number of data points (1-1000)' }
      ],
      response: {
        generated_at: '2025-11-14T14:45:19.029Z',
        forecast_hours: 48,
        data_points: 96,
        data: [
          {
            timestamp: '2025-11-14T15:00:00Z',
            carbon_intensity: { forecast: 113, level: 'low' }
          }
        ]
      },
      cacheTime: '5 minutes',
    },
  ];

  const codeExamples = {
    javascript: `// Fetch current grid data
const response = await fetch('https://gridmix.co.uk/api/v1/current');
const data = await response.json();

console.log('Demand:', data.demand.total_mw, 'MW');
console.log('Carbon:', data.carbon_intensity.actual, 'gCO2/kWh');
console.log('Renewable %:',
  data.generation.mix
    .filter(f => ['wind', 'solar', 'hydro'].includes(f.fuel))
    .reduce((sum, f) => sum + f.percentage, 0)
);

// Get historical data with error handling
try {
  const historical = await fetch(
    'https://gridmix.co.uk/api/v1/historical?hours=24'
  );
  const histData = await historical.json();

  // Find cleanest period
  const cleanest = histData.data.reduce((min, point) =>
    point.carbon_intensity.actual < min.carbon_intensity.actual ? point : min
  );

  console.log('Cleanest period:', cleanest.timestamp);
  console.log('Carbon intensity:', cleanest.carbon_intensity.actual);
} catch (error) {
  console.error('API Error:', error);
}`,

    python: `import requests
from datetime import datetime

# Get current grid data
response = requests.get('https://gridmix.co.uk/api/v1/current')
data = response.json()

print(f"Demand: {data['demand']['total_mw']} MW")
print(f"Carbon: {data['carbon_intensity']['actual']} gCO2/kWh")
print(f"Frequency: {data['frequency']['hz']} Hz")

# Calculate renewable percentage
renewable_sources = ['wind', 'solar', 'hydro', 'biomass']
renewable_pct = sum(
    gen['percentage']
    for gen in data['generation']['mix']
    if gen['fuel'] in renewable_sources
)
print(f"Renewable: {renewable_pct:.1f}%")

# Get forecast and find best time to use energy
forecast = requests.get('https://gridmix.co.uk/api/v1/forecast?hours=24').json()
best_time = min(forecast['data'], key=lambda x: x['carbon_intensity']['forecast'])

print(f"\\nBest time to use energy:")
print(f"Time: {best_time['timestamp']}")
print(f"Carbon: {best_time['carbon_intensity']['forecast']} gCO2/kWh")`,

    curl: `# Get current grid data
curl https://gridmix.co.uk/api/v1/current | jq

# Get specific fields
curl -s https://gridmix.co.uk/api/v1/current | \\
  jq '{demand: .demand.total_mw, carbon: .carbon_intensity.actual}'

# Get historical data
curl "https://gridmix.co.uk/api/v1/historical?hours=24" | jq

# Get solar forecast for today
curl https://gridmix.co.uk/api/v1/solar/intraday | \\
  jq '.statistics'

# Monitor carbon intensity every 30 seconds
watch -n 30 'curl -s https://gridmix.co.uk/api/v1/current | \\
  jq -r ".carbon_intensity.actual"'

# Save to file with timestamp
curl https://gridmix.co.uk/api/v1/current \\
  > "grid_$(date +%Y%m%d_%H%M%S).json"`,

    go: `package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type GridResponse struct {
    Timestamp       string \`json:"timestamp"\`
    Demand          Demand \`json:"demand"\`
    CarbonIntensity CarbonIntensity \`json:"carbon_intensity"\`
    Generation      Generation \`json:"generation"\`
}

type Demand struct {
    TotalMW    int \`json:"total_mw"\`
    NationalMW int \`json:"national_mw"\`
}

type CarbonIntensity struct {
    Actual int    \`json:"actual"\`
    Level  string \`json:"level"\`
}

type Generation struct {
    TotalMW int              \`json:"total_mw"\`
    Mix     []GenerationMix \`json:"mix"\`
}

type GenerationMix struct {
    Fuel       string  \`json:"fuel"\`
    MW         int     \`json:"mw"\`
    Percentage float64 \`json:"percentage"\`
}

func getGridData() (*GridResponse, error) {
    client := &http.Client{Timeout: 10 * time.Second}

    resp, err := client.Get("https://gridmix.co.uk/api/v1/current")
    if err != nil {
        return nil, fmt.Errorf("request failed: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("unexpected status: %d", resp.StatusCode)
    }

    var data GridResponse
    if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
        return nil, fmt.Errorf("decode failed: %w", err)
    }

    return &data, nil
}

func main() {
    data, err := getGridData()
    if err != nil {
        fmt.Printf("Error: %v\\n", err)
        return
    }

    fmt.Printf("UK Grid Status\\n")
    fmt.Printf("==============\\n")
    fmt.Printf("Demand: %d MW\\n", data.Demand.TotalMW)
    fmt.Printf("Carbon: %d gCO2/kWh (%s)\\n",
        data.CarbonIntensity.Actual,
        data.CarbonIntensity.Level)

    // Calculate renewable percentage
    var renewablePct float64
    for _, gen := range data.Generation.Mix {
        if gen.Fuel == "wind" || gen.Fuel == "solar" ||
           gen.Fuel == "hydro" {
            renewablePct += gen.Percentage
        }
    }
    fmt.Printf("Renewable: %.1f%%\\n", renewablePct)
}`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
              API Documentation
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'online' ? 'bg-green-500 animate-pulse' :
                apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {apiStatus === 'online' ? 'All Systems Operational' :
                 apiStatus === 'offline' ? 'API Offline' : 'Checking...'}
              </span>
            </div>
          </div>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6 px-4">
            Free, real-time UK National Grid data API. No authentication required.
            Simple JSON responses. Built for developers.
          </p>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4">
            <span className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-100 rounded-lg font-medium border border-green-200 dark:border-green-800">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Free Forever
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 rounded-lg font-medium border border-blue-200 dark:border-blue-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              No API Key Required
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-100 rounded-lg font-medium border border-purple-200 dark:border-purple-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Real-time Data
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-100 rounded-lg font-medium border border-orange-200 dark:border-orange-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Updated Every 30s
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-100 rounded-lg font-medium border border-red-200 dark:border-red-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              60 req/min
            </span>
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-4 sm:p-6 lg:p-8 rounded-2xl mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Rocket className="w-7 h-7 sm:w-9 sm:h-9 text-blue-600 dark:text-blue-400" />
            Quick Start
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Base URL
              </h3>
              <div className="relative">
                <code className="block bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  https://gridmix.co.uk/api/v1
                </code>
                <button
                  onClick={() => copyToClipboard('https://gridmix.co.uk/api/v1', 'base-url')}
                  className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedCode === 'base-url' ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Try It Now
              </h3>
              <div className="relative">
                <code className="block bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  curl https://gridmix.co.uk/api/v1/current
                </code>
                <button
                  onClick={() => copyToClipboard('curl https://gridmix.co.uk/api/v1/current', 'quick-example')}
                  className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedCode === 'quick-example' ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Pro Tip:</strong> All endpoints return JSON and support CORS.
                No authentication needed. Cache responses for 30 seconds to optimize performance.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
            <Radio className="w-9 h-9 text-purple-600 dark:text-purple-400" />
            API Endpoints
          </h2>

          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="glass rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-md shadow-sm whitespace-nowrap">
                          {endpoint.method}
                        </span>
                        <code className="text-sm sm:text-base lg:text-lg font-mono text-gray-900 dark:text-gray-100 font-semibold break-all">
                          {endpoint.path}
                        </code>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Cache: {endpoint.cacheTime}
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {endpoint.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        {endpoint.description}
                      </p>
                    </div>

                    <button
                      onClick={() => testEndpoint(endpoint.id, endpoint.path)}
                      disabled={loading[endpoint.id]}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading[endpoint.id] ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Testing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Try It
                        </>
                      )}
                    </button>
                  </div>

                  {/* Parameters */}
                  {endpoint.params.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Query Parameters
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                        {endpoint.params.map((param, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <code className="text-sm font-mono text-blue-600 dark:text-blue-400 font-semibold">
                              {param.name}
                            </code>
                            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              {param.type}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              default: {param.default}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                              {param.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example Response */}
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Example Response
                    </h4>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono max-h-96">
                        <code>{JSON.stringify(endpoint.response, null, 2)}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(endpoint.response, null, 2), `response-${endpoint.id}`)}
                        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedCode === `response-${endpoint.id}` ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Live Test Results */}
                  {activeEndpoint === endpoint.id && testResults[endpoint.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4"
                    >
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Live Response
                      </h4>
                      <pre className="bg-green-900/10 dark:bg-green-900/20 border border-green-500/30 text-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96">
                        <code>{JSON.stringify(testResults[endpoint.id], null, 2)}</code>
                      </pre>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Code Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass p-4 sm:p-6 lg:p-8 rounded-2xl mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Code2 className="w-7 h-7 sm:w-9 sm:h-9 text-green-600 dark:text-green-400" />
            Code Examples
          </h2>

          <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'javascript', name: 'JavaScript', icon: <FileCode className="w-4 h-4" /> },
              { id: 'python', name: 'Python', icon: <FileCode className="w-4 h-4" /> },
              { id: 'curl', name: 'cURL', icon: <Zap className="w-4 h-4" /> },
              { id: 'go', name: 'Go', icon: <Box className="w-4 h-4" /> },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setActiveTab(lang.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === lang.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {lang.icon}
                <span className="hidden sm:inline">{lang.name}</span>
                <span className="sm:hidden">{lang.id === 'javascript' ? 'JS' : lang.id === 'python' ? 'Py' : lang.name}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 sm:p-6 rounded-xl overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed">
              <code>{codeExamples[activeTab as keyof typeof codeExamples]}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(codeExamples[activeTab as keyof typeof codeExamples], `code-${activeTab}`)}
              className="absolute top-4 right-4 p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all shadow-lg"
            >
              {copiedCode === `code-${activeTab}` ? (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-400">Copied!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Copy</span>
                </div>
              )}
            </button>
          </div>
        </motion.div>

        {/* Error Codes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass p-4 sm:p-6 lg:p-8 rounded-2xl mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <AlertTriangle className="w-7 h-7 sm:w-9 sm:h-9 text-orange-600 dark:text-orange-400" />
            Error Codes & Handling
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {[
              { code: 200, status: 'OK', description: 'Request successful', color: 'green' },
              { code: 400, status: 'Bad Request', description: 'Invalid parameters (e.g., hours out of range)', color: 'yellow' },
              { code: 404, status: 'Not Found', description: 'Endpoint or resource not found', color: 'orange' },
              { code: 429, status: 'Too Many Requests', description: 'Rate limit exceeded (60 requests/minute)', color: 'red' },
              { code: 500, status: 'Internal Server Error', description: 'Something went wrong on our end', color: 'red' },
            ].map((error) => (
              <div key={error.code} className={`p-4 bg-${error.color}-50 dark:bg-${error.color}-900/20 border border-${error.color}-200 dark:border-${error.color}-800 rounded-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 bg-${error.color}-500 text-white text-sm font-bold rounded`}>
                    {error.code}
                  </span>
                  <span className={`font-bold text-${error.color}-900 dark:text-${error.color}-100`}>
                    {error.status}
                  </span>
                </div>
                <p className={`text-sm text-${error.color}-800 dark:text-${error.color}-200`}>
                  {error.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Example Error Response</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm font-mono overflow-x-auto">
              <code>{JSON.stringify({
                error: 'Failed to fetch grid data',
                message: 'Upstream API timeout',
                timestamp: new Date().toISOString()
              }, null, 2)}</code>
            </pre>
          </div>
        </motion.div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass p-4 sm:p-6 lg:p-8 rounded-2xl mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <Target className="w-7 h-7 sm:w-9 sm:h-9 text-red-600 dark:text-red-400" />
            Real-World Use Cases
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[
              {
                icon: BatteryCharging,
                title: 'EV Charging Optimization',
                description: 'Charge your electric vehicle during low carbon periods',
                color: 'blue',
                example: "if (carbon < 100) startCharging()"
              },
              {
                icon: Home,
                title: 'Smart Home Automation',
                description: 'Run appliances when the grid is greenest',
                color: 'green',
                example: "if (renewable > 70%) runDishwasher()"
              },
              {
                icon: BarChart3,
                title: 'Energy Analytics',
                description: 'Analyze trends and forecast renewable energy availability',
                color: 'purple',
                example: "analyzeRenewableTrends(data)"
              },
              {
                icon: DollarSign,
                title: 'Cost Optimization',
                description: 'Reduce energy costs with dynamic pricing',
                color: 'orange',
                example: "if (carbon < threshold) useEnergy()"
              },
              {
                icon: Leaf,
                title: 'Carbon Tracking',
                description: 'Monitor and reduce your carbon footprint',
                color: 'emerald',
                example: "trackCarbonEmissions(data)"
              },
              {
                icon: Zap,
                title: 'Grid Monitoring',
                description: 'Real-time monitoring of UK electricity grid',
                color: 'yellow',
                example: "displayGridStatus(current)"
              },
            ].map((useCase, i) => {
              const IconComponent = useCase.icon;
              return (
                <div key={i} className={`border border-gray-200 dark:border-gray-700 p-6 rounded-xl hover:shadow-lg transition-shadow bg-gradient-to-br from-${useCase.color}-50/50 to-transparent dark:from-${useCase.color}-900/10`}>
                  <IconComponent className={`w-10 h-10 mb-3 text-${useCase.color}-600 dark:text-${useCase.color}-400`} />
                  <h3 className={`text-xl font-bold text-${useCase.color}-600 dark:text-${useCase.color}-400 mb-2`}>
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                    {useCase.description}
                  </p>
                  <code className="text-xs bg-gray-900 text-green-400 px-3 py-1.5 rounded block font-mono">
                    {useCase.example}
                  </code>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Fair Use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="glass p-4 sm:p-6 lg:p-8 rounded-2xl mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <ClipboardList className="w-7 h-7 sm:w-9 sm:h-9 text-indigo-600 dark:text-indigo-400" />
            Fair Use Policy
          </h2>

          <div className="space-y-4 sm:space-y-6">
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              GridMix API is <strong className="text-gray-900 dark:text-gray-100">100% free and unlimited</strong> for everyone.
              We trust our community to use it responsibly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 text-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Best Practices
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    'Cache responses for at least 30 seconds',
                    'Use appropriate query parameters',
                    'Handle errors gracefully',
                    'Free for personal and commercial use',
                    'No API key or signup required',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2 text-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please Avoid
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    'Exceeding 60 requests per minute (rate limited)',
                    'Scraping or bulk downloading',
                    'Using as primary data source without caching',
                    'Redistributing data commercially',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Need higher throughput?</strong> Contact us at{' '}
                <a href="mailto:hello@gridmix.co.uk" className="font-semibold underline hover:text-blue-700 dark:hover:text-blue-300">
                  hello@gridmix.co.uk
                </a>
                {' '}and we&apos;ll work with you to find a solution.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="glass p-6 sm:p-8 rounded-2xl text-center border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <span>Support GridMix</span>
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-pink-600 dark:text-pink-400 fill-pink-600 dark:fill-pink-400" />
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto px-4">
            GridMix is free and open source. If you find it valuable, consider supporting
            the project to help keep it running for everyone.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <a
              href="https://github.com/igwebupower/newGridMix"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors inline-flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Star on GitHub
            </a>
            <a
              href="/support"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all inline-flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              Support the Project
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
