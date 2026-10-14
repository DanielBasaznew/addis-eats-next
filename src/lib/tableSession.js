export const TABLE_SESSION_KEY = 'addis_eats_table_session';

/**
 * Retrieve active dining table number from URL search parameters, sessionStorage, or document cookie.
 */
export function getTableNumber(searchParams) {
  let queryTable = null;

  if (searchParams) {
    if (typeof searchParams.get === 'function') {
      queryTable = searchParams.get('table');
    } else if (typeof searchParams === 'object' && searchParams.table) {
      queryTable = searchParams.table;
    }
  }

  if (!queryTable && typeof window !== 'undefined' && window.location) {
    try {
      const params = new URLSearchParams(window.location.search);
      queryTable = params.get('table');
    } catch {}
  }

  if (queryTable && String(queryTable).trim()) {
    const cleanTable = String(queryTable).trim();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(TABLE_SESSION_KEY, cleanTable);
        document.cookie = `${TABLE_SESSION_KEY}=${encodeURIComponent(cleanTable)}; path=/; max-age=86400; SameSite=Lax`;
      } catch {}
    }
    return cleanTable;
  }

  if (typeof window !== 'undefined') {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const sessionTable = sessionStorage.getItem(TABLE_SESSION_KEY);
        if (sessionTable && String(sessionTable).trim()) {
          return String(sessionTable).trim();
        }
      }
    } catch {}

    try {
      const match = document.cookie.match(new RegExp(`(?:^|; )${TABLE_SESSION_KEY}=([^;]*)`));
      if (match && match[1]) {
        return decodeURIComponent(match[1]).trim();
      }
    } catch {}
  }

  return null;
}

/**
 * Set active table session across sessionStorage and cookies.
 */
export function setTableSession(tableNumber) {
  if (!tableNumber) return;
  const clean = String(tableNumber).trim();
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(TABLE_SESSION_KEY, clean);
      document.cookie = `${TABLE_SESSION_KEY}=${encodeURIComponent(clean)}; path=/; max-age=86400; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent('table-session-changed', { detail: { tableNumber: clean } }));
    } catch {}
  }
}

/**
 * Clear table dining session.
 */
export function clearTableSession() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(TABLE_SESSION_KEY);
      document.cookie = `${TABLE_SESSION_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      window.dispatchEvent(new CustomEvent('table-session-changed', { detail: { tableNumber: null } }));
    } catch {}
  }
}

/**
 * Append table query to internal navigation link if active.
 */
export function appendTableQuery(path, tableNumber) {
  if (!path || !tableNumber) return path;

  const [baseAndQuery, hash] = path.split('#');
  const separator = baseAndQuery.includes('?') ? '&' : '?';
  const updatedPath = `${baseAndQuery}${separator}table=${encodeURIComponent(String(tableNumber).trim())}`;

  return hash !== undefined ? `${updatedPath}#${hash}` : updatedPath;
}
