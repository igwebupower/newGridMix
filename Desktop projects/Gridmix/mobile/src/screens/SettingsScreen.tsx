import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, ThemePreference } from '@/hooks/useTheme';
import { useAppStore } from '@/stores';
import type { RootStackScreenProps } from '@/types/navigation';

interface SettingRowProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  colors: ReturnType<typeof useTheme>['colors'];
}

function SettingRow({ title, subtitle, value, onValueChange, accessibilityLabel, colors }: SettingRowProps) {
  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]} accessible={true} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.text}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

interface ThemeOptionProps {
  label: string;
  value: ThemePreference;
  currentValue: ThemePreference;
  onSelect: (value: ThemePreference) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}

function ThemeOption({ label, value, currentValue, onSelect, colors }: ThemeOptionProps) {
  const isSelected = value === currentValue;
  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        { borderColor: isSelected ? colors.primary : colors.border },
        isSelected && { backgroundColor: colors.primary + '20' },
      ]}
      onPress={() => onSelect(value)}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${label} theme${isSelected ? ', selected' : ''}`}
    >
      <Text style={[styles.themeOptionText, { color: isSelected ? colors.primary : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function SettingsScreen({ navigation: _navigation }: RootStackScreenProps<'Settings'>) {
  const { colors, themePreference, setThemePreference } = useTheme();
  const { settings, setSettings } = useAppStore();

  const handleAutoRefreshChange = (value: boolean) => {
    setSettings({ autoRefresh: value });
  };

  const handleReduceMotionChange = (value: boolean) => {
    setSettings({ reduceMotion: value });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} accessibilityLabel="Settings screen">
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]} accessibilityRole="header">Appearance</Text>
        <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
          <View style={styles.themeSection}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Theme</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Choose your preferred appearance</Text>
            <View style={styles.themeOptions}>
              <ThemeOption
                label="System"
                value="system"
                currentValue={themePreference}
                onSelect={setThemePreference}
                colors={colors}
              />
              <ThemeOption
                label="Light"
                value="light"
                currentValue={themePreference}
                onSelect={setThemePreference}
                colors={colors}
              />
              <ThemeOption
                label="Dark"
                value="dark"
                currentValue={themePreference}
                onSelect={setThemePreference}
                colors={colors}
              />
            </View>
          </View>
          <SettingRow
            title="Reduce Motion"
            subtitle="Minimise animations"
            value={settings.reduceMotion}
            onValueChange={handleReduceMotionChange}
            accessibilityLabel="Toggle reduced motion"
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]} accessibilityRole="header">Data</Text>
        <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
          <SettingRow
            title="Auto Refresh"
            subtitle="Update data every 5 minutes"
            value={settings.autoRefresh}
            onValueChange={handleAutoRefreshChange}
            accessibilityLabel="Toggle auto refresh"
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          Settings are saved automatically to your device.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  themeSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  themeOptions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
    marginTop: 24,
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
