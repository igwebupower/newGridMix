# GridMix Mobile App

UK Carbon Intensity Tracker for iOS and Android, built with React Native and Expo.

## Features

- **Real-time Dashboard**: Live carbon intensity and energy mix data
- **48-Hour Forecast**: Carbon intensity predictions with greenest hours highlighted
- **Renewable Projects**: Browse 2,400+ UK renewable energy projects
- **Push Notifications**: Get alerts when carbon intensity is low
- **Widgets**: Home screen widgets for quick carbon checks (coming soon)

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (tabs + stack)
- **State Management**: TanStack Query (React Query)
- **Styling**: React Native StyleSheet
- **Icons**: Expo Vector Icons (Ionicons)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start development server
npm start
```

### Running on Device/Simulator

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (for testing)
npm run web
```

## Project Structure

```
mobile/
├── App.tsx                 # App entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── assets/                # Images, fonts, icons
│   ├── images/
│   └── fonts/
└── src/
    ├── components/        # Reusable UI components
    │   ├── CarbonIntensityCard.tsx
    │   ├── EnergyMixCard.tsx
    │   └── ...
    ├── screens/           # Screen components
    │   ├── DashboardScreen.tsx
    │   ├── ForecastScreen.tsx
    │   └── ...
    ├── navigation/        # Navigation configuration
    │   ├── RootNavigator.tsx
    │   └── MainTabNavigator.tsx
    ├── hooks/             # Custom React hooks
    │   └── useEnergyData.ts
    ├── services/          # API services
    │   └── api.ts
    ├── types/             # TypeScript types
    │   ├── energy.ts
    │   └── navigation.ts
    └── constants/         # App constants
        ├── colors.ts
        └── api.ts
```

## Configuration

### API Endpoint

Update the API base URL in `src/constants/api.ts`:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api'  // Development
  : 'https://your-api.com/api';   // Production
```

### App Store Configuration

Update identifiers in `app.json`:

- iOS: `expo.ios.bundleIdentifier`
- Android: `expo.android.package`
- EAS Project ID: `expo.extra.eas.projectId`

## Building for Production

### Using EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Submitting to App Stores

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## Development Notes

### Adding New Screens

1. Create screen in `src/screens/`
2. Add to exports in `src/screens/index.ts`
3. Add navigation type in `src/types/navigation.ts`
4. Add to navigator in `src/navigation/`

### Adding New API Endpoints

1. Add endpoint constant in `src/constants/api.ts`
2. Create fetch function in `src/services/api.ts`
3. Create React Query hook in `src/hooks/`

## License

Proprietary - All rights reserved
