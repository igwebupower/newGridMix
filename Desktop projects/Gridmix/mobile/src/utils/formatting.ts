import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns';

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format power value (MW to GW if needed)
 */
export function formatPower(mw: number): string {
  if (mw >= 1000) {
    return `${(mw / 1000).toFixed(1)} GW`;
  }
  return `${Math.round(mw)} MW`;
}

/**
 * Format carbon intensity with unit
 */
export function formatCarbonIntensity(intensity: number): string {
  return `${Math.round(intensity)} gCO₂/kWh`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format time from ISO string
 */
export function formatTime(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, 'HH:mm');
}

/**
 * Format date from ISO string
 */
export function formatDate(isoString: string): string {
  const date = parseISO(isoString);

  if (isToday(date)) {
    return `Today, ${format(date, 'HH:mm')}`;
  }

  if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, 'HH:mm')}`;
  }

  return format(date, 'EEE d MMM, HH:mm');
}

/**
 * Format relative time
 */
export function formatRelativeTime(isoString: string): string {
  const date = parseISO(isoString);
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format time range
 */
export function formatTimeRange(fromIso: string, toIso: string): string {
  const from = parseISO(fromIso);
  const to = parseISO(toIso);

  return `${format(from, 'HH:mm')} - ${format(to, 'HH:mm')}`;
}

/**
 * Get greeting based on time of day
 */
export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format energy source name for display
 */
export function formatEnergySourceName(source: string): string {
  const names: Record<string, string> = {
    wind: 'Wind',
    solar: 'Solar',
    nuclear: 'Nuclear',
    gas: 'Natural Gas',
    coal: 'Coal',
    hydro: 'Hydro',
    biomass: 'Biomass',
    imports: 'Imports',
    other: 'Other',
  };

  return names[source.toLowerCase()] || source;
}
