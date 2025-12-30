// API Route: Proxy for Sheffield Solar Current Data
// This route runs on the server side and bypasses CORS restrictions

import { NextResponse } from 'next/server';

const PVLIVE_API_BASE = 'https://api0.solar.sheffield.ac.uk/pvlive/api/v4';

export async function GET() {
  try {
    const response = await fetch(`${PVLIVE_API_BASE}/gsp/0?extra_fields=capacity_mwp`, {
      cache: 'no-store',
    });

    if (!response.ok) {
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
      { error: 'Failed to fetch solar data' },
      { status: 500 }
    );
  }
}
