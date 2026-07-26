// Braintrust tracing — EVALUATION ONLY (branch: arize-tracing-eval).
//
// Third tracing provider alongside Enprompta (primary, see lib/watt-conversation.ts)
// and Arize AX (see lib/arize-tracing.ts), added to compare captured data across
// all three on identical traffic. Same idempotent-init / credentials-optional
// shape as initArizeTracing() so a missing key degrades to "no Braintrust trace"
// rather than breaking Watt.
//
// Unlike Arize's OpenAIInstrumentation, wrapOpenAI() wraps the exact client
// instance it's given rather than patching a require()'d copy of the `openai`
// module, so it doesn't hit the Next.js bundler module-identity issue that
// forced Enprompta onto tracedOpenAI() and Arize onto manuallyInstrument() —
// no serverExternalPackages entry needed for it.

import { initLogger, type Logger } from 'braintrust';

const PROJECT_NAME = process.env.BRAINTRUST_PROJECT_NAME ?? 'gridmix-watt';

let logger: Logger | null = null;

/**
 * Idempotent for the same reason as initArizeTracing(): Next.js re-evaluates
 * modules per route bundle but keeps the process alive across requests.
 * Returns null when no API key is configured — that's a normal state on this
 * branch, not an error.
 */
export function initBraintrustTracing(): Logger | null {
  if (logger) return logger;

  if (!process.env.BRAINTRUST_API_KEY) {
    console.warn('Braintrust tracing disabled: set BRAINTRUST_API_KEY to enable it.');
    return null;
  }

  logger = initLogger({
    projectName: PROJECT_NAME,
    apiKey: process.env.BRAINTRUST_API_KEY,
  });

  return logger;
}

/**
 * Serverless invocations can freeze the moment the response is returned, so
 * callers that finish a traced unit of work should await this — same reason
 * flushArizeTracing() exists.
 */
export async function flushBraintrustTracing(): Promise<void> {
  if (!logger) return;
  try {
    await logger.flush();
  } catch (error) {
    console.error('Braintrust flush failed:', error);
  }
}
