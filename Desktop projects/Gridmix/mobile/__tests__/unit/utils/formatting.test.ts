import {
  formatNumber,
  formatPower,
  formatCarbonIntensity,
  formatPercentage,
  formatTime,
  formatDate,
  formatRelativeTime,
  formatTimeRange,
  getTimeOfDayGreeting,
  formatEnergySourceName,
} from '@/utils/formatting';

describe('Formatting Utils', () => {
  describe('formatNumber', () => {
    it('formats numbers with default decimals', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('formats numbers with specified decimals', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
      expect(formatNumber(1234.5, 0)).toBe('1,235');
    });

    it('handles zero and negative numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(-1234)).toBe('-1,234');
    });
  });

  describe('formatPower', () => {
    it('formats MW values correctly', () => {
      expect(formatPower(500)).toBe('500 MW');
      expect(formatPower(999)).toBe('999 MW');
    });

    it('converts to GW for values >= 1000', () => {
      expect(formatPower(1000)).toBe('1.0 GW');
      expect(formatPower(1500)).toBe('1.5 GW');
      expect(formatPower(25000)).toBe('25.0 GW');
    });

    it('handles edge cases', () => {
      expect(formatPower(0)).toBe('0 MW');
    });
  });

  describe('formatCarbonIntensity', () => {
    it('formats intensity with unit', () => {
      expect(formatCarbonIntensity(150)).toBe('150 gCO\u2082/kWh');
      expect(formatCarbonIntensity(75.5)).toBe('76 gCO\u2082/kWh');
    });

    it('rounds to nearest integer', () => {
      expect(formatCarbonIntensity(150.4)).toBe('150 gCO\u2082/kWh');
      expect(formatCarbonIntensity(150.6)).toBe('151 gCO\u2082/kWh');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentages correctly', () => {
      expect(formatPercentage(50)).toBe('50%');
      expect(formatPercentage(33.333, 1)).toBe('33.3%');
    });

    it('handles edge values', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(100)).toBe('100%');
    });
  });

  describe('formatEnergySourceName', () => {
    it('capitalizes first letter', () => {
      expect(formatEnergySourceName('wind')).toBe('Wind');
      expect(formatEnergySourceName('solar')).toBe('Solar');
    });

    it('handles already capitalized names', () => {
      expect(formatEnergySourceName('Wind')).toBe('Wind');
    });

    it('handles special cases', () => {
      expect(formatEnergySourceName('gas')).toBe('Gas');
      expect(formatEnergySourceName('nuclear')).toBe('Nuclear');
      expect(formatEnergySourceName('biomass')).toBe('Biomass');
    });
  });
});

describe('Date/Time Formatting', () => {
  describe('formatTime', () => {
    it('formats ISO timestamp to time string', () => {
      const result = formatTime('2024-01-15T14:30:00.000Z');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatDate', () => {
    it('formats ISO timestamp to date string', () => {
      const result = formatDate('2024-01-15T14:30:00.000Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getTimeOfDayGreeting', () => {
    it('returns a greeting string', () => {
      const greeting = getTimeOfDayGreeting();
      expect(typeof greeting).toBe('string');
      expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(greeting);
    });
  });
});
