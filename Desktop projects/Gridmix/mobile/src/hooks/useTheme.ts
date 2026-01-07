import { useColorScheme } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { DARK_COLORS, LIGHT_COLORS } from '../constants/colors';

export type ThemePreference = 'system' | 'dark' | 'light';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  backgroundLight: string;
  surface: string;
  surfaceLight: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  border: string;
  borderLight: string;
}

export interface ThemeContext {
  colors: ThemeColors;
  isDark: boolean;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

export function useTheme(): ThemeContext {
  const systemColorScheme = useColorScheme();
  const { settings, setSettings } = useAppStore();

  // Get theme preference from settings, default to 'system'
  const themePreference: ThemePreference = settings.themePreference || 'system';

  // Determine if we should use dark mode
  const isDark =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemColorScheme === 'dark') ||
    (themePreference === 'system' && systemColorScheme === null); // Default to dark if system is unknown

  // Get the appropriate color palette
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Function to update theme preference
  const setThemePreference = (preference: ThemePreference) => {
    setSettings({ themePreference: preference });
  };

  return {
    colors,
    isDark,
    themePreference,
    setThemePreference,
  };
}

export default useTheme;
