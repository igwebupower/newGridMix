// API Route: Proxy for Sheffield Solar Yesterday's Curve
// This route runs on the server side and bypasses CORS restrictions

import { NextResponse } from 'next/server';

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PVLIVE_API_BASE = 'https://api0.solar.sheffield.ac.uk/pvlive/api/v4';

export async function GET() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const startISO = startOfDay.toISOString().split('.')[0];
    const endISO = endOfDay.toISOString().split('.')[0];

    const response = await fetch(
      `${PVLIVE_API_BASE}/gsp/0?start=${startISO}&end=${endISO}&extra_fields=capacity_mwp`,
      {
        cache: 'no-store',
      }
    );

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
    console.error('Error proxying solar yesterday data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch solar data' },
      { status: 500 }
    );
  }
}
