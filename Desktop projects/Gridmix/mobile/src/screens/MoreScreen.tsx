import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useTheme } from '@/hooks/useTheme';
import { SHADOWS, RADIUS } from '@/constants/colors';
import { HapticButton } from '@/components/HapticButton';
import type { MainTabScreenProps } from '@/types/navigation';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  colors: ReturnType<typeof useTheme>['colors'];
}

function MenuItem({ icon, title, subtitle, onPress, color, colors }: MenuItemProps) {
  const itemColor = color || colors.text;
  return (
    <HapticButton
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      hapticType="selection"
      scaleOnPress={false}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
    >
      <View style={[styles.menuIcon, { backgroundColor: itemColor + '15' }]}>
        <Ionicons name={icon} size={20} color={itemColor} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: itemColor }]}>{title}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </HapticButton>
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
  const { colors } = useTheme();
  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';

  const handleRateApp = async () => {
    const storeUrl = getStoreUrl();
    const supported = await Linking.canOpenURL(storeUrl);

    if (supported) {
      await Linking.openURL(storeUrl);
    } else {
      await Linking.openURL('https://gridmix.co.uk');
    }
  };

  const handleSendFeedback = () => {
    const subject = encodeURIComponent('GridMix App Feedback');
    const body = encodeURIComponent(`\n\n---\nApp Version: ${appVersion} (${buildNumber})\nPlatform: ${Platform.OS}`);
    Linking.openURL(`mailto:feedback@gridmix.co.uk?subject=${subject}&body=${body}`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} accessibilityLabel="More options menu">
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]} accessibilityRole="header">Settings</Text>
        <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Configure carbon alerts"
            onPress={() => navigation.navigate('Notifications')}
            colors={colors}
          />
          <MenuItem
            icon="settings-outline"
            title="Settings"
            subtitle="App preferences"
            onPress={() => navigation.navigate('Settings')}
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]} accessibilityRole="header">Information</Text>
        <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
          <MenuItem
            icon="information-circle-outline"
            title="About GridMix"
            subtitle="Learn about our data sources"
            onPress={() => navigation.navigate('About')}
            colors={colors}
          />
          <MenuItem
            icon="globe-outline"
            title="Visit Website"
            subtitle="gridmix.co.uk"
            onPress={() => Linking.openURL('https://gridmix.co.uk')}
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]} accessibilityRole="header">Support</Text>
        <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
          <MenuItem
            icon="star-outline"
            title="Rate the App"
            subtitle="Help us improve"
            onPress={handleRateApp}
            color={colors.warning}
            colors={colors}
          />
          <MenuItem
            icon="chatbubble-outline"
            title="Send Feedback"
            subtitle="We'd love to hear from you"
            onPress={handleSendFeedback}
            colors={colors}
          />
          <MenuItem
            icon="document-text-outline"
            title="Privacy Policy"
            onPress={() => Linking.openURL('https://gridmix.co.uk/privacy')}
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: colors.textMuted }]}>GridMix v{appVersion} ({buildNumber})</Text>
        <Text style={[styles.copyright, { color: colors.textMuted }]}>Data: National Grid ESO, Elexon BMRS</Text>
        <Text style={[styles.copyright, { color: colors.textMuted }]}>Made with care for the planet</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  footer: {
    alignItems: 'center',
    padding: 28,
    marginTop: 28,
    marginBottom: 40,
  },
  version: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  copyright: {
    fontSize: 12,
    marginTop: 3,
  },
});
