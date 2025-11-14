// GridMix REST API v1 - Forecast Data Endpoint
// Provides forecast data for UK grid carbon intensity and demand

import { NextRequest, NextResponse } from 'next/server';
import { getIntensityForecast } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Parse query parameters
    const hours = parseInt(searchParams.get('hours') || '48');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Validate parameters
    if (hours < 1 || hours > 168) {
      return NextResponse.json(
        { error: 'Hours parameter must be between 1 and 168 (7 days)' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: 'Limit parameter must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Fetch forecast data
    const forecastData = await getIntensityForecast(hours);

    // Format response
    const response = {
      generated_at: new Date().toISOString(),
      forecast_hours: hours,
      data_points: forecastData.length,
      data: forecastData.slice(0, limit).map((item) => ({
        timestamp: item.from,
        carbon_intensity: {
          forecast: item.intensity.forecast,
          level: item.intensity.index?.toLowerCase() || 'unknown',
        },
      })),
      metadata: {
        source: 'National Grid ESO',
        api_version: 'v1',
        cache_duration: '5 minutes',
        note: 'Forecasts become less accurate further into the future',
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-API-Version': 'v1',
        'X-Forecast-Hours': hours.toString(),
      },
    });
  } catch (error) {
    console.error('Forecast API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch forecast data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
