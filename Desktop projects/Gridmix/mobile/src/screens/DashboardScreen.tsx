import React from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { useCurrentEnergy, useCarbonForecast } from '@/hooks/useEnergyData';
import {
  LoadingSpinner,
  ErrorMessage,
  GridStatusCard,
  QuickStatsRow,
  ContextCard,
  EnergyMixBars,
  ForecastDots,
  ShareButton,
} from '@/components';
import { COLORS } from '@/constants/colors';
import type { MainTabScreenProps } from '@/types/navigation';

export function DashboardScreen({ navigation }: MainTabScreenProps<'Dashboard'>) {
  const { data, isLoading, isError, error, refetch, isRefetching } = useCurrentEnergy();
  const { data: forecastData } = useCarbonForecast();

  if (isLoading) {
    return <LoadingSpinner message="Loading grid data..." />;
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
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
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
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 32,
  },
  headerRow: {
    position: 'relative',
  },
  shareContainer: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 10,
  },
  section: {
    marginVertical: 8,
  },
});
