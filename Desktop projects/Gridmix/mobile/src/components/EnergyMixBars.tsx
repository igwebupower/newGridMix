import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ENERGY_COLORS } from '@/constants/colors';
import type { EnergyMix } from '@/types/energy';

interface EnergyMixBarsProps {
  energyMix: EnergyMix;
  totalDemand: number;
}

const SOURCE_INFO: Record<string, { name: string; description: string; icon: string }> = {
  wind: {
    name: 'Wind',
    description: 'Electricity from onshore and offshore wind turbines. The UK is a world leader in offshore wind, with major farms in the North Sea.',
    icon: 'cloudy',
  },
  solar: {
    name: 'Solar',
    description: 'Electricity from photovoltaic panels. Generation peaks in summer midday and drops to near zero at night.',
    icon: 'sunny',
  },
  nuclear: {
    name: 'Nuclear',
    description: 'Baseload power from nuclear reactors. Low-carbon but not renewable. Provides steady output regardless of weather.',
    icon: 'flash',
  },
  gas: {
    name: 'Gas',
    description: 'Natural gas power stations. Flexible generation that ramps up when renewables drop. Main source of grid carbon emissions.',
    icon: 'flame',
  },
  hydro: {
    name: 'Hydro',
    description: 'Hydroelectric power from dams and pumped storage. Includes fast-response plants that help balance the grid.',
    icon: 'water',
  },
  biomass: {
    name: 'Biomass',
    description: 'Power from burning organic materials like wood pellets. Classified as renewable but has sustainability debates.',
    icon: 'leaf',
  },
  imports: {
    name: 'Imports',
    description: 'Electricity imported via interconnectors from France, Belgium, Netherlands, Norway, and Ireland.',
    icon: 'swap-horizontal',
  },
  coal: {
    name: 'Coal',
    description: 'Coal-fired power stations. Nearly phased out in the UK, only used during extreme demand.',
    icon: 'cube',
  },
};

export function EnergyMixBars({ energyMix, totalDemand }: EnergyMixBarsProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const sources = [
    { key: 'wind', value: energyMix.wind, color: ENERGY_COLORS.wind },
    { key: 'solar', value: energyMix.solar, color: ENERGY_COLORS.solar },
    { key: 'nuclear', value: energyMix.nuclear, color: ENERGY_COLORS.nuclear },
    { key: 'gas', value: energyMix.gas, color: ENERGY_COLORS.gas },
    { key: 'hydro', value: energyMix.hydro, color: ENERGY_COLORS.hydro },
    { key: 'biomass', value: energyMix.biomass, color: ENERGY_COLORS.biomass },
    { key: 'imports', value: energyMix.imports, color: ENERGY_COLORS.imports },
    { key: 'coal', value: energyMix.coal, color: ENERGY_COLORS.coal },
  ]
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Show top 6

  const renewableTotal = energyMix.wind + energyMix.solar + energyMix.hydro;
  const renewablePercent = totalDemand > 0 ? (renewableTotal / totalDemand) * 100 : 0;
  const lowCarbonTotal = renewableTotal + energyMix.nuclear + energyMix.biomass;
  const lowCarbonPercent = totalDemand > 0 ? (lowCarbonTotal / totalDemand) * 100 : 0;

  const selectedInfo = selectedSource ? SOURCE_INFO[selectedSource] : null;
  const selectedData = selectedSource
    ? sources.find((s) => s.key === selectedSource)
    : null;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Generation Mix</Text>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setSelectedSource('_overview')}
          >
            <Ionicons name="information-circle-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{renewablePercent.toFixed(0)}%</Text>
            <Text style={styles.summaryLabel}>Renewable</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{lowCarbonPercent.toFixed(0)}%</Text>
            <Text style={styles.summaryLabel}>Low Carbon</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{(totalDemand / 1000).toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>GW Total</Text>
          </View>
        </View>

        <View style={styles.barsContainer}>
          {sources.map((source) => {
            const percent = totalDemand > 0 ? (source.value / totalDemand) * 100 : 0;
            const info = SOURCE_INFO[source.key];
            return (
              <TouchableOpacity
                key={source.key}
                style={styles.barRow}
                onPress={() => setSelectedSource(source.key)}
                activeOpacity={0.7}
              >
                <View style={styles.barLabel}>
                  <Ionicons
                    name={info?.icon as any}
                    size={14}
                    color={source.color}
                  />
                  <Text style={styles.barLabelText}>{info?.name || source.key}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: source.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barPercent}>{percent.toFixed(0)}%</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Modal
        visible={selectedSource !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSource(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedSource(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {selectedSource === '_overview' ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Generation Mix</Text>
                  <TouchableOpacity onPress={() => setSelectedSource(null)}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalDescription}>
                  This shows how UK electricity is being generated right now. The mix changes constantly based on weather, demand, and plant availability.
                </Text>
                <Text style={styles.modalDescription}>
                  Renewable sources (wind, solar, hydro) produce zero operational carbon. Nuclear is low-carbon but not classified as renewable. Gas provides flexible backup but is the main source of emissions.
                </Text>
              </>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Ionicons
                      name={selectedInfo?.icon as any}
                      size={24}
                      color={selectedData?.color}
                    />
                    <Text style={styles.modalTitle}>{selectedInfo?.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedSource(null)}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
                {selectedData && (
                  <View style={styles.modalStats}>
                    <Text style={[styles.modalValue, { color: selectedData.color }]}>
                      {((selectedData.value / totalDemand) * 100).toFixed(1)}%
                    </Text>
                    <Text style={styles.modalUnit}>
                      {(selectedData.value / 1000).toFixed(2)} GW
                    </Text>
                  </View>
                )}
                <Text style={styles.modalDescription}>{selectedInfo?.description}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedSource(null)}
            >
              <Text style={styles.closeButtonText}>Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  infoButton: {
    padding: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  barsContainer: {
    gap: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    gap: 6,
  },
  barLabelText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barPercent: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
    width: 36,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  modalStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  modalValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  modalUnit: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  modalDescription: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
