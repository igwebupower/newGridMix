// GridMix REST API v1 - Watt Q&A Endpoint
// Public developer-facing version of Watt: ask a natural-language question
// about UK grid data and get back an answer grounded in real GridMix data,
// with a citation. Unlike the other v1 endpoints this calls a paid LLM per
// request, so it carries its own (lower) per-IP daily cap rather than being
// unlimited.

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { runWattConversation, MAX_HISTORY_MESSAGES, type WattHistoryMessage } from '@/lib/watt-conversation';

function parseHistory(raw: unknown): WattHistoryMessage[] {
  if (!Array.isArray(raw)) return [];
  const valid: WattHistoryMessage[] = [];
  for (const entry of raw) {
    if (
      entry &&
      (entry.role === 'user' || entry.role === 'assistant') &&
      typeof entry.content === 'string' &&
      entry.content.length > 0 &&
      entry.content.length <= 1000
    ) {
      valid.push({ role: entry.role, content: entry.content });
    }
  }
  return valid.slice(-MAX_HISTORY_MESSAGES);
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAILY_LIMIT = 30;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip, DAILY_LIMIT, 24 * 60 * 60 * 1000, 'watt-public-api');

  if (!limit.success) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: `Free tier is limited to ${DAILY_LIMIT} questions per day per IP. Try again tomorrow.`,
      },
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          'X-RateLimit-Limit': String(limit.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(limit.reset),
        },
      }
    );
  }

  let question: string;
  let history: WattHistoryMessage[];
  try {
    const body = await req.json();
    question = typeof body?.question === 'string' ? body.question.trim() : '';
    history = parseHistory(body?.history);
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Malformed JSON body. Expected { "question": "..." }.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!question) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Provide a non-empty "question" field.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (question.length > 500) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Keep questions under 500 characters.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Watt (v1 API): OPENAI_API_KEY not configured');
    return NextResponse.json(
      { error: 'unavailable', message: 'Watt is temporarily unavailable.' },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  try {
    const answer = await runWattConversation(question, apiKey, history);
    return NextResponse.json(
      {
        question,
        answer,
        metadata: {
          source: 'GridMix Watt',
          api_version: 'v1',
        },
      },
      {
        headers: {
          ...CORS_HEADERS,
          'X-RateLimit-Limit': String(limit.limit),
          'X-RateLimit-Remaining': String(limit.remaining),
          'X-RateLimit-Reset': String(limit.reset),
        },
      }
    );
  } catch (error) {
    console.error('Watt (v1 API) error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: "Watt couldn't answer that — try again in a moment." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
