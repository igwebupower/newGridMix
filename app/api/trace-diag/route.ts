// TEMPORARY diagnostic — safe to delete after debugging trace ingestion.
import { NextResponse } from 'next/server';
import { Enprompta, tracedOpenAI } from '@enprompta/sdk';
import OpenAI from 'openai';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.ENPROMPTA_API_KEY || '';
  const info: Record<string, unknown> = {
    hasKey: Boolean(key),
    keyLen: key.length,
    keyHash8: key ? crypto.createHash('sha256').update(key).digest('hex').slice(0, 8) : null,
  };

  // Which SDK version is actually deployed (read the file, no require()).
  try {
    const pj = fs.readFileSync(path.join(process.cwd(), 'node_modules/@enprompta/sdk/package.json'), 'utf8');
    info.sdkVersion = (JSON.parse(pj) as { version?: string }).version;
  } catch (e) {
    info.sdkVersion = 'unresolved: ' + (e instanceof Error ? e.message.slice(0, 60) : String(e));
  }

  const enprompta = new Enprompta({ apiKey: key });

  // (1) Direct record — already known to work, kept as a control.
  try {
    const r = await enprompta.traces.record({
      provider: 'openai', model: 'gpt-4o-mini', input: 'trace-diag-direct', output: 'ok',
    });
    info.directRecord = { ok: true, traceId: (r as { traceId?: string })?.traceId ?? null };
  } catch (e) {
    info.directRecord = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // (2) The WRAPPED path the chat uses — does tracedOpenAI actually record?
  // After this returns, check the dashboard for input "trace-diag-wrapped".
  try {
    const openai = tracedOpenAI(enprompta, new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
    const c = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 5,
      messages: [{ role: 'user', content: 'trace-diag-wrapped reply ok' }],
    });
    info.wrappedCall = { ok: true, content: c.choices?.[0]?.message?.content ?? null };
  } catch (e) {
    info.wrappedCall = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json(info);
}
