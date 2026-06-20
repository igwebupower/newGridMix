// Lightweight, self-serve API keys for the public MCP server.
// No database: a key is a signed JWT carrying the requester's email, verified
// by signature alone. This buys a stable per-requester identity (so rate
// limits survive IP rotation) and adds real friction over fully anonymous
// access, without needing any persistent storage.

import { SignJWT, jwtVerify } from 'jose';

const ISSUER = 'gridmix';

function getSecret(): Uint8Array {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) throw new Error('API_KEY_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function issueApiKey(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifyApiKey(key: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(key, getSecret(), { issuer: ISSUER });
    if (typeof payload.email !== 'string') return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
