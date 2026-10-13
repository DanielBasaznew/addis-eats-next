import { NextResponse } from 'next/server';

function getSessionRole(token) {
  if (!token) return null;
  try {
    const jsonStr = atob(token);
    const data = JSON.parse(jsonStr);
    return data?.role === 'staff' ? 'staff' : 'customer';
  } catch {
    return null;
  }
}

export function middleware(request) {
  const sessionToken = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Layer 1 perimeter check: verify a session cookie exists
  if (!sessionToken) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('next', pathname);

    return NextResponse.redirect(signInUrl);
  }

  // Layer 1 staff role enforcement: reject non-staff sessions from /kitchen, /admin, and /dashboard
  if (
    pathname.startsWith('/kitchen') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard')
  ) {
    const role = getSessionRole(sessionToken);
    if (role !== 'staff') {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('next', pathname);
      signInUrl.searchParams.set('error', 'staff_required');

      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/orders/:path*',
    '/kitchen/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/favorites/:path*',
  ],
};