import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';
import { rateLimit } from './lib/rate-limit';

// Rate limit config: 60 requests per minute per IP
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;

// Simple logging helper - logs appear in Vercel Functions logs
function logApiRequest(
  ip: string,
  pathname: string,
  status: number,
  rateLimitRemaining: number,
  userAgent?: string
) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'API_REQUEST',
    ip: ip.substring(0, 20), // Truncate for privacy
    path: pathname,
    status,
    rateLimitRemaining,
    userAgent: userAgent?.substring(0, 100) || 'unknown',
  };
  console.log(JSON.stringify(logData));
}

function logRateLimitViolation(ip: string, pathname: string, userAgent?: string) {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'RATE_LIMIT_VIOLATION',
    ip,
    path: pathname,
    userAgent: userAgent?.substring(0, 100) || 'unknown',
    severity: 'warning',
  };
  console.warn(JSON.stringify(logData));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit API v1 endpoints
  if (pathname.startsWith('/api/v1')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'anonymous';
    const userAgent = request.headers.get('user-agent') || undefined;

    const result = rateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS);

    // Add rate limit headers to all API responses
    const headers = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
    };

    if (!result.success) {
      // Log rate limit violation
      logRateLimitViolation(ip, pathname, userAgent);

      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Maximum ${RATE_LIMIT} requests per minute.`,
          retry_after: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Log successful API request (sample 10% to reduce noise)
    if (Math.random() < 0.1) {
      logApiRequest(ip, pathname, 200, result.remaining, userAgent);
    }

    // Continue with rate limit headers
    const response = NextResponse.next();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Protect /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const session = await verifySession(token);

    if (!session) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/v1/:path*',
  ],
};
