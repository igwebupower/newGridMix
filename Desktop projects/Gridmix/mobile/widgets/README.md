# GridMix Widgets

This directory contains the native widget implementations for iOS and Android.

## Overview

Widgets allow users to see carbon intensity at a glance from their home screen without opening the app.

## iOS Widgets (WidgetKit)

iOS widgets are built using SwiftUI and WidgetKit. They require a separate iOS target in Xcode.

### Setup Instructions

1. Open the iOS project in Xcode:
   ```bash
   cd ios
   open GridMix.xcworkspace
   ```

2. Add a new Widget Extension target:
   - File → New → Target → Widget Extension
   - Name: `GridMixWidget`
   - Include Configuration Intent: No (for static widgets)

3. Copy the Swift files from `widgets/ios/` into the new target

4. Configure App Groups for data sharing:
   - Add "App Groups" capability to both main app and widget
   - Use group identifier: `group.com.gridmix.app`

### Widget Sizes

| Size | Description |
|------|-------------|
| Small | Carbon intensity with color indicator |
| Medium | Intensity + energy mix summary |
| Large | Intensity + forecast chart |

### Files Structure

```
widgets/ios/
├── GridMixWidget.swift       # Widget entry point
├── CarbonIntensityView.swift # Small widget view
├── EnergyMixView.swift       # Medium widget view
├── ForecastView.swift        # Large widget view
├── DataProvider.swift        # Timeline provider
└── SharedData.swift          # App group data access
```

## Android Widgets

Android widgets use the standard Android widget system with Glance (Jetpack Compose for widgets).

### Setup Instructions

1. Add widget configuration to `android/app/src/main/res/xml/carbon_widget_info.xml`

2. Create widget provider in `android/app/src/main/java/.../CarbonWidgetProvider.kt`

3. Register widget in `AndroidManifest.xml`

### Files Structure

```
widgets/android/
├── CarbonWidgetProvider.kt   # Widget provider class
├── CarbonWidgetReceiver.kt   # Broadcast receiver
├── WidgetDataManager.kt      # Data fetching
└── res/
    ├── layout/widget_carbon.xml
    └── xml/carbon_widget_info.xml
```

## Data Sharing

### iOS
Use App Groups and UserDefaults to share data between the main app and widget:

```swift
let sharedDefaults = UserDefaults(suiteName: "group.com.gridmix.app")
sharedDefaults?.set(carbonIntensity, forKey: "carbonIntensity")
```

### Android
Use SharedPreferences with a custom content provider:

```kotlin
val prefs = context.getSharedPreferences("gridmix_widget", Context.MODE_PRIVATE)
prefs.edit().putInt("carbonIntensity", intensity).apply()
```

## Refresh Strategy

- **iOS**: WidgetKit manages timeline updates. Request updates every 15-30 minutes.
- **Android**: Use WorkManager for periodic updates every 15 minutes.

## Background Data Fetching

Both platforms need background fetch capability:

### iOS
```swift
// In TimelineProvider
func getTimeline(...) {
    // Fetch latest data from API
    // Schedule next update in 15-30 minutes
}
```

### Android
```kotlin
// In WorkManager
class WidgetUpdateWorker : CoroutineWorker(...) {
    override suspend fun doWork(): Result {
        // Fetch data and update widget
    }
}
```

## Testing Widgets

### iOS Simulator
1. Build and run the widget target
2. Long-press home screen → Add widget → GridMix

### Android Emulator
1. Build and install the app
2. Long-press home screen → Widgets → GridMix
