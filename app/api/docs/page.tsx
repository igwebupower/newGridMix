'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function APIDocsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/current',
      description: 'Get current UK grid data snapshot',
      params: 'None',
    },
    {
      method: 'GET',
      path: '/api/v1/historical',
      description: 'Get historical carbon intensity data',
      params: 'hours (optional, default: 24)',
    },
    {
      method: 'GET',
      path: '/api/v1/forecast',
      description: 'Get carbon intensity forecast',
      params: 'hours (optional, default: 48)',
    },
    {
      method: 'GET',
      path: '/api/v1/solar/current',
      description: 'Get current UK solar generation',
      params: 'None',
    },
    {
      method: 'GET',
      path: '/api/v1/solar/intraday',
      description: "Get today's solar generation curve",
      params: 'None',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            GridMix API Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Free, real-time UK National Grid data API. No authentication required.
            Simple JSON responses. Open source friendly.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <span className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg font-medium">
              ✅ 100% Free Forever
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-lg font-medium">
              🔓 No API Key Required
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-lg font-medium">
              ⚡ Real-time Data
            </span>
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-2xl mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Quick Start
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Base URL
              </h3>
              <code className="block bg-gray-800 text-green-400 p-4 rounded-lg">
                https://gridmix.co.uk/api/v1
              </code>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Example Request
              </h3>
              <code className="block bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
                curl https://gridmix.co.uk/api/v1/current
              </code>
            </div>
          </div>
        </motion.div>

        {/* Endpoints Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Available Endpoints
          </h2>
          <div className="grid gap-4">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="glass p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded">
                      {endpoint.method}
                    </span>
                    <code className="text-lg font-mono text-gray-900 dark:text-gray-100">
                      {endpoint.path}
                    </code>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {endpoint.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  <strong>Parameters:</strong> {endpoint.params}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Code Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-8 rounded-2xl mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Code Examples
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {['JavaScript', 'Python', 'cURL', 'Go'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang.toLowerCase())}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === lang.toLowerCase()
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Code Blocks */}
          {activeTab === 'javascript' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Fetch API
                </h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <code>{`// Get current grid data
fetch('https://gridmix.co.uk/api/v1/current')
  .then(response => response.json())
  .then(data => {
    console.log('Demand:', data.demand.total_mw, 'MW');
    console.log('Carbon:', data.carbon_intensity.actual, 'gCO2/kWh');
    console.log('Wind:', data.generation.mix.find(f => f.fuel === 'wind').percentage + '%');
  });

// Get historical data (last 24 hours)
fetch('https://gridmix.co.uk/api/v1/historical?hours=24')
  .then(response => response.json())
  .then(data => {
    console.log('Data points:', data.data_points);
    data.data.forEach(point => {
      console.log(point.timestamp, point.carbon_intensity.actual);
    });
  });`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Async/Await
                </h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <code>{`async function getGridData() {
  const response = await fetch('https://gridmix.co.uk/api/v1/current');
  const data = await response.json();

  return {
    demand: data.demand.total_mw,
    carbon: data.carbon_intensity.actual,
    renewable: data.generation.mix
      .filter(f => ['wind', 'solar', 'hydro'].includes(f.fuel))
      .reduce((sum, f) => sum + f.percentage, 0)
  };
}

// Usage
const gridData = await getGridData();
console.log('Renewable percentage:', gridData.renewable + '%');`}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Using requests
                </h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <code>{`import requests

# Get current grid data
response = requests.get('https://gridmix.co.uk/api/v1/current')
data = response.json()

print(f"Demand: {data['demand']['total_mw']} MW")
print(f"Carbon: {data['carbon_intensity']['actual']} gCO2/kWh")
print(f"Frequency: {data['frequency']['hz']} Hz")

# Get solar generation
solar_response = requests.get('https://gridmix.co.uk/api/v1/solar/current')
solar = solar_response.json()
print(f"Solar: {solar['generation_mw']} MW ({solar['capacity_percent']}% of capacity)")`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Historical Data Analysis
                </h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <code>{`import requests
import pandas as pd

# Get 48 hours of historical data
response = requests.get('https://gridmix.co.uk/api/v1/historical?hours=48')
data = response.json()

# Convert to pandas DataFrame
df = pd.DataFrame(data['data'])
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Calculate statistics
avg_carbon = df['carbon_intensity'].apply(lambda x: x['actual']).mean()
print(f"Average carbon intensity: {avg_carbon:.1f} gCO2/kWh")

# Find lowest carbon period
min_idx = df['carbon_intensity'].apply(lambda x: x['actual']).idxmin()
print(f"Lowest carbon at: {df.loc[min_idx, 'timestamp']}")`}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'curl' && (
            <div className="space-y-4">
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
                <code>{`# Get current grid data
curl https://gridmix.co.uk/api/v1/current

# Get current data with pretty printing
curl https://gridmix.co.uk/api/v1/current | jq

# Get historical data (last 24 hours)
curl "https://gridmix.co.uk/api/v1/historical?hours=24"

# Get 48-hour forecast
curl "https://gridmix.co.uk/api/v1/forecast?hours=48"

# Get current solar generation
curl https://gridmix.co.uk/api/v1/solar/current

# Get today's solar curve
curl https://gridmix.co.uk/api/v1/solar/intraday

# Save response to file
curl https://gridmix.co.uk/api/v1/current > grid_data.json`}</code>
              </pre>
            </div>
          )}

          {activeTab === 'go' && (
            <div className="space-y-4">
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
                <code>{`package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type GridData struct {
    Timestamp        string \`json:"timestamp"\`
    Demand          struct {
        TotalMW int \`json:"total_mw"\`
    } \`json:"demand"\`
    CarbonIntensity struct {
        Actual int    \`json:"actual"\`
        Level  string \`json:"level"\`
    } \`json:"carbon_intensity"\`
}

func getCurrentGridData() (*GridData, error) {
    resp, err := http.Get("https://gridmix.co.uk/api/v1/current")
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    var data GridData
    if err := json.Unmarshal(body, &data); err != nil {
        return nil, err
    }

    return &data, nil
}

func main() {
    data, err := getCurrentGridData()
    if err != nil {
        fmt.Println("Error:", err)
        return
    }

    fmt.Printf("Demand: %d MW\\n", data.Demand.TotalMW)
    fmt.Printf("Carbon: %d gCO2/kWh (%s)\\n",
        data.CarbonIntensity.Actual,
        data.CarbonIntensity.Level)
}`}</code>
              </pre>
            </div>
          )}
        </motion.div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-8 rounded-2xl mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Common Use Cases
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                🔋 EV Charging Optimization
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Schedule EV charging during low carbon intensity periods
              </p>
              <code className="text-sm bg-gray-800 text-green-400 p-2 rounded block">
                if (carbon {'<'} 100) chargeEV()
              </code>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-3">
                🏠 Smart Home Automation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Run appliances when grid is greenest
              </p>
              <code className="text-sm bg-gray-800 text-green-400 p-2 rounded block">
                if (renewable {'>'} 70) runDishwasher()
              </code>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3">
                📊 Data Analysis & Research
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Analyze UK energy transition trends
              </p>
              <code className="text-sm bg-gray-800 text-green-400 p-2 rounded block">
                historical = get('/historical?hours=168')
              </code>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-3">
                💰 Energy Cost Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Monitor and optimize energy costs
              </p>
              <code className="text-sm bg-gray-800 text-green-400 p-2 rounded block">
                cost = demand * price(carbon)
              </code>
            </div>
          </div>
        </motion.div>

        {/* Rate Limits & Fair Use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-8 rounded-2xl mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Fair Use Policy
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              GridMix API is <strong>free and unlimited</strong> for everyone. We trust our users to use it fairly.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>✅ No API key required</li>
              <li>✅ No request limits</li>
              <li>✅ Free for personal and commercial use</li>
              <li>✅ Cache responses for 30 seconds</li>
              <li>⚠️ Don't abuse the API (excessive requests)</li>
              <li>⚠️ Optional attribution appreciated: "Data from GridMix.co.uk"</li>
            </ul>
            <p className="text-sm">
              If you need higher throughput or have questions, contact us at{' '}
              <a href="mailto:hello@gridmix.co.uk" className="text-blue-600 dark:text-blue-400 hover:underline">
                hello@gridmix.co.uk
              </a>
            </p>
          </div>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass p-8 rounded-2xl text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Support GridMix
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            GridMix is free and open source. If you find it valuable, consider supporting
            the project to help keep it running for everyone.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="https://github.com/gridmix"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
            >
              ⭐ Star on GitHub
            </a>
            <a
              href="/support"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors inline-flex items-center gap-2"
            >
              ❤️ Support the Project
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
