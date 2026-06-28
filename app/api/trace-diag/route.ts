// TEMPORARY diagnostic — safe to delete after debugging trace ingestion.
// Reveals what the DEPLOYED runtime sees: whether ENPROMPTA_API_KEY is present,
// its length + SHA-256 fingerprint (NOT the key itself), and the result of one
// un-swallowed traces.record() call.
import { NextResponse } from 'next/server';
import { Enprompta } from '@enprompta/sdk';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.ENPROMPTA_API_KEY || '';
  const info: Record<string, unknown> = {
    hasKey: Boolean(key),
    keyLen: key.length,
    keyPrefix: key.slice(0, 3),
    keyHash8: key ? crypto.createHash('sha256').update(key).digest('hex').slice(0, 8) : null,
  };

  try {
    const enprompta = new Enprompta({ apiKey: key });
    const r = await enprompta.traces.record({
      provider: 'openai',
      model: 'gpt-4o-mini',
      input: 'trace-diag-probe',
      output: 'ok',
    });
    info.recordResult = { ok: true, traceId: (r as { traceId?: string })?.traceId ?? null };
  } catch (e) {
    info.recordResult = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json(info);
}
