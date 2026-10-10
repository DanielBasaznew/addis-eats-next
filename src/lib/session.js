import { cookies } from 'next/headers';
import { signSessionToken, verifySessionToken } from './session-token';

export { signSessionToken, verifySessionToken } from './session-token';

export const SESSION_COOKIE_NAME = 'session';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function createSession(sessionId, explicitRole = 'customer') {
  const cookieStore = await cookies();
  const role = explicitRole === 'staff' ? 'staff' : 'customer';
  const token = signSessionToken({ id: sessionId, role });

  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}