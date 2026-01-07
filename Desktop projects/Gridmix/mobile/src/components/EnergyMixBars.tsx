import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ENERGY_COLORS, SHADOWS, RADIUS } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { HapticButton, HapticCard } from './HapticButton';
import type { EnergyMix } from '@/types/energy';

// Animated progress bar component
interface AnimatedBarProps {
  percent: number;
  color: string;
  delay?: number;
  trackColor: string;
}

function AnimatedBar({ percent, color, delay = 0, trackColor }: AnimatedBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(Math.min(percent, 100), {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [percent, delay, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
      <Animated.View
        style={[styles.barFill, { backgroundColor: color }, animatedStyle]}
      />
    </View>
  );
}

interface EnergyMixBarsProps {
  energyMix: EnergyMix;
  totalDemand: number;
}

const SOURCE_INFO: Record<string, { name: string; description: string; icon: keyof typeof Ionicons.glyphMap }> = {
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
  const { colors } = useTheme();
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
      <Animated.View entering={FadeIn.duration(400).delay(200)} style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Generation Mix</Text>
          <HapticButton
            style={styles.infoButton}
            onPress={() => setSelectedSource('_overview')}
            hapticType="light"
            scaleOnPress={false}
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          </HapticButton>
        </View>

        <View style={[styles.summaryRow, { backgroundColor: colors.background }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{renewablePercent.toFixed(0)}%</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Renewable</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{lowCarbonPercent.toFixed(0)}%</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Low Carbon</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{(totalDemand / 1000).toFixed(1)}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>GW Total</Text>
          </View>
        </View>

        <View style={styles.barsContainer}>
          {sources.map((source, index) => {
            const percent = totalDemand > 0 ? (source.value / totalDemand) * 100 : 0;
            const info = SOURCE_INFO[source.key];
            return (
              <Animated.View
                key={source.key}
                entering={FadeInRight.duration(400).delay(80 * index).springify().damping(15)}
              >
                <HapticCard
                  style={styles.barRow}
                  onPress={() => setSelectedSource(source.key)}
                  hapticType="selection"
                >
                  <View style={styles.barLabel}>
                    <View style={[styles.sourceIcon, { backgroundColor: source.color + '20' }]}>
                      <Ionicons
                        name={info?.icon ?? 'ellipse'}
                        size={14}
                        color={source.color}
                      />
                    </View>
                    <Text style={[styles.barLabelText, { color: colors.textSecondary }]}>{info?.name || source.key}</Text>
                  </View>
                  <AnimatedBar
                    percent={percent}
                    color={source.color}
                    delay={80 * index}
                    trackColor={colors.border}
                  />
                  <Text style={[styles.barPercent, { color: source.color }]}>{percent.toFixed(0)}%</Text>
                </HapticCard>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

      <Modal
        visible={selectedSource !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSource(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedSource(null)}>
          <Animated.View
            entering={FadeInDown.duration(300).springify()}
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {selectedSource === '_overview' ? (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Generation Mix</Text>
                    <HapticButton onPress={() => setSelectedSource(null)} hapticType="light">
                      <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                    </HapticButton>
                  </View>
                  <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                    This shows how UK electricity is being generated right now. The mix changes constantly based on weather, demand, and plant availability.
                  </Text>
                  <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                    Renewable sources (wind, solar, hydro) produce zero operational carbon. Nuclear is low-carbon but not classified as renewable. Gas provides flexible backup but is the main source of emissions.
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleRow}>
                      <View style={[styles.modalIcon, { backgroundColor: (selectedData?.color || colors.primary) + '20' }]}>
                        <Ionicons
                          name={selectedInfo?.icon ?? 'ellipse'}
                          size={24}
                          color={selectedData?.color}
                        />
                      </View>
                      <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedInfo?.name}</Text>
                    </View>
                    <HapticButton onPress={() => setSelectedSource(null)} hapticType="light">
                      <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                    </HapticButton>
                  </View>
                  {selectedData && (
                    <View style={styles.modalStats}>
                      <Text style={[styles.modalValue, { color: selectedData.color }]}>
                        {((selectedData.value / totalDemand) * 100).toFixed(1)}%
                      </Text>
                      <Text style={[styles.modalUnit, { color: colors.textSecondary }]}>
                        {(selectedData.value / 1000).toFixed(2)} GW
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>{selectedInfo?.description}</Text>
                </>
              )}
              <HapticButton
                style={[styles.closeButton, { backgroundColor: colors.primary }]}
                onPress={() => setSelectedSource(null)}
                hapticType="light"
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>Got it</Text>
              </HapticButton>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  infoButton: {
    padding: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  divider: {
    width: 1,
  },
  barsContainer: {
    gap: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    gap: 8,
  },
  sourceIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barLabelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barPercent: {
    fontSize: 14,
    fontWeight: '700',
    width: 40,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: RADIUS.xl,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 20,
  },
  modalValue: {
    fontSize: 38,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  modalUnit: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  closeButton: {
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
