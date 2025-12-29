import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationPreferences } from '@/services/notifications';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/services/notifications';

interface NotificationState {
  preferences: NotificationPreferences;
  pushToken: string | null;
  permissionStatus: 'granted' | 'denied' | 'undetermined';

  // Actions
  setPreferences: (preferences: Partial<NotificationPreferences>) => void;
  setPushToken: (token: string | null) => void;
  setPermissionStatus: (status: 'granted' | 'denied' | 'undetermined') => void;
  resetPreferences: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      preferences: DEFAULT_NOTIFICATION_PREFERENCES,
      pushToken: null,
      permissionStatus: 'undetermined',

      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      setPushToken: (token) => set({ pushToken: token }),

      setPermissionStatus: (status) => set({ permissionStatus: status }),

      resetPreferences: () =>
        set({ preferences: DEFAULT_NOTIFICATION_PREFERENCES }),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
