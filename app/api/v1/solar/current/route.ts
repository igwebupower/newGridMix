// GridMix REST API v1 - Current Solar Data Endpoint
// Provides current UK solar generation data

import { NextResponse } from 'next/server';
import { getCurrentSolarData } from '@/lib/api';

export async function GET() {
  try {
    const solarData = await getCurrentSolarData();

    const response = {
      timestamp: solarData.datetime,
      generation_mw: Math.round(solarData.generation_mw),
      capacity_percent: parseFloat(solarData.capacity_percent.toFixed(1)),
      installed_capacity_mw: solarData.installed_capacity_mw || 16000,
      data_source: 'Sheffield Solar PVLive',
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-API-Version': 'v1',
      },
    });
  } catch (error) {
    console.error('Solar API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch solar data',
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
