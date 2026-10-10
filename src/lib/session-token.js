import crypto from 'node:crypto';

const FALLBACK_DEV_SECRET = 'addis-eats-fallback-dev-secret-do-not-use-in-production-32chars';

export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SESSION_SECRET environment variable is missing in production. Set a secure secret of at least 32 characters.'
      );
    }
    return FALLBACK_DEV_SECRET;
  }

  return secret;
}

export function signSessionToken(payload) {
  if (!payload || typeof payload !== 'object' || !payload.id) {
    throw new Error('Cannot sign session token without a valid payload containing an id');
  }

  const role = payload.role === 'staff' ? 'staff' : 'customer';

  const normalizedPayload = {
    id: String(payload.id).trim(),
    role,
    createdAt: typeof payload.createdAt === 'number' ? payload.createdAt : Date.now(),
  };

  const payloadString = Buffer.from(JSON.stringify(normalizedPayload)).toString('base64url');
  const secret = getSessionSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('base64url');

  return `${payloadString}.${signature}`;
}

export function verifySessionToken(token) {
  if (typeof token !== 'string' || !token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadString, signature] = parts;
  if (!payloadString || !signature) {
    return null;
  }

  try {
    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('base64url');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payloadJson = Buffer.from(payloadString, 'base64url').toString('utf-8');
    const data = JSON.parse(payloadJson);

    if (!data || typeof data.id !== 'string' || !data.id.trim()) {
      return null;
    }

    // Expiry verification: 7 days
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
    if (typeof data.createdAt === 'number' && Date.now() - data.createdAt > MAX_AGE_MS) {
      return null;
    }

    const id = data.id.trim();
    // Role verification: role is derived strictly from verified signed token payload
    const role = data.role === 'staff' ? 'staff' : 'customer';

    return {
      id,
      role,
    };
  } catch {
    return null;
  }
}
