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
        rate_limit: 'Free - unlimited usage',
      },
      solar_current: {
        path: '/api/v1/solar/current',
        method: 'GET',
        description: 'Get current UK solar generation',
        rate_limit: 'Free - unlimited usage',
      },
      solar_intraday: {
        path: '/api/v1/solar/intraday',
        method: 'GET',
        description: 'Get today\'s solar generation curve',
        rate_limit: 'Free - unlimited usage',
      },
      historical: {
        path: '/api/v1/historical',
        method: 'GET',
        description: 'Get historical grid data (1-168 hours)',
        parameters: 'hours (optional, default: 24), limit (optional, default: 100)',
        rate_limit: 'Free - unlimited usage',
      },
      forecast: {
        path: '/api/v1/forecast',
        method: 'GET',
        description: 'Get carbon intensity forecast (1-168 hours)',
        parameters: 'hours (optional, default: 48), limit (optional, default: 100)',
        rate_limit: 'Free - unlimited usage',
      },
      watt: {
        path: '/api/v1/watt',
        method: 'POST',
        description: 'Ask Watt a natural-language question about live or historical UK grid data. Every answer cites its data source.',
        parameters: 'JSON body: { "question": "...", "history"?: [{ "role": "user"|"assistant", "content": "..." }] }. history is optional, capped at the last 6 messages, and lets you build follow-up questions.',
        rate_limit: 'Free - 30 requests/day per IP',
      },
      mcp: {
        path: '/api/mcp',
        method: 'POST',
        description: 'Model Context Protocol (MCP) server exposing the same grid-data tools Watt uses (live mix, solar, frequency, price, carbon intensity, historical archive). Connect Claude, Claude Desktop, or any MCP-compatible client directly to this URL to query GridMix data as native tool calls.',
        parameters: 'MCP Streamable HTTP transport (stateless). Standard MCP methods: initialize, tools/list, tools/call.',
        rate_limit: 'Free - 500 requests/day per IP',
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
      type: 'None - Free and Open',
      required: false,
      note: 'No API key required. Fair use policy applies - please cache responses appropriately.',
    },
    support: {
      email: 'hello@gridmix.co.uk',
      documentation: 'https://gridmix.co.uk/api/docs',
      github: 'https://github.com/gridmix',
    },
    legal: {
      disclaimer:
        'GridMix data is informational/educational only — not warranted for accuracy and not intended for ' +
        'trading, critical infrastructure, emergency response, or regulatory compliance use.',
      data_attribution: 'Elexon BMRS data is © Elexon Limited, used under licence. Solar data from University of Sheffield Solar PVLive.',
      terms: 'https://gridmix.co.uk/terms',
      privacy: 'https://gridmix.co.uk/privacy',
    },
  };

  return NextResponse.json(apiInfo, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
