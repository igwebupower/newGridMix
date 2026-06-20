// Self-serve, free API key signup for the MCP server.
// No accounts, no email verification, no database — just enough friction
// (an email address, IP-rate-limited) to deter anonymous bulk abuse while
// staying genuinely free and instant.

import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { issueApiKey } from '@/lib/api-keys';

export const runtime = 'nodejs';

const SIGNUP_LIMIT = 5; // per IP per day

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip, SIGNUP_LIMIT, 24 * 60 * 60 * 1000, 'api-key-signup');

  if (!limit.success) {
    return NextResponse.json(
      { error: `Too many key requests from this address. Limit: ${SIGNUP_LIMIT}/day.` },
      { status: 429, headers: CORS_HEADERS }
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400, headers: CORS_HEADERS });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400, headers: CORS_HEADERS });
  }

  let apiKey: string;
  try {
    apiKey = await issueApiKey(email);
  } catch (error) {
    console.error('Failed to issue API key:', error);
    return NextResponse.json(
      { error: 'Key signup is temporarily unavailable. Please try again shortly.' },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    {
      api_key: apiKey,
      usage:
        'Send it as "Authorization: Bearer <api_key>" when calling /api/mcp. This raises your limit ' +
        'from 20 to 500 requests/day. Save it now — we do not store it and cannot show it again.',
    },
    { headers: CORS_HEADERS }
  );
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
