// GridMix REST API v1 - Solar Intraday Curve Endpoint
// Provides today's solar generation curve data

import { NextRequest, NextResponse } from 'next/server';
import { getTodaySolarCurve } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    // Fetch today's solar curve
    const solarCurve = await getTodaySolarCurve();

    if (!solarCurve || solarCurve.length === 0) {
      return NextResponse.json(
        {
          error: 'No solar data available',
          message: 'Solar curve data may not be available yet for today',
        },
        { status: 404 }
      );
    }

    // Calculate statistics
    const generations = solarCurve.map(d => d.generation_mw);
    const maxGeneration = Math.max(...generations);
    const avgGeneration = generations.reduce((a, b) => a + b, 0) / generations.length;
    const peakIndex = generations.indexOf(maxGeneration);
    const peakTime = solarCurve[peakIndex]?.datetime;

    // Format response
    const response = {
      date: new Date().toISOString().split('T')[0],
      data_points: solarCurve.length,
      statistics: {
        peak_mw: Math.round(maxGeneration),
        peak_time: peakTime,
        average_mw: Math.round(avgGeneration),
        total_gwh: Math.round((avgGeneration * 24) / 1000 * 10) / 10,
      },
      data: solarCurve.map((item) => ({
        timestamp: item.datetime,
        time: new Date(item.datetime).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        generation_mw: Math.round(item.generation_mw),
      })),
      metadata: {
        source: 'Sheffield Solar PVLive',
        api_version: 'v1',
        cache_duration: '5 minutes',
        installed_capacity_mw: 16000,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-API-Version': 'v1',
      },
    });
  } catch (error) {
    console.error('Solar Intraday API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch solar intraday data',
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
