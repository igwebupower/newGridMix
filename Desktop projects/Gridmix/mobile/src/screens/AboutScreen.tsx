import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { RootStackScreenProps } from '@/types/navigation';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const gridmixLogo = require('../../assets/images/gridmix-logo.png');

export function AboutScreen({ navigation: _navigation }: RootStackScreenProps<'About'>) {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Image
          source={gridmixLogo}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="GridMix logo"
        />
        <Text style={[styles.title, { color: colors.text }]}>GridMix</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>UK Carbon Intensity Tracker</Text>
        <Text style={[styles.version, { color: colors.textMuted }]}>Version 1.0.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>About</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            GridMix shows what is happening on the UK electricity grid in real time, from carbon
            intensity and energy mix to interconnectors and live forecasts.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Data Sources</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.sourceItem, { borderBottomColor: colors.border }]}
            onPress={() => Linking.openURL('https://www.elexon.co.uk/operations-settlement/bsc-central-services/bmrs/')}
          >
            <View style={styles.sourceInfo}>
              <Text style={[styles.sourceName, { color: colors.text }]}>Elexon BMRS</Text>
              <Text style={[styles.sourceDesc, { color: colors.textSecondary }]}>Grid mix, frequency, demand, interconnectors</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sourceItem, { borderBottomColor: colors.border }]}
            onPress={() => Linking.openURL('https://www.solar.sheffield.ac.uk/pvlive/')}
          >
            <View style={styles.sourceInfo}>
              <Text style={[styles.sourceName, { color: colors.text }]}>Sheffield Solar PVLive</Text>
              <Text style={[styles.sourceDesc, { color: colors.textSecondary }]}>Real-time solar generation data</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Why It Matters</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            The carbon intensity of electricity varies throughout the day based on the mix of
            generation sources. By shifting energy use to times when renewables are generating
            more power, you can reduce your carbon footprint without changing how much energy
            you use.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Made with 💚 for a greener future
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://gridmix.co.uk')}>
          <Text style={[styles.footerLink, { color: colors.primary }]}>gridmix.co.uk</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  version: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  sourceDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500',
  },
});
