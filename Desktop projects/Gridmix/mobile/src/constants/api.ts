import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Configuration
// Set EXPO_PUBLIC_API_URL in your environment or .env file
// For development: Use your local IP or localhost
// For production: Use your deployed backend URL

// Get API URL from environment variable or use defaults
const getDevApiUrl = () => {
  // Check for environment variable first (set via EXPO_PUBLIC_API_URL)
  const envUrl = Constants.expoConfig?.extra?.apiUrl ||
                 process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) return envUrl;

  // Fallback defaults for development
  return Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : 'http://localhost:5000/api'; // Use localhost - configure device to use computer's IP
};

export const API_BASE_URL = __DEV__
  ? getDevApiUrl()
  : 'https://gridmix.co.uk/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Energy data
  energyCurrent: '/energy/current',
  energyHistory: '/energy/history',
  energyTimeseries: '/energy/timeseries',

  // Carbon forecast
  carbonForecast: '/carbon-forecast',
  carbonForecastCleanest: '/carbon-forecast/cleanest',

  // BMRS data
  bmrsGridStatus: '/bmrs/grid-status',
  bmrsFrequency: '/bmrs/frequency',
  bmrsInterconnectors: '/bmrs/interconnectors',

  // Projects
  repdProjects: '/repd/projects',
  repdLiveGeneration: '/repd/live-generation',

  // Push notifications
  notificationRegister: '/notifications/register',
  notificationPreferences: '/notifications/preferences',

  // Health
  health: '/health',
  dataSourcesStatus: '/data-sources/status',
} as const;

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  current: 5 * 60 * 1000,      // 5 minutes
  forecast: 30 * 60 * 1000,    // 30 minutes
  history: 60 * 60 * 1000,     // 1 hour
} as const;
