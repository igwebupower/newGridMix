// GridMix REST API v1 - Current Solar Data Endpoint
// Provides current UK solar generation data

import { NextResponse } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PVLIVE_API_BASE = 'https://api.pvlive.uk/pvlive/api/v4';

export async function GET() {
  try {
    // Fetch directly from Sheffield Solar (server-side, no CORS issues)
    const response = await fetch(`${PVLIVE_API_BASE}/gsp/0?extra_fields=capacity_mwp`, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'GridMix/1.0 (https://gridmix.co.uk)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sheffield Solar API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        generation_mw: 0,
        capacity_percent: 0,
        installed_capacity_mw: 20000,
        data_source: 'Sheffield Solar PVLive',
      });
    }

    // Latest data point: [gsp_id, datetime, generation_mw, capacity_mwp]
    const latest = data.data[0];
    const generationMW = latest[2] || 0;
    const installedCapacityMW = latest[3] || 20000;
    const capacityPercent = (generationMW / installedCapacityMW) * 100;

    return NextResponse.json({
      timestamp: latest[1],
      generation_mw: Math.round(generationMW),
      capacity_percent: parseFloat(capacityPercent.toFixed(1)),
      installed_capacity_mw: Math.round(installedCapacityMW),
      data_source: 'Sheffield Solar PVLive',
    }, {
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
