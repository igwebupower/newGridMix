import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ExplainableMetric } from './ExplainableMetric';
import { COLORS, getCarbonIntensityColor } from '@/constants/colors';

interface QuickStatsRowProps {
  demand: number;
  demandChange: number;
  carbonIntensity: number;
  renewablePercent: number;
}

export function QuickStatsRow({
  demand,
  demandChange,
  carbonIntensity,
  renewablePercent,
}: QuickStatsRowProps) {
  const demandGW = (demand / 1000).toFixed(1);
  const changeSign = demandChange >= 0 ? '+' : '';
  const demandTrend = demandChange > 2 ? 'up' : demandChange < -2 ? 'down' : 'stable';

  return (
    <View style={styles.container}>
      <ExplainableMetric
        value={demandGW}
        label="Demand"
        unit="GW"
        explanation="Total electricity demand across Great Britain right now. This is the amount of power being consumed by homes, businesses, and industry."
        comparison={{
          value: `${changeSign}${demandChange.toFixed(0)}%`,
          trend: demandTrend,
          context: demandChange > 0
            ? 'Higher than usual for this time of day'
            : 'Lower than usual for this time of day',
        }}
      />

      <ExplainableMetric
        value={Math.round(carbonIntensity)}
        label="Carbon"
        unit="gCO2/kWh"
        color={getCarbonIntensityColor(carbonIntensity)}
        explanation="Grams of CO2 emitted per kilowatt-hour of electricity. Lower is cleaner. Under 100 is very clean, over 250 means fossil fuels are dominant."
        comparison={{
          value: carbonIntensity < 150 ? 'Clean' : carbonIntensity < 250 ? 'Moderate' : 'High',
          trend: carbonIntensity < 150 ? 'down' : carbonIntensity < 250 ? 'stable' : 'up',
          context: carbonIntensity < 150
            ? 'Good time to use electricity'
            : carbonIntensity < 250
            ? 'Average carbon intensity'
            : 'Consider delaying high-energy tasks',
        }}
      />

      <ExplainableMetric
        value={renewablePercent.toFixed(0)}
        label="Renewable"
        unit="%"
        color={renewablePercent > 50 ? COLORS.success : COLORS.textSecondary}
        explanation="Percentage of current electricity generation from renewable sources: wind, solar, and hydro. Does not include nuclear, which is low-carbon but not renewable."
        comparison={{
          value: renewablePercent > 50 ? 'High' : renewablePercent > 30 ? 'Moderate' : 'Low',
          trend: renewablePercent > 50 ? 'down' : renewablePercent > 30 ? 'stable' : 'up',
          context: renewablePercent > 50
            ? 'Renewables are leading generation'
            : 'Fossil fuels still significant',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
});
