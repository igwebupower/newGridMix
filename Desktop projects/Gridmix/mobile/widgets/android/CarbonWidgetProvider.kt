package com.gridmix.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.widget.RemoteViews
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.URL

/**
 * GridMix Carbon Intensity Widget Provider
 *
 * Displays current UK grid carbon intensity on the home screen.
 */
class CarbonWidgetProvider : AppWidgetProvider() {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onDeleted(context: Context, appWidgetIds: IntArray) {
        // Clean up preferences for deleted widgets
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val editor = prefs.edit()
        for (appWidgetId in appWidgetIds) {
            editor.remove("intensity_$appWidgetId")
        }
        editor.apply()
    }

    override fun onDisabled(context: Context) {
        scope.cancel()
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        scope.launch {
            try {
                val carbonData = fetchCarbonIntensity()

                withContext(Dispatchers.Main) {
                    val views = RemoteViews(context.packageName, R.layout.widget_carbon)

                    // Set intensity value
                    views.setTextViewText(R.id.intensity_value, "${carbonData.intensity}")
                    views.setTextViewText(R.id.intensity_unit, "gCO₂/kWh")

                    // Set intensity label and color
                    views.setTextViewText(R.id.intensity_label, carbonData.index.capitalize())
                    views.setTextColor(R.id.intensity_value, carbonData.color)
                    views.setTextColor(R.id.intensity_label, carbonData.color)

                    // Set renewable percentage
                    views.setTextViewText(R.id.renewable_value, "${carbonData.renewablePercentage}%")

                    // Set click intent to open app
                    val intent = context.packageManager
                        .getLaunchIntentForPackage(context.packageName)
                    val pendingIntent = PendingIntent.getActivity(
                        context, 0, intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

                    // Update the widget
                    appWidgetManager.updateAppWidget(appWidgetId, views)

                    // Cache the data
                    saveCachedData(context, carbonData)
                }
            } catch (e: Exception) {
                // Use cached data on error
                val cachedData = loadCachedData(context)
                if (cachedData != null) {
                    withContext(Dispatchers.Main) {
                        updateWidgetWithData(context, appWidgetManager, appWidgetId, cachedData)
                    }
                }
            }
        }
    }

    private fun updateWidgetWithData(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        data: CarbonData
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_carbon)
        views.setTextViewText(R.id.intensity_value, "${data.intensity}")
        views.setTextViewText(R.id.intensity_label, data.index.capitalize())
        views.setTextColor(R.id.intensity_value, data.color)
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private suspend fun fetchCarbonIntensity(): CarbonData {
        return withContext(Dispatchers.IO) {
            val url = URL("https://api.carbonintensity.org.uk/intensity")
            val response = url.readText()
            val json = JSONObject(response)
            val data = json.getJSONArray("data").getJSONObject(0)
            val intensity = data.getJSONObject("intensity")

            val forecast = intensity.getInt("forecast")
            val index = intensity.getString("index")

            CarbonData(
                intensity = forecast,
                index = index,
                color = getColorForIndex(index),
                renewablePercentage = 0 // Would need additional API call
            )
        }
    }

    private fun getColorForIndex(index: String): Int {
        return when (index) {
            "very low" -> Color.parseColor("#22C55E")
            "low" -> Color.parseColor("#84CC16")
            "moderate" -> Color.parseColor("#F59E0B")
            "high" -> Color.parseColor("#F97316")
            else -> Color.parseColor("#EF4444")
        }
    }

    private fun saveCachedData(context: Context, data: CarbonData) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putInt("cached_intensity", data.intensity)
            .putString("cached_index", data.index)
            .putLong("cached_time", System.currentTimeMillis())
            .apply()
    }

    private fun loadCachedData(context: Context): CarbonData? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val intensity = prefs.getInt("cached_intensity", -1)
        if (intensity == -1) return null

        val index = prefs.getString("cached_index", "moderate") ?: "moderate"
        return CarbonData(
            intensity = intensity,
            index = index,
            color = getColorForIndex(index),
            renewablePercentage = 0
        )
    }

    data class CarbonData(
        val intensity: Int,
        val index: String,
        val color: Int,
        val renewablePercentage: Int
    )

    companion object {
        private const val PREFS_NAME = "gridmix_widget"
    }
}
