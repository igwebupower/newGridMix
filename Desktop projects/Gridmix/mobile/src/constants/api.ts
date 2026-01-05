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

// API Endpoints - Using v1 REST API
export const API_ENDPOINTS = {
  // v1 REST API endpoints
  current: '/v1/current',
  forecast: '/v1/forecast',
  historical: '/v1/historical',

  // Solar endpoints
  solarCurrent: '/v1/solar/current',
  solarIntraday: '/v1/solar/intraday',

  // Legacy endpoints (for backwards compatibility)
  energyCurrent: '/v1/current',
  energyHistory: '/v1/historical',
  carbonForecast: '/v1/forecast',

  // Push notifications (to be implemented)
  notificationRegister: '/notifications/register',
  notificationPreferences: '/notifications/preferences',

  // Health
  health: '/v1',
} as const;

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  current: 5 * 60 * 1000,      // 5 minutes
  forecast: 30 * 60 * 1000,    // 30 minutes
  history: 60 * 60 * 1000,     // 1 hour
} as const;
