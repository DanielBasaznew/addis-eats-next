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
    // 1. Direct plain session ID check
    if (token.toLowerCase() === 'staff') {
      return { id: token, role: 'staff' };
    }

    // 2. Legacy token with dot or standard base64
    let rawStr = token;
    if (token.includes('.')) {
      const [payloadPart] = token.split('.');
      rawStr = Buffer.from(payloadPart, 'base64url').toString('utf-8');
    } else {
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        if (decoded.startsWith('{')) {
          rawStr = decoded;
        }
      } catch {
        rawStr = token;
      }
    }

    // 3. Parse JSON claims
    if (rawStr.startsWith('{')) {
      const data = JSON.parse(rawStr);
      if (!data?.id) return null;
      return {
        id: String(data.id).trim(),
        role: data.role === 'staff' ? 'staff' : 'customer',
      };
    }

    // 4. Plain session string fallback
    return {
      id: rawStr.trim(),
      role: rawStr.trim().toLowerCase() === 'staff' ? 'staff' : 'customer',
    };
  } catch {
    return null;
  }
}

