// GridMix REST API v1 - Historical Data Endpoint
// Provides historical UK grid data for specified time range

import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalIntensity } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Parse query parameters
    const hours = parseInt(searchParams.get('hours') || '24');
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

    // Fetch historical data
    const historicalData = await getHistoricalIntensity(hours);

    // Format response
    const response = {
      hours_requested: hours,
      data_points: historicalData.length,
      data: historicalData.slice(0, limit).map((item) => ({
        timestamp: item.from,
        demand_mw: item.demand || null,
        carbon_intensity: {
          actual: item.intensity.actual || null,
          forecast: item.intensity.forecast,
          level: item.intensity.index?.toLowerCase() || 'unknown',
        },
      })),
      metadata: {
        source: 'Elexon BMRS',
        api_version: 'v1',
        cache_duration: '5 minutes',
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-API-Version': 'v1',
        'X-Data-Points': historicalData.length.toString(),
      },
    });
  } catch (error) {
    console.error('Historical API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch historical data',
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
