'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GenerationMix, getFuelColor, formatFuelName, SolarData } from '@/lib/api';

interface EnergyMixWithSolarChartProps {
  data: GenerationMix[];
  solarData?: SolarData | null;
}

export function EnergyMixWithSolarChart({ data, solarData }: EnergyMixWithSolarChartProps) {
  // Calculate total generation from BMRS data
  const bmrsTotal = data.reduce((sum, item) => sum + item.mw, 0);

  // Add solar generation if available
  const solarMw = solarData?.generation_mw || 0;
  const totalWithSolar = bmrsTotal + solarMw;

  // Create combined data with recalculated percentages
  const combinedData = data.map(item => ({
    fuel: item.fuel,
    mw: item.mw,
    perc: totalWithSolar > 0 ? (item.mw / totalWithSolar) * 100 : 0,
  }));

  // Add solar to the mix if we have solar data
  if (solarMw > 0) {
    combinedData.push({
      fuel: 'solar',
      mw: solarMw,
      perc: (solarMw / totalWithSolar) * 100,
    });
  }

  // Filter out zero values and format for chart
  const chartData = combinedData
    .filter(item => item.perc > 0)
    .map(item => ({
      name: formatFuelName(item.fuel),
      value: item.perc,
      mw: item.mw,
      fuel: item.fuel,
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass p-3 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 dark:text-gray-100">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {payload[0].value.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {data.mw.toLocaleString()} MW
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getFuelColor(entry.fuel)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: '12px',
              paddingTop: '10px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {solarMw > 0 && (
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          Includes {solarMw.toLocaleString()} MW solar from Sheffield Solar PVLive
        </p>
      )}
    </div>
  );
}
