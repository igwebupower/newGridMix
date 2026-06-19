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

// MCP clients are normally server-to-server (Claude Desktop, Claude.ai
// connectors) and unaffected by CORS, but browser-based tooling like the
// official MCP Inspector connects directly from a page origin and needs
// these to avoid being blocked.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version',
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

const DISCLAIMER =
  'GridMix data is informational/educational only — not warranted for accuracy and not intended for trading, ' +
  'critical infrastructure, emergency response, or regulatory compliance use. Source data: Elexon BMRS ' +
  '(© Elexon Limited) and University of Sheffield Solar PVLive. Full terms: https://gridmix.co.uk/terms';

function createServer(): Server {
  const server = new Server(
    { name: 'gridmix', version: '1.0.0' },
    { capabilities: { tools: {} }, instructions: DISCLAIMER }
  );

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
      console.error(`MCP tool execution failed (${request.params.name}):`, error);
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
      { status: 429, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return withCors(await transport.handleRequest(req));
}

export async function GET() {
  return new Response(
    JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null }),
    { status: 405, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
