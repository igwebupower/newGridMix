import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getCarbonIntensityColor } from '@/constants/colors';
import { useNotificationStore } from '@/stores';
import type { RootStackScreenProps } from '@/types/navigation';

export function NotificationsScreen({ navigation: _navigation }: RootStackScreenProps<'Notifications'>) {
  const { preferences, setPreferences, permissionStatus } = useNotificationStore();

  const handleLowCarbonAlertsChange = (value: boolean) => {
    setPreferences({ lowCarbonAlerts: value });
  };

  const handleDailySummaryChange = (value: boolean) => {
    setPreferences({ dailySummary: value });
  };

  const handleThresholdChange = (value: number) => {
    setPreferences({ threshold: Math.round(value) });
  };

  const thresholdColor = getCarbonIntensityColor(preferences.threshold);

  return (
    <ScrollView style={styles.container} accessibilityLabel="Notification settings screen">
      <View style={styles.heroSection}>
        <View style={styles.bellContainer} accessibilityElementsHidden={true}>
          <Ionicons name="notifications" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.heroTitle} accessibilityRole="header">Stay Informed</Text>
        <Text style={styles.heroSubtitle}>
          Get notified when carbon intensity is low so you can use energy at the greenest times.
        </Text>
      </View>

      {permissionStatus === 'denied' && (
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Notifications are disabled. Please enable them in your device settings.
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">Alert Types</Text>
        <View style={styles.sectionContent}>
          <View style={styles.settingRow} accessible={true} accessibilityRole="switch" accessibilityState={{ checked: preferences.lowCarbonAlerts }}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Low Carbon Alerts</Text>
              <Text style={styles.settingSubtitle}>
                Notify when carbon intensity drops below threshold
              </Text>
            </View>
            <Switch
              value={preferences.lowCarbonAlerts}
              onValueChange={handleLowCarbonAlertsChange}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text}
              accessibilityLabel="Toggle low carbon alerts"
            />
          </View>

          <View style={styles.settingRow} accessible={true} accessibilityRole="switch" accessibilityState={{ checked: preferences.dailySummary }}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Daily Summary</Text>
              <Text style={styles.settingSubtitle}>
                Get a morning briefing with today&apos;s greenest hours
              </Text>
            </View>
            <Switch
              value={preferences.dailySummary}
              onValueChange={handleDailySummaryChange}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.text}
              accessibilityLabel="Toggle daily summary notifications"
            />
          </View>
        </View>
      </View>

      {preferences.lowCarbonAlerts && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">Carbon Threshold</Text>
          <View style={styles.thresholdCard}>
            <Text style={styles.thresholdLabel}>Alert me when intensity is below:</Text>
            <Text
              style={[styles.thresholdValue, { color: thresholdColor }]}
              accessibilityLabel={`${Math.round(preferences.threshold)} grams CO2 per kilowatt hour`}
            >
              {Math.round(preferences.threshold)} gCO₂/kWh
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel} accessibilityElementsHidden={true}>50</Text>
              <Slider
                style={styles.slider}
                minimumValue={50}
                maximumValue={300}
                value={preferences.threshold}
                onValueChange={handleThresholdChange}
                minimumTrackTintColor={thresholdColor}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={Platform.OS === 'ios' ? undefined : thresholdColor}
                accessibilityLabel="Carbon intensity threshold slider"
                accessibilityValue={{
                  min: 50,
                  max: 300,
                  now: preferences.threshold,
                  text: `${Math.round(preferences.threshold)} grams CO2 per kilowatt hour`,
                }}
              />
              <Text style={styles.sliderLabel} accessibilityElementsHidden={true}>300</Text>
            </View>
            <Text style={styles.thresholdHint}>
              Lower values = fewer but greener notifications
            </Text>
          </View>
        </View>
      )}

      <View style={styles.infoSection}>
        <Ionicons name="information-circle" size={20} color={COLORS.textMuted} accessibilityElementsHidden={true} />
        <Text style={styles.infoText}>
          Notifications require permission. You can manage this in your device settings.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroSection: {
    alignItems: 'center',
    padding: 24,
  },
  bellContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    color: COLORS.warning,
    fontSize: 13,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  thresholdCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
  },
  thresholdLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  thresholdValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    width: 30,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  thresholdHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
