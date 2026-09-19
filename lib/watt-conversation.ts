// Shared tool-calling loop for Watt — used by both the internal dashboard
// widget (app/api/watt) and the public developer endpoint (app/api/v1/watt).
// Keeping this in one place means a prompt or tool-loop change only has to
// happen once for both surfaces to pick it up.

import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import { Enprompta } from '@enprompta/sdk';
import { context, trace as otelTrace, SpanStatusCode } from '@opentelemetry/api';
import { setSession } from '@arizeai/openinference-core';
import {
  INPUT_VALUE,
  OUTPUT_VALUE,
  SemanticConventions,
  OpenInferenceSpanKind,
} from '@arizeai/openinference-semantic-conventions';
import { wrapOpenAI, traced, startSpan } from 'braintrust';
import { wattTools } from './watt-tools';
import { initArizeTracing, flushArizeTracing } from './arize-tracing';
import { initBraintrustTracing, flushBraintrustTracing } from './braintrust-tracing';

// EVALUATION ONLY (branch: arize-tracing-eval) — Arize and Braintrust both run
// alongside Enprompta so all three can be compared on identical traffic. Arize
// must init at module load, before any OpenAI client is constructed, or the
// instrumentor's patch misses it; Braintrust's initLogger() doesn't have that
// constraint (wrapOpenAI wraps the instance directly, see braintrust-tracing.ts)
// but is called here too for a single, obvious init point.
initArizeTracing();
initBraintrustTracing();

const arizeTracer = otelTrace.getTracer('gridmix-watt');

// Enprompta client. We use the manual span-tree builder (enprompta.trace())
// rather than the flat tracedOpenAI() wrapper: WATT is a tool-calling agent, so
// the right shape is one root AGENT span per question with child LLM spans (each
// model turn) and child TOOL spans (each tool execution), grouped by a session.
// This also sidesteps the Next.js bundler module-identity issue that global
// auto-instrumentation hits — trace()/span() are plain method calls, bundler-proof.
const enprompta = new Enprompta({ apiKey: process.env.ENPROMPTA_API_KEY! });

export const MAX_TOOL_TURNS = 4;
export const MAX_HISTORY_MESSAGES = 6;

export const WATT_SYSTEM_PROMPT = `You are Watt, GridMix's assistant for questions about the UK electricity grid.

Rules:
- Answer ONLY using data returned by your tools. Never rely on general knowledge, training data, or guesses about grid conditions — they change every few minutes and stale knowledge would mislead the user.
- Call at least one tool before answering any question about grid data, prices, solar, frequency, carbon intensity, or historical UK electricity trends — including follow-up questions. Never reuse a figure from earlier in the conversation without calling a tool again to re-check it; the only thing earlier turns are good for is resolving what the user means (e.g. which fuel, which day), not supplying the actual numbers.
- For background or conceptual questions that live data can't settle ("what is grid frequency", "why do prices follow gas"), use search_articles and, if a result fits, get_article — then answer from that article and cite it. Do not explain such concepts from your own knowledge.
- When you answer from an article, end the Source line with the article title and its URL so the user can read more.
- If none of your tools can answer the question, say so plainly in one sentence and suggest what GridMix can answer instead. Do not speculate.
- find_cleanest_window returns a forecast, not a measurement. Say "forecast" or "expected" when you use it, never state it as fact.
- For "why" questions about a price, demand, or intensity peak, base your explanation only on the correlating fields the tool returned (fuel mix, demand, notes) — e.g. a high gas share and near-peak demand at that moment. Never invent a cause the data doesn't support; if the tool result doesn't point to one, say the data doesn't show a clear driver. On the GB grid, gas is normally the marginal fuel that sets the wholesale price — wind, solar, and nuclear are cheap and do not raise it — so a price peak is usually explained by a high gas share and/or high demand, not by a high renewable share. Don't credit wind/solar/nuclear for pushing price up; if gas share was low and price was still high, say the data doesn't show a clear driver rather than blaming the wrong fuel.
- If a historical archive tool result has data_quality of "estimated", "partial", or "interpolated", say so briefly rather than stating the figure as certain.
- Your training data has a cutoff long before today; never guess today's date from it. A line below states the actual current date and time — use that, not any date you might otherwise assume, to resolve "today", "this week", "this year", "last month" etc. before picking arguments for a tool.
- Keep answers short and conversational: 1-3 sentences of prose.
- Always end your answer with a line starting exactly "Source:" naming the data source(s) and a human-readable timestamp or period from the tool result(s) you used. If you didn't call a tool, omit the Source line.
- Convert ISO timestamps to plain UK time in your prose (e.g. "2:32pm"), but keep the Source line's timestamp precise.`;

export interface WattHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RunWattOptions {
  history?: WattHistoryMessage[];
  /**
   * Stable per-chat id. Every question in one conversation must pass the SAME
   * value so Enprompta groups the whole chat under one session instead of
   * filing each question as an unrelated trace. Defaults to a fresh id, which
   * is only correct for genuinely one-shot calls.
   */
  sessionId?: string;
  /** Which Watt surface asked — shows up as trace metadata for filtering. */
  surface?: 'widget' | 'public-api';
}

/** Session ids are echoed back to clients and sent to Enprompta, so keep them boring. */
export function sanitizeSessionId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(trimmed)) return null;
  return trimmed;
}

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

export async function runWattConversation(
  question: string,
  apiKey: string,
  options: RunWattOptions = {}
): Promise<string> {
  const {
    history = [],
    sessionId = randomUUID(),
    surface = 'widget',
  } = options;
  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);
  // Nth question in this chat — history holds both sides, so count user turns.
  const turnNumber = trimmedHistory.filter((m) => m.role === 'user').length + 1;

  // Computed per-request, not baked into the static prompt string — a
  // serverless instance can stay warm across days, and the model's own
  // training cutoff is stale by years relative to the real date.
  const now = new Date();
  const currentDateLine = `Current date and time: ${now.toISOString()} (UTC). This is real, authoritative, and overrides anything your training data implies about "now".`;

  const messages: OpenAIMessage[] = [
    { role: 'system', content: `${WATT_SYSTEM_PROMPT}\n\n${currentDateLine}` },
    ...trimmedHistory.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: question },
  ];

  const tools = wattTools.map((t) => t.definition);
  // wrapOpenAI wraps this exact instance (like tracedOpenAI above), so it's
  // bundler-proof the same way — no require()-time patching involved.
  const openai = wrapOpenAI(new OpenAI({ apiKey }));

  // One root AGENT span per question; each model turn becomes a child LLM span
  // and each tool execution a child TOOL span, grouped under `sessionId` so a
  // multi-turn chat reads as a single session in the dashboard. The turn number
  // is in the span name as well as metadata so the session view reads in order
  // even before you open a trace.
  const trace = enprompta.trace({
    name: `watt-turn-${turnNumber}`,
    type: 'AGENT',
    sessionId,
    input: question,
    metadata: {
      turn: turnNumber,
      surface,
      historyMessages: trimmedHistory.length,
    },
  });

  // Arize equivalent of the tree above. `setSession` puts session.id on the
  // OTel context rather than on a single span, so the auto-instrumented OpenAI
  // spans inherit it too and Arize groups the chat as one conversation.
  // The CHAIN span is still needed: the OpenAI instrumentor sees each API call
  // but not the loop that ties them into one turn.
  const sessionCtx = setSession(context.active(), { sessionId });
  const chainSpan = arizeTracer.startSpan(`watt-turn-${turnNumber}`, undefined, sessionCtx);
  chainSpan.setAttribute(
    SemanticConventions.OPENINFERENCE_SPAN_KIND,
    OpenInferenceSpanKind.CHAIN
  );
  chainSpan.setAttribute(INPUT_VALUE, question);
  chainSpan.setAttribute('turn', turnNumber);
  chainSpan.setAttribute('surface', surface);
  chainSpan.setAttribute('historyMessages', trimmedHistory.length);
  // setSession() only reaches spans the OpenInference instrumentors create; a
  // hand-built span has to carry session.id itself, or it drops out of Arize's
  // session view and the multi-turn grouping breaks.
  chainSpan.setAttribute(SemanticConventions.SESSION_ID, sessionId);
  // Passing this context explicitly when creating child spans keeps the tree
  // correct without wrapping the whole loop in a callback.
  const chainCtx = otelTrace.setSpan(sessionCtx, chainSpan);

  // Braintrust root span, third leg of the comparison. TOOL spans below are
  // parented to it via explicit span.export()/parent linking (the doc-confirmed
  // mechanism) rather than an ambient "current span" context, since this loop's
  // early returns and try/finally don't fit a single traced() callback the way
  // Enprompta's trace()/span() builder does.
  const braintrustSpan = startSpan({
    name: `watt-turn-${turnNumber}`,
    type: 'task',
    event: {
      input: question,
      metadata: { turn: turnNumber, surface, historyMessages: trimmedHistory.length, sessionId },
    },
  });

  let answer =
    'Watt is taking too long to find an answer — try a simpler or more specific question.';
  // Both root spans used to end without a status, so a turn that threw was
  // indistinguishable from one that succeeded — error rates read clean straight
  // through an outage. Captured here and applied in the finally.
  let failure: Error | null = null;

  try {
    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
      // On the last allowed turn we withhold the tools so the model has to
      // answer from what it already gathered. Without this, a model that spends
      // every turn calling tools falls out of the loop with no answer at all —
      // which gets likelier the more tools Watt has to choose between.
      const isFinalTurn = turn === MAX_TOOL_TURNS - 1;

      const llmSpan = trace.span({
        type: 'LLM',
        name: isFinalTurn ? `model-turn-${turn}-final` : `model-turn-${turn}`,
        provider: 'openai',
        model: 'gpt-4o-mini',
        input: messages,
      });

      let message: OpenAIMessage;
      try {
        // Run inside chainCtx so the instrumentor's LLM span attaches under the
        // CHAIN span and picks up session.id from the context. The traced()
        // wrapper does the equivalent for Braintrust: it makes this call the
        // "current" span for wrapOpenAI's auto-generated LLM span to nest under,
        // parented explicitly to braintrustSpan via export().
        const completion = await traced(
          () =>
            context.with(chainCtx, () =>
              openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages as never,
                ...(isFinalTurn ? {} : { tools: tools as never, tool_choice: 'auto' }),
                temperature: 0.2,
              })
            ),
          {
            name: isFinalTurn ? `model-turn-${turn}-final` : `model-turn-${turn}`,
            type: 'llm',
            parent: braintrustSpan.export(),
          }
        );
        message = completion.choices[0].message as unknown as OpenAIMessage;
        llmSpan.end({
          output: message.content ?? message.tool_calls ?? '',
          inputTokens: completion.usage?.prompt_tokens,
          outputTokens: completion.usage?.completion_tokens,
        });
      } catch (error) {
        llmSpan.end({
          status: 'ERROR',
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      if (!message.tool_calls || message.tool_calls.length === 0) {
        answer =
          message.content?.trim() ||
          "I couldn't work that out — try rephrasing your question.";
        return answer;
      }

      messages.push(message);

      for (const toolCall of message.tool_calls) {
        const toolSpan = trace.span({
          type: 'TOOL',
          name: toolCall.function.name,
          input: toolCall.function.arguments,
        });
        // The OpenAI instrumentor records that the model *asked* for this tool,
        // but never the execution or its result — that part is ours to emit.
        const arizeToolSpan = arizeTracer.startSpan(
          toolCall.function.name,
          undefined,
          chainCtx
        );
        arizeToolSpan.setAttribute(
          SemanticConventions.OPENINFERENCE_SPAN_KIND,
          OpenInferenceSpanKind.TOOL
        );
        arizeToolSpan.setAttribute(SemanticConventions.TOOL_NAME, toolCall.function.name);
        arizeToolSpan.setAttribute(INPUT_VALUE, toolCall.function.arguments || '{}');
        arizeToolSpan.setAttribute(SemanticConventions.SESSION_ID, sessionId);
        if (toolCall.id) {
          arizeToolSpan.setAttribute('tool.id', toolCall.id);
        }
        const braintrustToolSpan = startSpan({
          name: toolCall.function.name,
          type: 'tool',
          parent: braintrustSpan.export(),
          event: { input: toolCall.function.arguments || '{}' },
        });

        const tool = wattTools.find(
          (t) => t.definition.function.name === toolCall.function.name
        );
        let resultContent: string;

        if (!tool) {
          resultContent = JSON.stringify({ error: `Unknown tool: ${toolCall.function.name}` });
          toolSpan.end({ status: 'ERROR', output: resultContent });
          arizeToolSpan.setAttribute(OUTPUT_VALUE, resultContent);
          arizeToolSpan.setStatus({ code: SpanStatusCode.ERROR, message: 'Unknown tool' });
          arizeToolSpan.end();
          braintrustToolSpan.log({ output: resultContent, error: 'Unknown tool' });
          braintrustToolSpan.end();
        } else {
          arizeToolSpan.setAttribute(
            SemanticConventions.TOOL_DESCRIPTION,
            tool.definition.function.description
          );
          arizeToolSpan.setAttribute(
            SemanticConventions.TOOL_PARAMETERS,
            JSON.stringify(tool.definition.function.parameters)
          );
          try {
            const args = toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : {};
            const result = await tool.execute(args);
            resultContent = JSON.stringify(result);
            toolSpan.end({ output: resultContent });
            arizeToolSpan.setAttribute(OUTPUT_VALUE, resultContent);
            arizeToolSpan.setStatus({ code: SpanStatusCode.OK });
            arizeToolSpan.end();
            braintrustToolSpan.log({ output: resultContent });
            braintrustToolSpan.end();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Tool execution failed';
            resultContent = JSON.stringify({ error: errorMessage });
            toolSpan.end({
              status: 'ERROR',
              errorMessage,
              output: resultContent,
            });
            arizeToolSpan.setAttribute(OUTPUT_VALUE, resultContent);
            arizeToolSpan.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
            if (error instanceof Error) arizeToolSpan.recordException(error);
            arizeToolSpan.end();
            braintrustToolSpan.log({ output: resultContent, error: errorMessage });
            braintrustToolSpan.end();
          }
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: resultContent,
        });
      }
    }

    return answer;
  } catch (error) {
    failure = error instanceof Error ? error : new Error(String(error));
    throw error;
  } finally {
    // Set provider/model on the root span too, so the session reads
    // 'openai / gpt-4o-mini' instead of 'unknown / unknown' in the flat trace
    // list (child LLM spans carry these, but the root AGENT span otherwise won't).
    await trace.end({
      output: answer,
      provider: 'openai',
      model: 'gpt-4o-mini',
      ...(failure ? { status: 'ERROR' as const, errorMessage: failure.message } : {}),
    });

    chainSpan.setAttribute(OUTPUT_VALUE, answer);
    if (failure) {
      chainSpan.setStatus({ code: SpanStatusCode.ERROR, message: failure.message });
      chainSpan.recordException(failure);
    } else {
      chainSpan.setStatus({ code: SpanStatusCode.OK });
    }
    chainSpan.end();

    braintrustSpan.log({
      output: answer,
      ...(failure ? { error: failure.message } : {}),
    });
    braintrustSpan.end();

    // Serverless can freeze the instance as soon as the response returns, so
    // push the spans out before that happens.
    await flushArizeTracing();
    await flushBraintrustTracing();
  }
}
