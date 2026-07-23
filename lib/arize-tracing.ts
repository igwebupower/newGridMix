// Arize AX tracing — EVALUATION ONLY (branch: arize-tracing-eval).
//
// This exists to compare what Arize/OpenInference captures against the app's
// primary instrumentation, which is the Enprompta SDK (see lib/watt-conversation.ts).
// It runs *alongside* Enprompta rather than replacing it: both observe the same
// OpenAI calls, so every model turn is recorded twice while this branch is live.
//
// Wiring follows Arize's OpenAI TS integration doc. The important detail for
// Next.js is `manuallyInstrument(OpenAI)`: the usual auto-instrumentation
// patches whatever copy of the `openai` module *the instrumentor itself*
// resolves, and under Next's bundler that is not the copy the route imports —
// the same module-identity trap that stopped Enprompta's global init() from
// working here. Handing the instrumentor our own `OpenAI` import sidesteps it,
// but only because this file is bundled with the route that uses the client.

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { SEMRESATTRS_PROJECT_NAME } from '@arizeai/openinference-semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { OpenAIInstrumentation } from '@arizeai/openinference-instrumentation-openai';
import OpenAI from 'openai';

const PROJECT_NAME = process.env.ARIZE_PROJECT_NAME ?? 'gridmix-watt';

let provider: NodeTracerProvider | null = null;

/**
 * Idempotent. Next.js re-evaluates modules per route bundle and keeps the
 * process alive across requests, so without the guard we would register a
 * second provider (and a second set of patches) on every cold module load.
 *
 * Returns null when credentials are absent — no Arize account configured is a
 * normal state on this branch, and it must not take Watt down. The exporter
 * would otherwise retry against otlp.arize.com on every request.
 */
export function initArizeTracing(): NodeTracerProvider | null {
  if (provider) return provider;

  const spaceId = process.env.ARIZE_SPACE_ID;
  const apiKey = process.env.ARIZE_API_KEY;

  if (!spaceId || !apiKey) {
    console.warn(
      'Arize tracing disabled: set ARIZE_SPACE_ID and ARIZE_API_KEY to enable it.'
    );
    return null;
  }

  provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      // Arize rejects the export with a 500 if the project name is missing;
      // service.name alone is not enough.
      [ATTR_SERVICE_NAME]: PROJECT_NAME,
      [SEMRESATTRS_PROJECT_NAME]: PROJECT_NAME,
    }),
    spanProcessors: [
      new SimpleSpanProcessor(
        new OTLPTraceExporter({
          url: 'https://otlp.arize.com/v1/traces',
          headers: {
            'arize-space-id': spaceId,
            'arize-api-key': apiKey,
          },
        })
      ),
    ],
  });

  provider.register();

  const instrumentation = new OpenAIInstrumentation();
  instrumentation.manuallyInstrument(OpenAI);
  registerInstrumentations({ instrumentations: [instrumentation] });

  return provider;
}

/**
 * Serverless invocations can freeze the moment the response is returned, and
 * SimpleSpanProcessor's export is still in flight at that point. Callers that
 * finish a traced unit of work should await this.
 */
export async function flushArizeTracing(): Promise<void> {
  if (!provider) return;
  try {
    await provider.forceFlush();
  } catch (error) {
    // Never let a telemetry failure surface as a user-facing error.
    console.error('Arize forceFlush failed:', error);
  }
}
