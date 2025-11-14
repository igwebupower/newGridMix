// GridMix REST API v1 - Root Endpoint
// Provides API information and available endpoints

import { NextResponse } from 'next/server';

export async function GET() {
  const apiInfo = {
    name: 'GridMix API',
    version: 'v1',
    description: 'Real-time UK National Grid data API',
    documentation: 'https://gridmix.co.uk/api/docs',
    endpoints: {
      current: {
        path: '/api/v1/current',
        method: 'GET',
        description: 'Get current UK grid data snapshot',
        rate_limit: 'Free tier: 100/hour',
      },
      solar_current: {
        path: '/api/v1/solar/current',
        method: 'GET',
        description: 'Get current UK solar generation',
        rate_limit: 'Free tier: 100/hour',
      },
      historical: {
        path: '/api/v1/historical',
        method: 'GET',
        description: 'Get historical grid data (Coming soon)',
        status: 'planned',
      },
      forecast: {
        path: '/api/v1/forecast',
        method: 'GET',
        description: 'Get forecast data (Coming soon)',
        status: 'planned',
      },
    },
    data_sources: [
      {
        name: 'Elexon BMRS',
        url: 'https://www.elexon.co.uk',
        description: 'UK electricity system data',
      },
      {
        name: 'Sheffield Solar PVLive',
        url: 'https://www.solar.sheffield.ac.uk/pvlive/',
        description: 'UK solar generation data',
      },
    ],
    authentication: {
      type: 'API Key (Coming soon)',
      header: 'Authorization: Bearer YOUR_API_KEY',
      signup: 'https://gridmix.co.uk/api/signup',
    },
    support: {
      email: 'hello@gridmix.co.uk',
      documentation: 'https://gridmix.co.uk/api/docs',
      github: 'https://github.com/gridmix',
    },
  };

  return NextResponse.json(apiInfo, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
