import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useAppStore } from '@/stores';
import type { RootStackScreenProps } from '@/types/navigation';

interface SettingRowProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

function SettingRow({ title, subtitle, value, onValueChange, accessibilityLabel }: SettingRowProps) {
  return (
    <View style={styles.settingRow} accessible={true} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={COLORS.text}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

export function SettingsScreen({ navigation: _navigation }: RootStackScreenProps<'Settings'>) {
  const { settings, setSettings } = useAppStore();

  const handleDarkModeChange = (value: boolean) => {
    setSettings({ darkMode: value });
  };

  const handleAutoRefreshChange = (value: boolean) => {
    setSettings({ autoRefresh: value });
  };

  const handleReduceMotionChange = (value: boolean) => {
    setSettings({ reduceMotion: value });
  };

  return (
    <ScrollView style={styles.container} accessibilityLabel="Settings screen">
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">Display</Text>
        <View style={styles.sectionContent}>
          <SettingRow
            title="Dark Mode"
            subtitle="Use dark colour scheme"
            value={settings.darkMode}
            onValueChange={handleDarkModeChange}
            accessibilityLabel="Toggle dark mode"
          />
          <SettingRow
            title="Reduce Motion"
            subtitle="Minimise animations"
            value={settings.reduceMotion}
            onValueChange={handleReduceMotionChange}
            accessibilityLabel="Toggle reduced motion"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">Data</Text>
        <View style={styles.sectionContent}>
          <SettingRow
            title="Auto Refresh"
            subtitle="Update data every 5 minutes"
            value={settings.autoRefresh}
            onValueChange={handleAutoRefreshChange}
            accessibilityLabel="Toggle auto refresh"
          />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Settings are saved automatically to your device.
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
  section: {
    marginTop: 24,
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
  infoSection: {
    padding: 16,
    marginTop: 24,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
