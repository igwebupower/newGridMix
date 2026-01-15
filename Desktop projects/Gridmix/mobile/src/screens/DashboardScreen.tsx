import React from 'react';
import { ScrollView, RefreshControl, StyleSheet, View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentEnergy, useCarbonForecast, useSystemPrice, useFrequency } from '@/hooks/useEnergyData';
import { useTheme } from '@/hooks/useTheme';
import {
  ErrorMessage,
  GridStatusCard,
  QuickStatsRow,
  ContextCard,
  EnergyMixBars,
  ForecastDots,
  ShareButton,
  DashboardSkeleton,
} from '@/components';
import type { MainTabScreenProps } from '@/types/navigation';

export function DashboardScreen({ navigation }: MainTabScreenProps<'Dashboard'>) {
  const { colors } = useTheme();
  const { data, isLoading, isError, error, refetch, isRefetching } = useCurrentEnergy();
  const { data: forecastData } = useCarbonForecast();
  const { data: systemPrice } = useSystemPrice();
  const { data: frequencyData } = useFrequency();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <ErrorMessage
        message={error?.message || 'Failed to load energy data'}
        onRetry={refetch}
      />
    );
  }

  if (!data) {
    return <ErrorMessage message="No data available" onRetry={refetch} />;
  }

  const { energyMix, totalDemand, carbonIntensity, timestamp } = data;

  const renewableTotal = energyMix.wind + energyMix.solar + energyMix.hydro;
  const renewablePercent = totalDemand > 0 ? (renewableTotal / totalDemand) * 100 : 0;
  const windPercent = totalDemand > 0 ? (energyMix.wind / totalDemand) * 100 : 0;

  // Estimate demand change based on typical patterns
  // In production, this would come from historical comparison API
  const hour = new Date().getHours();
  const isEvening = hour >= 17 && hour <= 20;
  const isMorning = hour >= 7 && hour <= 9;
  const demandChange = isEvening ? 8 : isMorning ? 5 : -3;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.headerRow}>
        <GridStatusCard
          demand={totalDemand}
          supply={totalDemand * 1.05}
          lastUpdated={new Date(timestamp)}
        />
        <View style={styles.shareContainer}>
          <ShareButton
            carbonIntensity={carbonIntensity}
            renewablePercent={renewablePercent}
            totalDemand={totalDemand}
          />
        </View>
      </View>

      <View style={styles.section}>
        <QuickStatsRow
          demand={totalDemand}
          demandChange={demandChange}
          carbonIntensity={carbonIntensity}
          renewablePercent={renewablePercent}
        />
      </View>

      {/* Market & Grid Section */}
      <View style={styles.marketSection}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Market & Grid</Text>
        <View style={styles.marketRow}>
          {/* System Price */}
          <View style={[styles.marketCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.marketIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.marketLabel, { color: colors.textSecondary }]}>System Price</Text>
            <Text style={[
              styles.marketValue,
              { color: systemPrice && systemPrice.price > 100 ? colors.error :
                       systemPrice && systemPrice.price > 50 ? colors.warning : colors.success }
            ]}>
              £{systemPrice?.price.toFixed(2) ?? '--'}
            </Text>
            <Text style={[styles.marketUnit, { color: colors.textMuted }]}>/MWh</Text>
          </View>

          {/* Grid Frequency */}
          <View style={[styles.marketCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.marketIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="pulse-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.marketLabel, { color: colors.textSecondary }]}>Frequency</Text>
            <Text style={[
              styles.marketValue,
              { color: frequencyData && (frequencyData.hz < 49.9 || frequencyData.hz > 50.1)
                ? colors.warning : colors.success }
            ]}>
              {frequencyData?.hz.toFixed(3) ?? '--'}
            </Text>
            <Text style={[styles.marketUnit, { color: colors.textMuted }]}>Hz</Text>
          </View>
        </View>
      </View>

      <ContextCard
        demand={totalDemand}
        demandChange={demandChange}
        carbonIntensity={carbonIntensity}
        renewablePercent={renewablePercent}
        windPercent={windPercent}
      />

      <EnergyMixBars energyMix={energyMix} totalDemand={totalDemand} />

      {forecastData?.forecast && forecastData.forecast.length > 0 && (
        <ForecastDots
          forecast={forecastData.forecast}
          onPress={() => navigation.navigate('Forecast')}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
  },
  headerRow: {
    position: 'relative',
  },
  shareContainer: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    zIndex: 10,
  },
  section: {
    marginVertical: 8,
  },
  marketSection: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  marketRow: {
    flexDirection: 'row',
    gap: 12,
  },
  marketCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  marketIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  marketLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  marketValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  marketUnit: {
    fontSize: 11,
    marginTop: 2,
  },
});
