'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GenerationMix, getFuelColor, formatFuelName } from '@/lib/api';

interface EnergyMixChartProps {
  data: GenerationMix[];
}

export function EnergyMixChart({ data }: EnergyMixChartProps) {
  // Filter out zero values and format for chart
  const chartData = data
    .filter(item => item.perc > 0)
    .map(item => ({
      name: formatFuelName(item.fuel),
      value: item.perc,
      fuel: item.fuel,
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 dark:text-gray-100">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {payload[0].value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
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
  );
}
