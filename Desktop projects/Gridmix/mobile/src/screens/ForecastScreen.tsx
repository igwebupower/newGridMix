import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useCarbonForecast, useCleanestPeriods } from '@/hooks/useEnergyData';
import { LoadingSpinner, ErrorMessage } from '@/components';
import { COLORS, SHADOWS, RADIUS, getCarbonIntensityColor } from '@/constants/colors';
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
  const intensityColor = getCarbonIntensityColor(period.avg_intensity);

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[
        styles.cleanestCard,
        {
          backgroundColor: intensityColor + '15',
          borderColor: intensityColor + '30',
        },
      ]}
      accessibilityRole="summary"
    >
      <View style={styles.cleanestHeader}>
        <View style={[styles.cleanestIconContainer, { backgroundColor: intensityColor + '20' }]}>
          <Ionicons name="leaf" size={24} color={intensityColor} accessibilityElementsHidden />
        </View>
        <Text style={[styles.cleanestTitle, { color: intensityColor }]}>Greenest Time Today</Text>
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
      <Text style={[styles.cleanestIntensity, { color: intensityColor }]}>
        {Math.round(period.avg_intensity)} gCO2/kWh average
      </Text>
    </Animated.View>
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
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
  },
  cleanestCard: {
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  cleanestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cleanestIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cleanestTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  cleanestTime: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 6,
    fontVariant: ['tabular-nums'],
  },
  cleanestIntensity: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  forecastHeader: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    ...SHADOWS.small,
  },
  forecastTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  forecastSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
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
    fontSize: 13,
    width: 55,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  forecastBar: {
    flex: 1,
    height: 22,
    borderRadius: 6,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  forecastBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  forecastValue: {
    fontSize: 13,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 15,
  },
});
