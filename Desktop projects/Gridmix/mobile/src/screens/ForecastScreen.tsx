import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarbonForecast, useCleanestPeriods } from '@/hooks/useEnergyData';
import { LoadingSpinner, ErrorMessage } from '@/components';
import { COLORS, getCarbonIntensityColor } from '@/constants/colors';
import type { MainTabScreenProps } from '@/types/navigation';
import type { CarbonForecastPeriod, CleanestPeriod } from '@/types/energy';

const ITEM_HEIGHT = 36;

interface ForecastItemProps {
  period: CarbonForecastPeriod;
}

const ForecastItem = React.memo(function ForecastItem({ period }: ForecastItemProps) {
  const time = new Date(period.timestamp);
  const intensity = period.forecast;
  const color = getCarbonIntensityColor(intensity);

  return (
    <View
      style={styles.forecastItem}
      accessibilityLabel={`${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${Math.round(intensity)} grams CO2 per kilowatt hour`}
    >
      <Text style={styles.forecastTime}>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <View style={[styles.forecastBar, { backgroundColor: color + '30' }]}>
        <View
          style={[
            styles.forecastBarFill,
            {
              backgroundColor: color,
              width: `${Math.min((intensity / 400) * 100, 100)}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.forecastValue, { color }]}>
        {Math.round(intensity)}
      </Text>
    </View>
  );
});

function CleanestPeriodCard({ period }: { period: CleanestPeriod }) {
  return (
    <View style={styles.cleanestCard} accessibilityRole="summary">
      <View style={styles.cleanestHeader}>
        <Ionicons name="sunny" size={24} color={COLORS.success} accessibilityElementsHidden />
        <Text style={styles.cleanestTitle}>Greenest Time Today</Text>
      </View>
      <Text
        style={styles.cleanestTime}
        accessibilityLabel={`Best time: ${new Date(period.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${new Date(period.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
      >
        {new Date(period.start_time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
        {' - '}
        {new Date(period.end_time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      <Text style={styles.cleanestIntensity}>
        {Math.round(period.avg_intensity)} gCO2/kWh average
      </Text>
    </View>
  );
}

export function ForecastScreen({ navigation: _navigation }: MainTabScreenProps<'Forecast'>) {
  const { data: forecast, isLoading, isError, error, refetch, isRefetching } = useCarbonForecast();
  const { data: cleanestPeriods } = useCleanestPeriods();

  const renderItem = useCallback(({ item }: { item: CarbonForecastPeriod }) => (
    <ForecastItem period={item} />
  ), []);

  const keyExtractor = useCallback((item: CarbonForecastPeriod, index: number) =>
    `${item.timestamp}-${index}`, []);

  const getItemLayout = useCallback((_: ArrayLike<CarbonForecastPeriod> | null | undefined, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  if (isLoading) {
    return <LoadingSpinner message="Loading forecast..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        message={error?.message || 'Failed to load forecast'}
        onRetry={refetch}
      />
    );
  }

  const forecastData = forecast?.forecast?.slice(0, 48) || [];
  const cleanestPeriod = cleanestPeriods?.[0];

  const ListHeader = () => (
    <>
      {cleanestPeriod && <CleanestPeriodCard period={cleanestPeriod} />}
      <View style={styles.forecastHeader}>
        <Text style={styles.forecastTitle} accessibilityRole="header">48-Hour Forecast</Text>
        <Text style={styles.forecastSubtitle}>Carbon intensity (gCO₂/kWh)</Text>
      </View>
    </>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={forecastData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListHeaderComponent={ListHeader}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No forecast data available</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  cleanestCard: {
    backgroundColor: COLORS.success + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  cleanestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cleanestTitle: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cleanestTime: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  cleanestIntensity: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  forecastHeader: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  forecastTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  forecastSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
  },
  forecastTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
    width: 50,
  },
  forecastBar: {
    flex: 1,
    height: 20,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  forecastBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  forecastValue: {
    fontSize: 12,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
