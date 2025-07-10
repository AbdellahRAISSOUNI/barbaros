import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// PHASE 1 FIX: Simple rate limiting store (in production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function rateLimit(req: NextRequest, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(clientIp);
  
  if (!current || current.resetTime < now) {
    // New window
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  current.count++;
  return true;
}

export default withAuth(
  function middleware(req) {
    // PHASE 1 FIX: Add rate limiting for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      if (!rateLimit(req, 1000, 60000)) { // 1000 requests per minute
        return new NextResponse('Too Many Requests', { status: 429 });
      }
  }
  
    // PHASE 1 FIX: Enhanced security headers
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Allow camera access for scanner functionality, restrict others
    response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
    
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes
        if (
          pathname === '/' ||
          pathname === '/gallery' ||
          pathname === '/login' ||
          pathname === '/register' ||
          pathname === '/reservations/new' ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/register') ||
          pathname.startsWith('/api/reservations') ||
          pathname.startsWith('/api/db-status') ||
          pathname.startsWith('/api/test-db') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          pathname.includes('.')
        ) {
          return true;
        }

        // PHASE 1 FIX: Enhanced session validation
        if (!token) {
          return false;
  }
  
        // Validate token structure (email can be empty for clients)
        if (!token.id || !token.role) {
          console.warn('Invalid token structure detected');
          return false;
        }

        // Route-based authorization
        if (pathname.startsWith('/admin')) {
          return token.role === 'owner' || token.role === 'admin' || token.role === 'receptionist';
        }

        if (pathname.startsWith('/barber')) {
          return token.role === 'barber' || token.role === 'owner' || token.role === 'admin';
  }
  
        if (pathname.startsWith('/client')) {
          return token.role === 'client';
        }

        // Default to requiring authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 