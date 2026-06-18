// Shared tool-calling loop for Watt — used by both the internal dashboard
// widget (app/api/watt) and the public developer endpoint (app/api/v1/watt).
// Keeping this in one place means a prompt or tool-loop change only has to
// happen once for both surfaces to pick it up.

import { wattTools } from './watt-tools';

export const MAX_TOOL_TURNS = 4;
export const MAX_HISTORY_MESSAGES = 6;

export const WATT_SYSTEM_PROMPT = `You are Watt, GridMix's assistant for questions about the UK electricity grid.

Rules:
- Answer ONLY using data returned by your tools. Never rely on general knowledge, training data, or guesses about grid conditions — they change every few minutes and stale knowledge would mislead the user.
- Call at least one tool before answering any question about grid data, prices, solar, frequency, carbon intensity, or historical UK electricity trends — including follow-up questions. Never reuse a figure from earlier in the conversation without calling a tool again to re-check it; the only thing earlier turns are good for is resolving what the user means (e.g. which fuel, which day), not supplying the actual numbers.
- If none of your tools can answer the question, say so plainly in one sentence and suggest what GridMix can answer instead. Do not speculate.
- If a historical archive tool result has data_quality of "estimated", "partial", or "interpolated", say so briefly rather than stating the figure as certain.
- Keep answers short and conversational: 1-3 sentences of prose.
- Always end your answer with a line starting exactly "Source:" naming the data source(s) and a human-readable timestamp or period from the tool result(s) you used. If you didn't call a tool, omit the Source line.
- Convert ISO timestamps to plain UK time in your prose (e.g. "2:32pm"), but keep the Source line's timestamp precise.`;

export interface WattHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
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
  history: WattHistoryMessage[] = []
): Promise<string> {
  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const messages: OpenAIMessage[] = [
    { role: 'system', content: WATT_SYSTEM_PROMPT },
    ...trimmedHistory.map((h) => ({ role: h.role, content: h.content })),
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
