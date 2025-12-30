// API Route: Proxy for Sheffield Solar Current Data
// This route runs on the server side and bypasses CORS restrictions
// Updated: v4 API endpoint - Dec 30 2025

import { NextResponse } from 'next/server';

const PVLIVE_API_BASE = 'https://api0.solar.sheffield.ac.uk/pvlive/api/v4';

export async function GET() {
  const url = `${PVLIVE_API_BASE}/gsp/0?extra_fields=capacity_mwp`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'GridMix/1.0 (https://gridmix.co.uk)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Sheffield Solar API error: ${response.status} - ${text}`);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error proxying solar current data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch solar data', url, detail: String(error) },
      { status: 500 }
    );
  }
}
