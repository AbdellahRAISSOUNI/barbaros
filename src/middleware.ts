import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isBarberRoute = request.nextUrl.pathname.startsWith('/barber');
  const isClientRoute = request.nextUrl.pathname.startsWith('/client');
  const isAuthRoute = request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/register';
  
  // Redirect unauthenticated users to login
  if ((isAdminRoute || isBarberRoute || isClientRoute) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect authenticated users away from auth routes
  if (isAuthRoute && token) {
    if (token.userType === 'admin') {
      // Redirect based on specific role
      if (token.role === 'barber') {
        return NextResponse.redirect(new URL('/barber', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } else if (token.userType === 'client') {
      return NextResponse.redirect(new URL('/client', request.url));
    }
  }
  
  // Check role-based access for admin routes (only allow admin roles, not barbers)
  if (isAdminRoute && token && (token.userType !== 'admin' || token.role === 'barber')) {
    // Redirect barbers to their own dashboard
    if (token.role === 'barber') {
      return NextResponse.redirect(new URL('/barber', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check role-based access for barber routes (only allow barber role)
  if (isBarberRoute && token && (token.userType !== 'admin' || token.role !== 'barber')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check role-based access for client routes
  if (isClientRoute && token && token.userType !== 'client') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/barber/:path*',
    '/client/:path*', 
    '/login',
    '/register'
  ],
}; 