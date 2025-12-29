import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { COLORS } from '@/constants/colors';
import type { MainTabScreenProps } from '@/types/navigation';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}

function MenuItem({ icon, title, subtitle, onPress, color = COLORS.text }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
    >
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

// Get the appropriate store URL based on platform
function getStoreUrl(): string {
  if (Platform.OS === 'ios') {
    // Replace with your actual App Store ID when published
    return 'https://apps.apple.com/app/gridmix/id0000000000';
  }
  // Replace with your actual Play Store package name
  return 'https://play.google.com/store/apps/details?id=com.gridmix.app';
}

export function MoreScreen({ navigation }: MainTabScreenProps<'More'>) {
  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';

  const handleRateApp = async () => {
    const storeUrl = getStoreUrl();
    const supported = await Linking.canOpenURL(storeUrl);

    if (supported) {
      await Linking.openURL(storeUrl);
    } else {
      // Fallback to website if store URL not available
      await Linking.openURL('https://gridmix.co.uk');
    }
  };

  const handleSendFeedback = () => {
    const subject = encodeURIComponent('GridMix App Feedback');
    const body = encodeURIComponent(`\n\n---\nApp Version: ${appVersion} (${buildNumber})\nPlatform: ${Platform.OS}`);
    Linking.openURL(`mailto:feedback@gridmix.co.uk?subject=${subject}&body=${body}`);
  };

  return (
    <ScrollView style={styles.container} accessibilityLabel="More options menu">
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">Settings</Text>
        <View style={styles.sectionContent}>
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Configure carbon alerts"
            onPress={() => navigation.navigate('Notifications')}
          />
          <MenuItem
            icon="settings-outline"
            title="Settings"
            subtitle="App preferences"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">Information</Text>
        <View style={styles.sectionContent}>
          <MenuItem
            icon="information-circle-outline"
            title="About GridMix"
            subtitle="Learn about our data sources"
            onPress={() => navigation.navigate('About')}
          />
          <MenuItem
            icon="globe-outline"
            title="Visit Website"
            subtitle="gridmix.co.uk"
            onPress={() => Linking.openURL('https://gridmix.co.uk')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">Support</Text>
        <View style={styles.sectionContent}>
          <MenuItem
            icon="star-outline"
            title="Rate the App"
            subtitle="Help us improve"
            onPress={handleRateApp}
            color={COLORS.warning}
          />
          <MenuItem
            icon="chatbubble-outline"
            title="Send Feedback"
            subtitle="We'd love to hear from you"
            onPress={handleSendFeedback}
          />
          <MenuItem
            icon="document-text-outline"
            title="Privacy Policy"
            onPress={() => Linking.openURL('https://gridmix.co.uk/privacy')}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>GridMix v{appVersion} ({buildNumber})</Text>
        <Text style={styles.copyright}>Data: National Grid ESO, Elexon BMRS</Text>
        <Text style={styles.copyright}>Made with care for the planet</Text>
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 56,
  },
  menuIcon: {
    width: 32,
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  version: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  copyright: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
