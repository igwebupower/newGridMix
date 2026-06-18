// MCP (Model Context Protocol) server for GridMix.
// Exposes the same tools Watt uses internally — live grid mix, solar,
// frequency, price, and the 2000-2025 historical archive — directly to
// MCP-compatible clients (Claude, Claude Desktop, ChatGPT, etc.) so they can
// query real GridMix data instead of guessing from training knowledge.
// Stateless: a fresh Server + transport per request, since Vercel functions
// don't share memory across invocations.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { rateLimit } from '@/lib/rate-limit';
import { wattTools } from '@/lib/watt-tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAILY_LIMIT = 500;

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function createServer(): Server {
  const server = new Server({ name: 'gridmix', version: '1.0.0' }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: wattTools.map((t) => ({
      name: t.definition.function.name,
      description: t.definition.function.description,
      inputSchema: t.definition.function.parameters,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = wattTools.find((t) => t.definition.function.name === request.params.name);
    if (!tool) {
      return {
        content: [{ type: 'text' as const, text: `Unknown tool: ${request.params.name}` }],
        isError: true,
      };
    }
    try {
      const result = await tool.execute((request.params.arguments as Record<string, unknown>) || {});
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: error instanceof Error ? error.message : 'Tool execution failed' }],
        isError: true,
      };
    }
  });

  return server;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip, DAILY_LIMIT, 24 * 60 * 60 * 1000, 'mcp');

  if (!limit.success) {
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: `Rate limit exceeded: ${DAILY_LIMIT} requests/day per IP.` },
        id: null,
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return transport.handleRequest(req);
}

export async function GET() {
  return new Response(
    JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
