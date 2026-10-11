export function signSessionToken(payload) {
  if (!payload || typeof payload !== 'object' || !payload.id) {
    throw new Error('Cannot sign session token without a valid payload containing an id');
  }

  const role = payload.role === 'staff' ? 'staff' : 'customer';
  const data = {
    id: String(payload.id).trim(),
    role,
  };

  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export function verifySessionToken(token) {
  if (typeof token !== 'string' || !token) {
    return null;
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const data = JSON.parse(decoded);
    if (!data?.id) return null;

    return {
      id: String(data.id).trim(),
      role: data.role === 'staff' ? 'staff' : 'customer',
    };
  } catch {
    return null;
  }
}

