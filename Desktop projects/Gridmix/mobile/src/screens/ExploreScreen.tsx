import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, INTERCONNECTOR_COLORS, SHADOWS, RADIUS } from '@/constants/colors';
import { useInterconnectors } from '@/hooks/useEnergyData';
import { LoadingSpinner, ErrorMessage } from '@/components';
import { COUNTRY_FLAGS } from '@/types/energy';
import type { MainTabScreenProps } from '@/types/navigation';
import type { InterconnectorFlow } from '@/types/energy';

function formatFlow(mw: number): string {
  const abs = Math.abs(mw);
  if (abs >= 1000) {
    return `${(abs / 1000).toFixed(1)} GW`;
  }
  return `${Math.round(abs)} MW`;
}

function formatCapacity(mw: number): string {
  if (mw >= 1000) {
    return `${(mw / 1000).toFixed(1)} GW`;
  }
  return `${Math.round(mw)} MW`;
}

interface NetFlowCardProps {
  netFlow: number;
  totalImports: number;
  totalExports: number;
}

function NetFlowCard({ netFlow, totalImports, totalExports }: NetFlowCardProps) {
  const isNetImport = netFlow >= 0;
  const color = isNetImport ? INTERCONNECTOR_COLORS.import : INTERCONNECTOR_COLORS.export;
  const bgColor = isNetImport ? INTERCONNECTOR_COLORS.importLight : INTERCONNECTOR_COLORS.exportLight;

  return (
    <View
      style={[styles.netFlowCard, { backgroundColor: bgColor, borderColor: color }]}
      accessibilityRole="summary"
      accessibilityLabel={`Net flow: ${isNetImport ? 'importing' : 'exporting'} ${formatFlow(netFlow)}`}
    >
      <View style={styles.netFlowHeader}>
        <Ionicons
          name={isNetImport ? 'arrow-down-circle' : 'arrow-up-circle'}
          size={32}
          color={color}
          accessibilityElementsHidden
        />
        <View style={styles.netFlowInfo}>
          <Text style={styles.netFlowLabel}>Net Flow</Text>
          <Text style={[styles.netFlowValue, { color }]}>
            {isNetImport ? '+' : '-'}{formatFlow(netFlow)}
          </Text>
        </View>
        <View style={styles.netFlowDirection}>
          <Text style={[styles.netFlowDirectionText, { color }]}>
            {isNetImport ? 'Importing' : 'Exporting'}
          </Text>
        </View>
      </View>
      <View style={styles.netFlowStats}>
        <View style={styles.netFlowStat}>
          <Ionicons name="arrow-down" size={14} color={INTERCONNECTOR_COLORS.import} />
          <Text style={styles.netFlowStatText}>
            {formatFlow(totalImports)} in
          </Text>
        </View>
        <View style={styles.netFlowStat}>
          <Ionicons name="arrow-up" size={14} color={INTERCONNECTOR_COLORS.export} />
          <Text style={styles.netFlowStatText}>
            {formatFlow(totalExports)} out
          </Text>
        </View>
      </View>
    </View>
  );
}

interface InterconnectorCardProps {
  flow: InterconnectorFlow;
}

function InterconnectorCard({ flow }: InterconnectorCardProps) {
  const isImport = flow.direction === 'import';
  const color = isImport ? INTERCONNECTOR_COLORS.import : INTERCONNECTOR_COLORS.export;
  const bgColor = isImport ? INTERCONNECTOR_COLORS.importLight : INTERCONNECTOR_COLORS.exportLight;
  const utilization = Math.min((Math.abs(flow.flow) / flow.capacity) * 100, 100);
  const flag = COUNTRY_FLAGS[flow.name] || '🌍';

  return (
    <View
      style={styles.interconnectorCard}
      accessibilityLabel={`${flow.name}: ${isImport ? 'importing' : 'exporting'} ${formatFlow(flow.flow)}, ${Math.round(utilization)}% of ${formatCapacity(flow.capacity)} capacity`}
    >
      <View style={styles.interconnectorHeader}>
        <Text style={styles.countryFlag}>{flag}</Text>
        <View style={styles.countryInfo}>
          <Text style={styles.countryName}>{flow.name}</Text>
          <View style={styles.directionBadge}>
            <Ionicons
              name={isImport ? 'arrow-down' : 'arrow-up'}
              size={12}
              color={color}
            />
            <Text style={[styles.directionText, { color }]}>
              {isImport ? 'Import' : 'Export'}
            </Text>
          </View>
        </View>
        <Text style={[styles.flowValue, { color }]}>
          {isImport ? '+' : '-'}{formatFlow(flow.flow)}
        </Text>
      </View>

      <View style={styles.capacityBar}>
        <View style={[styles.capacityBarBg, { backgroundColor: bgColor }]}>
          <View
            style={[
              styles.capacityBarFill,
              { backgroundColor: color, width: `${utilization}%` },
            ]}
          />
        </View>
        <Text style={styles.capacityText}>
          {Math.round(utilization)}% of {formatCapacity(flow.capacity)}
        </Text>
      </View>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  count: number;
}

function SectionHeader({ title, icon, color, count }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color={color} accessibilityElementsHidden />
      <Text style={[styles.sectionTitle, { color }]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.sectionCount}>({count})</Text>
    </View>
  );
}

export function ExploreScreen({ navigation: _navigation }: MainTabScreenProps<'Explore'>) {
  const { data, isLoading, isError, error, refetch, isRefetching } = useInterconnectors();

  const { imports, exports, netFlow, totalImports, totalExports } = useMemo(() => {
    if (!data || data.length === 0) {
      return { imports: [], exports: [], netFlow: 0, totalImports: 0, totalExports: 0 };
    }

    const importFlows = data.filter(f => f.direction === 'import');
    const exportFlows = data.filter(f => f.direction === 'export');

    const totalIn = importFlows.reduce((sum, f) => sum + Math.abs(f.flow), 0);
    const totalOut = exportFlows.reduce((sum, f) => sum + Math.abs(f.flow), 0);

    return {
      imports: importFlows.sort((a, b) => Math.abs(b.flow) - Math.abs(a.flow)),
      exports: exportFlows.sort((a, b) => Math.abs(b.flow) - Math.abs(a.flow)),
      netFlow: totalIn - totalOut,
      totalImports: totalIn,
      totalExports: totalOut,
    };
  }, [data]);

  if (isLoading) {
    return <LoadingSpinner message="Loading interconnectors..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        message={error?.message || 'Failed to load interconnector data'}
        onRetry={refetch}
      />
    );
  }

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
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header">
          UK Interconnectors
        </Text>
        <Text style={styles.headerSubtitle}>
          Live power flows with Europe
        </Text>
      </View>

      {(imports.length > 0 || exports.length > 0) ? (
        <>
          <NetFlowCard
            netFlow={netFlow}
            totalImports={totalImports}
            totalExports={totalExports}
          />

          {imports.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Imports"
                icon="arrow-down-circle"
                color={INTERCONNECTOR_COLORS.import}
                count={imports.length}
              />
              {imports.map(flow => (
                <InterconnectorCard key={flow.name} flow={flow} />
              ))}
            </View>
          )}

          {exports.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Exports"
                icon="arrow-up-circle"
                color={INTERCONNECTOR_COLORS.export}
                count={exports.length}
              />
              {exports.map(flow => (
                <InterconnectorCard key={flow.name} flow={flow} />
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="swap-horizontal" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No interconnector data available</Text>
          <Text style={styles.emptySubtext}>Pull down to refresh</Text>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: INTERCONNECTOR_COLORS.import }]} />
          <Text style={styles.legendText}>Import (into GB)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: INTERCONNECTOR_COLORS.export }]} />
          <Text style={styles.legendText}>Export (from GB)</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Data source: Elexon BMRS
        </Text>
        <Text style={styles.footerText}>
          Updates every 5 minutes
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
  content: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  netFlowCard: {
    borderRadius: RADIUS.lg,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  netFlowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  netFlowInfo: {
    flex: 1,
    marginLeft: 14,
  },
  netFlowLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  netFlowValue: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  netFlowDirection: {
    alignItems: 'flex-end',
  },
  netFlowDirectionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  netFlowStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  netFlowStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  netFlowStatText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  interconnectorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  interconnectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  countryFlag: {
    fontSize: 32,
    marginRight: 14,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  directionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  flowValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  capacityBar: {
    gap: 8,
  },
  capacityBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  capacityBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  capacityText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 17,
    fontWeight: '600',
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
