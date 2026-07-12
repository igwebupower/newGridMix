// TEMPORARY diagnostic — remove after use. Reports, from the DEPLOYED runtime:
//   1. whether ENPROMPTA_API_KEY is actually present (length/prefix/whitespace,
//      never the value), and
//   2. the real HTTP status the Enprompta span-ingest endpoint returns, which
//      the SDK normally swallows in a catch{}.
// Gated by a one-off token baked into the code (not an env secret) so it works
// regardless of env mismatch. Exposes no secret values.
import { NextRequest, NextResponse } from 'next/server';
import { Enprompta } from '@enprompta/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIAG_TOKEN = '925ebc80bf0567ac90790ca8';

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== DIAG_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const key = process.env.ENPROMPTA_API_KEY;
  const keyInfo = {
    present: Boolean(key),
    length: key ? key.length : 0,
    prefix: key ? key.slice(0, 3) : null,
    hasWhitespace: key ? /\s/.test(key) : false,
  };

  // Intercept fetch to capture the ingest status the SDK hides.
  const realFetch = globalThis.fetch;
  let captured: { url: string; status: number; body: string } | null = null;
  (globalThis as unknown as { fetch: typeof fetch }).fetch = (async (
    url: Parameters<typeof fetch>[0],
    init: Parameters<typeof fetch>[1]
  ) => {
    const res = await realFetch(url, init);
    if (String(url).includes('/api/ingest/traces')) {
      captured = { url: String(url), status: res.status, body: (await res.clone().text()).slice(0, 300) };
    }
    return res;
  }) as typeof fetch;

  let error: string | null = null;
  try {
    const enprompta = new Enprompta({ apiKey: key! });
    const trace = enprompta.trace({ name: 'trace-diag', type: 'AGENT', sessionId: 'trace-diag', input: 'diag' });
    const s = trace.span({ type: 'LLM', name: 'diag-llm', provider: 'openai', model: 'gpt-4o-mini', input: [{ role: 'user', content: 'diag' }] });
    s.end({ output: 'ok', inputTokens: 1, outputTokens: 1 });
    await trace.end({ output: 'ok', provider: 'openai', model: 'gpt-4o-mini' });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  } finally {
    (globalThis as unknown as { fetch: typeof fetch }).fetch = realFetch;
  }

  return NextResponse.json({ keyInfo, ingest: captured, error });
}
