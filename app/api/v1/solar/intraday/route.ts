// GridMix REST API v1 - Solar Intraday Curve Endpoint
// Provides today's solar generation curve data

import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PVLIVE_API_BASE = 'https://api.pvlive.uk/pvlive/api/v4';

export async function GET(req: NextRequest) {
  try {
    // Fetch today's solar curve directly from Sheffield Solar
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${PVLIVE_API_BASE}/gsp/0?start=${today}T00:00:00&extra_fields=capacity_mwp`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'GridMix/1.0 (https://gridmix.co.uk)',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Sheffield Solar API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        {
          error: 'No solar data available',
          message: 'Solar curve data may not be available yet for today',
        },
        { status: 404 }
      );
    }

    // Get installed capacity from first data point
    const installedCapacityMW = data.data[0][3] || 20000;

    // Convert to our format and reverse (API returns newest first)
    const solarCurve = data.data
      .map((item: any) => ({
        datetime: item[1],
        generation_mw: item[2] || 0,
      }))
      .reverse();

    // Calculate statistics
    const generations = solarCurve.map((d: any) => d.generation_mw);
    const maxGeneration = Math.max(...generations);
    const avgGeneration = generations.reduce((a: number, b: number) => a + b, 0) / generations.length;
    const peakIndex = generations.indexOf(maxGeneration);
    const peakTime = solarCurve[peakIndex]?.datetime;

    // Format response
    const apiResponse = {
      date: today,
      data_points: solarCurve.length,
      statistics: {
        peak_mw: Math.round(maxGeneration),
        peak_time: peakTime,
        average_mw: Math.round(avgGeneration),
        total_gwh: Math.round((avgGeneration * 24) / 1000 * 10) / 10,
      },
      data: solarCurve.map((item: any) => ({
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
        installed_capacity_mw: Math.round(installedCapacityMW),
      },
    };

    return NextResponse.json(apiResponse, {
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
