// Watt — GridMix's grid-data Q&A endpoint.
// Tool-calling only: the model never answers from its own knowledge, only
// from data returned by wattTools, so every answer can carry a real citation.

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { wattTools } from '@/lib/watt-tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAILY_LIMIT = 15;
const MAX_TOOL_TURNS = 4;

const SYSTEM_PROMPT = `You are Watt, GridMix's assistant for questions about the UK electricity grid.

Rules:
- Answer ONLY using data returned by your tools. Never rely on general knowledge, training data, or guesses about grid conditions — they change every few minutes and stale knowledge would mislead the user.
- Call at least one tool before answering any question about grid data, prices, solar, frequency, or carbon intensity.
- If none of your tools can answer the question, say so plainly in one sentence and suggest what GridMix can answer instead. Do not speculate.
- Keep answers short and conversational: 1-3 sentences of prose.
- Always end your answer with a line starting exactly "Source:" naming the data source(s) and a human-readable timestamp from the tool result(s) you used. If you didn't call a tool, omit the Source line.
- Convert ISO timestamps to plain UK time in your prose (e.g. "2:32pm"), but keep the Source line's timestamp precise.`;

interface OpenAIToolCall {
  id: string;
  function: { name: string; arguments: string };
}

interface OpenAIMessage {
  role: string;
  content: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip, DAILY_LIMIT, 24 * 60 * 60 * 1000);

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
  try {
    const body = await req.json();
    question = typeof body?.question === 'string' ? body.question.trim() : '';
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
    const answer = await runWattConversation(question, apiKey);
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

async function runWattConversation(question: string, apiKey: string): Promise<string> {
  const messages: OpenAIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: question },
  ];

  const tools = wattTools.map((t) => t.definition);

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        tools,
        tool_choice: 'auto',
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${text}`);
    }

    const completion = await response.json();
    const message: OpenAIMessage = completion.choices[0].message;

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return message.content?.trim() || "I couldn't work that out — try rephrasing your question.";
    }

    messages.push(message);

    for (const toolCall of message.tool_calls) {
      const tool = wattTools.find((t) => t.definition.function.name === toolCall.function.name);
      let resultContent: string;

      if (!tool) {
        resultContent = JSON.stringify({ error: `Unknown tool: ${toolCall.function.name}` });
      } else {
        try {
          const args = toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : {};
          const result = await tool.execute(args);
          resultContent = JSON.stringify(result);
        } catch (error) {
          resultContent = JSON.stringify({
            error: error instanceof Error ? error.message : 'Tool execution failed',
          });
        }
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: resultContent,
      });
    }
  }

  return 'Watt is taking too long to find an answer — try a simpler or more specific question.';
}
