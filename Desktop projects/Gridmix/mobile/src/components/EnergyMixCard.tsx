import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, ENERGY_COLORS } from '@/constants/colors';
import type { EnergyMix } from '@/types/energy';

interface EnergyMixCardProps {
  energyMix: EnergyMix;
  totalDemand: number;
}

interface EnergySourceRowProps {
  name: string;
  value: number;
  total: number;
  color: string;
}

function EnergySourceRow({ name, value, total, color }: EnergySourceRowProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.colorDot, { backgroundColor: color }]} />
        <Text style={styles.sourceName}>{name}</Text>
      </View>
      <View style={styles.rowRight}>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

export function EnergyMixCard({ energyMix, totalDemand }: EnergyMixCardProps) {
  const sources = [
    { name: 'Wind', value: energyMix.wind, color: ENERGY_COLORS.wind },
    { name: 'Solar', value: energyMix.solar, color: ENERGY_COLORS.solar },
    { name: 'Nuclear', value: energyMix.nuclear, color: ENERGY_COLORS.nuclear },
    { name: 'Gas', value: energyMix.gas, color: ENERGY_COLORS.gas },
    { name: 'Hydro', value: energyMix.hydro, color: ENERGY_COLORS.hydro },
    { name: 'Biomass', value: energyMix.biomass, color: ENERGY_COLORS.biomass },
    { name: 'Imports', value: energyMix.imports, color: ENERGY_COLORS.imports },
    { name: 'Coal', value: energyMix.coal, color: ENERGY_COLORS.coal },
  ].filter(s => s.value > 0).sort((a, b) => b.value - a.value);

  const renewableTotal = energyMix.wind + energyMix.solar + energyMix.hydro + energyMix.biomass;
  const renewablePercentage = totalDemand > 0 ? (renewableTotal / totalDemand) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Energy Mix</Text>
        <View style={styles.renewableBadge}>
          <Text style={styles.renewableText}>
            {renewablePercentage.toFixed(1)}% Renewable
          </Text>
        </View>
      </View>

      <View style={styles.demandRow}>
        <Text style={styles.demandLabel}>Total Demand</Text>
        <Text style={styles.demandValue}>
          {(totalDemand / 1000).toFixed(1)} GW
        </Text>
      </View>

      <View style={styles.sourcesContainer}>
        {sources.map((source) => (
          <EnergySourceRow
            key={source.name}
            name={source.name}
            value={source.value}
            total={totalDemand}
            color={source.color}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  renewableBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  renewableText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
  },
  demandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  demandLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  demandValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  sourcesContainer: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  sourceName: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  rowRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    width: 50,
    textAlign: 'right',
  },
});
