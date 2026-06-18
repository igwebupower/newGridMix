// Watt — GridMix's grid-data Q&A endpoint for the dashboard widget.
// Tool-calling only: the model never answers from its own knowledge, only
// from data returned by wattTools, so every answer can carry a real citation.

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

const DAILY_LIMIT = 15;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip, DAILY_LIMIT, 24 * 60 * 60 * 1000, 'watt-widget');

  if (!limit.success) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: `You've hit Watt's free limit of ${DAILY_LIMIT} questions per day. Try again tomorrow.`,
      },
      {
        status: 429,
        headers: {
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
      { error: 'invalid_request', message: 'Malformed request body.' },
      { status: 400 }
    );
  }

  if (!question) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Ask Watt a question.' },
      { status: 400 }
    );
  }

  if (question.length > 500) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Keep questions under 500 characters.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Watt: OPENAI_API_KEY not configured');
    return NextResponse.json(
      { error: 'unavailable', message: 'Watt is temporarily unavailable.' },
      { status: 503 }
    );
  }

  try {
    const answer = await runWattConversation(question, apiKey, history);
    return NextResponse.json(
      { answer },
      {
        headers: {
          'X-RateLimit-Limit': String(limit.limit),
          'X-RateLimit-Remaining': String(limit.remaining),
          'X-RateLimit-Reset': String(limit.reset),
        },
      }
    );
  } catch (error) {
    console.error('Watt error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: "Watt couldn't answer that — try again in a moment." },
      { status: 500 }
    );
  }
}
