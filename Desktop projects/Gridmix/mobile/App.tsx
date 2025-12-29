import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';

import { RootNavigator } from './src/navigation';
import { ErrorBoundary, OfflineBanner } from './src/components';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from './src/services/notifications';
import { useNotificationStore } from './src/stores';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Configure React Query with offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep data cached for offline
      networkMode: 'offlineFirst', // Use cached data when offline
      refetchOnReconnect: true,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Set up online/offline detection for React Query
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

function AppContent() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { setPushToken, setPermissionStatus } = useNotificationStore();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Set up network status monitoring
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    // Register for push notifications
    registerForPushNotifications().then((token) => {
      if (token) {
        setPushToken(token);
        setPermissionStatus('granted');
      }
    }).catch(() => {
      // Silently handle notification registration failures
    });

    // Listen for notifications when app is in foreground
    notificationListener.current = addNotificationReceivedListener(() => {
      // Handle foreground notification - could trigger haptic feedback
    });

    // Listen for notification interactions
    responseListener.current = addNotificationResponseListener((response) => {
      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      if (data?.screen) {
        // Navigation would be handled here via navigation ref
      }
    });

    // Hide splash screen
    SplashScreen.hideAsync();

    return () => {
      unsubscribeNetInfo();
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [setPushToken, setPermissionStatus]);

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner isOffline={isOffline} />
      <RootNavigator />
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
