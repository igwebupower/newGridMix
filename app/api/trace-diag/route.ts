// TEMPORARY diagnostic — safe to delete after debugging trace ingestion.
import { NextResponse } from 'next/server';
import { Enprompta, tracedOpenAI } from '@enprompta/sdk';
import OpenAI from 'openai';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'node:module';

export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.ENPROMPTA_API_KEY || '';
  const info: Record<string, unknown> = {
    hasKey: Boolean(key),
    keyHash8: key ? crypto.createHash('sha256').update(key).digest('hex').slice(0, 8) : null,
  };

  // Robustly resolve the installed @enprompta/sdk version (walk up from entry).
  try {
    const req = createRequire(process.cwd() + '/');
    let dir = path.dirname(req.resolve('@enprompta/sdk'));
    for (let i = 0; i < 6; i++) {
      const p = path.join(dir, 'package.json');
      if (fs.existsSync(p)) {
        const pj = JSON.parse(fs.readFileSync(p, 'utf8')) as { name?: string; version?: string };
        if (pj.name === '@enprompta/sdk') { info.sdkVersion = pj.version; break; }
      }
      dir = path.dirname(dir);
    }
    if (!info.sdkVersion) info.sdkVersion = 'not-found';
  } catch (e) {
    info.sdkVersion = 'err: ' + (e instanceof Error ? e.message.slice(0, 60) : String(e));
  }

  const enprompta = new Enprompta({ apiKey: key });

  // Forced tool-call completion: content is null, output lives in tool_calls.
  // This is exactly what WATT produces. If 1.0.3 is deployed, a trace with
  // input "trace-diag-toolcall" lands; if 1.0.2, it is silently dropped.
  try {
    const openai = tracedOpenAI(enprompta, new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
    const c = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 30,
      messages: [{ role: 'user', content: 'trace-diag-toolcall: what is the weather in London?' }],
      tools: [{
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Get current weather for a city',
          parameters: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] },
        },
      }],
      tool_choice: 'required',
    });
    const msg = c.choices?.[0]?.message;
    info.toolCallProbe = {
      ok: true,
      hasContent: Boolean(msg?.content),
      toolCalls: msg?.tool_calls?.length ?? 0,
    };
  } catch (e) {
    info.toolCallProbe = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json(info);
}
