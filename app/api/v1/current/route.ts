// GridMix REST API v1 - Current Grid Data Endpoint
// Public endpoint providing current UK grid snapshot

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentGridData, getCurrentSolarData, getCurrentFrequency } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    // Fetch all current data in parallel
    const [gridData, solarData, frequencyData] = await Promise.all([
      getCurrentGridData(),
      getCurrentSolarData(),
      getCurrentFrequency(),
    ]);

    // Format response according to API spec
    const response = {
      timestamp: gridData.to,
      demand: {
        total_mw: gridData.totalGeneration,
        national_mw: gridData.totalGeneration - gridData.totalExports,
        exports_mw: gridData.totalExports,
      },
      generation: {
        total_mw: gridData.totalGeneration,
        mix: gridData.generationmix.map((item) => ({
          fuel: item.fuel,
          mw: Math.round(item.mw),
          percentage: parseFloat(item.perc.toFixed(1)),
        })),
      },
      carbon_intensity: {
        actual: gridData.intensity.actual || gridData.intensity.forecast,
        forecast: gridData.intensity.forecast,
        level: gridData.intensity.index?.toLowerCase() || 'unknown',
      },
      frequency: {
        hz: parseFloat(frequencyData.frequency.toFixed(3)),
        status: frequencyData.status,
      },
      interconnectors: gridData.interconnectors?.map((ic) => ({
        name: ic.name,
        country: ic.country,
        flow_mw: Math.round(ic.flow),
        capacity_mw: ic.capacity,
        direction: ic.flow > 0 ? 'import' : 'export',
      })) || [],
      solar: {
        generation_mw: Math.round(solarData.generation_mw),
        capacity_percent: parseFloat(solarData.capacity_percent.toFixed(1)),
        installed_capacity_mw: solarData.installed_capacity_mw || 16000,
      },
    };

    // Return with CORS headers for public access
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-API-Version': 'v1',
        'X-Data-Source': 'Elexon BMRS, Sheffield Solar PVLive',
      },
    });
  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch grid data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
