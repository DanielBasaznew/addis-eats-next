import { NextResponse } from 'next/server';

const FALLBACK_DEV_SECRET =
  'addis-eats-fallback-dev-secret-do-not-use-in-production-32chars';

async function verifyToken(token) {
  if (typeof token !== 'string' || !token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadString, signature] = parts;
  if (!payloadString || !signature) return null;

  try {
    const secret = process.env.SESSION_SECRET || FALLBACK_DEV_SECRET;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      enc.encode(payloadString)
    );
    const bytes = new Uint8Array(sigBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSignature = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Constant-time signature comparison to mitigate timing attacks
    if (signature.length !== expectedSignature.length) return null;
    let mismatch = 0;
    for (let i = 0; i < signature.length; i++) {
      mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    if (mismatch !== 0) return null;

    const base64 = payloadString.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(base64);
    const data = JSON.parse(jsonStr);

    if (!data || typeof data.id !== 'string') return null;

    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
    if (
      typeof data.createdAt === 'number' &&
      Date.now() - data.createdAt > MAX_AGE_MS
    ) {
      return null;
    }

    return {
      id: data.id.trim(),
      role: data.role === 'staff' ? 'staff' : 'customer',
    };
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const sessionToken = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const session = await verifyToken(sessionToken);

  // Layer 1 perimeter check: verify cryptographic authenticity of session
  if (!session) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('next', pathname);

    return NextResponse.redirect(signInUrl);
  }

  // Layer 1 staff role enforcement: reject non-staff sessions from /kitchen and /admin
  if (
    (pathname.startsWith('/kitchen') || pathname.startsWith('/admin')) &&
    session.role !== 'staff'
  ) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('next', pathname);
    signInUrl.searchParams.set('error', 'staff_required');

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/checkout/:path*',
    '/orders/:path*',
    '/kitchen/:path*',
    '/admin/:path*',
    '/favorites/:path*',
  ],
};