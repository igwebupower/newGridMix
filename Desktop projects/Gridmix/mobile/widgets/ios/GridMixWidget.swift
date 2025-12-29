import WidgetKit
import SwiftUI

// MARK: - Widget Entry
struct CarbonEntry: TimelineEntry {
    let date: Date
    let carbonIntensity: Int
    let intensityIndex: String
    let renewablePercentage: Double
    let lastUpdated: Date
}

// MARK: - Timeline Provider
struct CarbonProvider: TimelineProvider {
    func placeholder(in context: Context) -> CarbonEntry {
        CarbonEntry(
            date: Date(),
            carbonIntensity: 150,
            intensityIndex: "moderate",
            renewablePercentage: 45.0,
            lastUpdated: Date()
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (CarbonEntry) -> Void) {
        let entry = loadCachedEntry() ?? placeholder(in: context)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CarbonEntry>) -> Void) {
        Task {
            // Fetch fresh data
            let entry = await fetchLatestData() ?? loadCachedEntry() ?? placeholder(in: context)

            // Schedule next update in 15 minutes
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))

            completion(timeline)
        }
    }

    private func loadCachedEntry() -> CarbonEntry? {
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.gridmix.app"),
              let intensity = sharedDefaults.object(forKey: "carbonIntensity") as? Int else {
            return nil
        }

        return CarbonEntry(
            date: Date(),
            carbonIntensity: intensity,
            intensityIndex: sharedDefaults.string(forKey: "intensityIndex") ?? "moderate",
            renewablePercentage: sharedDefaults.double(forKey: "renewablePercentage"),
            lastUpdated: sharedDefaults.object(forKey: "lastUpdated") as? Date ?? Date()
        )
    }

    private func fetchLatestData() async -> CarbonEntry? {
        guard let url = URL(string: "https://api.carbonintensity.org.uk/intensity") else {
            return nil
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoder = JSONDecoder()
            // Parse and return entry
            // This is simplified - actual implementation would parse the JSON
            return nil
        } catch {
            return nil
        }
    }
}

// MARK: - Small Widget View
struct SmallWidgetView: View {
    var entry: CarbonEntry

    var intensityColor: Color {
        switch entry.intensityIndex {
        case "very low": return .green
        case "low": return Color(red: 0.52, green: 0.8, blue: 0.09)
        case "moderate": return .orange
        case "high": return Color(red: 0.97, green: 0.46, blue: 0.09)
        default: return .red
        }
    }

    var body: some View {
        ZStack {
            Color(red: 0.06, green: 0.09, blue: 0.16)

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "bolt.fill")
                        .foregroundColor(.cyan)
                    Text("GridMix")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white.opacity(0.7))
                }

                Spacer()

                Text("\(entry.carbonIntensity)")
                    .font(.system(size: 42, weight: .bold))
                    .foregroundColor(intensityColor)

                Text("gCO₂/kWh")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))

                HStack {
                    Circle()
                        .fill(intensityColor)
                        .frame(width: 8, height: 8)
                    Text(entry.intensityIndex.capitalized)
                        .font(.caption2)
                        .fontWeight(.medium)
                        .foregroundColor(intensityColor)
                }
            }
            .padding()
        }
    }
}

// MARK: - Medium Widget View
struct MediumWidgetView: View {
    var entry: CarbonEntry

    var intensityColor: Color {
        switch entry.intensityIndex {
        case "very low": return .green
        case "low": return Color(red: 0.52, green: 0.8, blue: 0.09)
        case "moderate": return .orange
        case "high": return Color(red: 0.97, green: 0.46, blue: 0.09)
        default: return .red
        }
    }

    var body: some View {
        ZStack {
            Color(red: 0.06, green: 0.09, blue: 0.16)

            HStack(spacing: 16) {
                // Left: Carbon intensity
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Image(systemName: "bolt.fill")
                            .foregroundColor(.cyan)
                        Text("GridMix")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white.opacity(0.7))
                    }

                    Spacer()

                    Text("\(entry.carbonIntensity)")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(intensityColor)

                    Text("gCO₂/kWh")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.6))

                    HStack {
                        Circle()
                            .fill(intensityColor)
                            .frame(width: 8, height: 8)
                        Text(entry.intensityIndex.capitalized)
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(intensityColor)
                    }
                }

                Spacer()

                // Right: Renewable percentage
                VStack(alignment: .trailing, spacing: 8) {
                    Spacer()

                    ZStack {
                        Circle()
                            .stroke(Color.white.opacity(0.2), lineWidth: 6)
                        Circle()
                            .trim(from: 0, to: entry.renewablePercentage / 100)
                            .stroke(Color.green, lineWidth: 6)
                            .rotationEffect(.degrees(-90))
                    }
                    .frame(width: 60, height: 60)

                    Text("\(Int(entry.renewablePercentage))%")
                        .font(.headline)
                        .foregroundColor(.green)

                    Text("Renewable")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            .padding()
        }
    }
}

// MARK: - Widget Configuration
@main
struct GridMixWidget: Widget {
    let kind: String = "GridMixWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CarbonProvider()) { entry in
            WidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Carbon Intensity")
        .description("See the current UK grid carbon intensity.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct WidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: CarbonEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Preview
struct GridMixWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            SmallWidgetView(entry: CarbonEntry(
                date: Date(),
                carbonIntensity: 85,
                intensityIndex: "low",
                renewablePercentage: 52.3,
                lastUpdated: Date()
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))

            MediumWidgetView(entry: CarbonEntry(
                date: Date(),
                carbonIntensity: 185,
                intensityIndex: "moderate",
                renewablePercentage: 38.5,
                lastUpdated: Date()
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
        }
    }
}
