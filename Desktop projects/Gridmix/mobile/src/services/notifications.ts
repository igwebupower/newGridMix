import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { registerPushToken } from './api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPreferences {
  lowCarbonAlerts: boolean;
  dailySummary: boolean;
  threshold: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "07:00"
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  lowCarbonAlerts: true,
  dailySummary: true,
  threshold: 100,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

/**
 * Request permission and register for push notifications
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Push notifications require a physical device');
    }
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Push notification permission denied');
    }
    return null;
  }

  // Get the Expo push token
  // Note: In development, this may fail without EAS configuration
  let token;
  try {
    token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID || undefined,
    });
  } catch (error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Push token registration skipped (EAS not configured):', error);
    }
    return null;
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('carbon-alerts', {
      name: 'Carbon Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#06B6D4',
    });

    await Notifications.setNotificationChannelAsync('daily-summary', {
      name: 'Daily Summary',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // Register token with backend
  try {
    await registerPushToken(token.data, Platform.OS as 'ios' | 'android');
  } catch (error) {
    console.error('Failed to register push token with backend:', error);
  }

  return token.data;
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds: number = 5
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      seconds,
    },
  });

  return id;
}

/**
 * Schedule daily summary notification
 */
export async function scheduleDailySummary(hour: number = 7, minute: number = 0): Promise<string> {
  // Cancel any existing daily summary
  await Notifications.cancelScheduledNotificationAsync('daily-summary');

  const id = await Notifications.scheduleNotificationAsync({
    identifier: 'daily-summary',
    content: {
      title: '☀️ Good morning!',
      body: 'Check the greenest hours for today',
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  return id;
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener (when app is in foreground)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}
