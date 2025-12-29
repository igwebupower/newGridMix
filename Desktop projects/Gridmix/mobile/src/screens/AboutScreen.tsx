import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { RootStackScreenProps } from '@/types/navigation';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const gridmixLogo = require('../../assets/images/gridmix-logo.png');

export function AboutScreen({ navigation: _navigation }: RootStackScreenProps<'About'>) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={gridmixLogo}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="GridMix logo"
        />
        <Text style={styles.title}>GridMix</Text>
        <Text style={styles.subtitle}>UK Carbon Intensity Tracker</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.paragraph}>
            GridMix shows what's happening on the UK electricity grid in real time, from carbon
            intensity and energy mix to interconnectors and live forecasts.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Sources</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.sourceItem}
            onPress={() => Linking.openURL('https://carbonintensity.org.uk')}
          >
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>Carbon Intensity API</Text>
              <Text style={styles.sourceDesc}>National Grid ESO</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sourceItem}
            onPress={() => Linking.openURL('https://www.elexon.co.uk/operations-settlement/bsc-central-services/bmrs/')}
          >
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>BMRS</Text>
              <Text style={styles.sourceDesc}>Elexon Balancing Mechanism</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sourceItem}
            onPress={() => Linking.openURL('https://www.gov.uk/government/publications/renewable-energy-planning-database-monthly-extract')}
          >
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>REPD</Text>
              <Text style={styles.sourceDesc}>Renewable Energy Planning Database</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why It Matters</Text>
        <View style={styles.card}>
          <Text style={styles.paragraph}>
            The carbon intensity of electricity varies throughout the day based on the mix of
            generation sources. By shifting energy use to times when renewables are generating
            more power, you can reduce your carbon footprint without changing how much energy
            you use.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with 💚 for a greener future
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://gridmix.co.uk')}>
          <Text style={styles.footerLink}>gridmix.co.uk</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 8,
  },
  version: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  paragraph: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  sourceDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
