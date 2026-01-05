import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppSettings {
  darkMode: boolean;
  autoRefresh: boolean;
  reduceMotion: boolean;
}

interface AppState {
  settings: AppSettings;
  isFirstLaunch: boolean;
  lastViewedScreen: string;

  // Actions
  setSettings: (settings: Partial<AppSettings>) => void;
  setFirstLaunchComplete: () => void;
  setLastViewedScreen: (screen: string) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  autoRefresh: true,
  reduceMotion: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      isFirstLaunch: true,
      lastViewedScreen: 'Dashboard',

      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setFirstLaunchComplete: () => set({ isFirstLaunch: false }),

      setLastViewedScreen: (screen) => set({ lastViewedScreen: screen }),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
