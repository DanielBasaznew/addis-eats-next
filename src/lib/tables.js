import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const DEFAULT_TABLES = [
  {
    id: 'tbl-1',
    number: '1',
    label: 'Window Booth',
    seats: 4,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tbl-2',
    number: '2',
    label: 'Main Hall',
    seats: 2,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tbl-3',
    number: '3',
    label: 'Main Hall',
    seats: 4,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tbl-4',
    number: '4',
    label: 'Garden Patio',
    seats: 6,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tbl-5',
    number: '5',
    label: 'Garden Patio',
    seats: 4,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tbl-6',
    number: '6',
    label: 'VIP Lounge',
    seats: 8,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
];

const PUBLIC_TABLES_FILE = path.join(process.cwd(), 'public', 'tables.json');
const TMP_TABLES_FILE = path.join(os.tmpdir(), 'addis_tables.json');
const SYNC_TABLES_OBJECT_ID = 'ff808181a09d98f701a13b38ebe96082';

const globalForTables = globalThis;
let lastTmpTablesMtime = 0;

function loadTablesFromDisk() {
  try {
    if (fs.existsSync(TMP_TABLES_FILE)) {
      const fileContents = fs.readFileSync(TMP_TABLES_FILE, 'utf-8');
      const parsed = JSON.parse(fileContents);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore tmp read errors
  }

  try {
    if (fs.existsSync(PUBLIC_TABLES_FILE)) {
      const fileContents = fs.readFileSync(PUBLIC_TABLES_FILE, 'utf-8');
      const parsed = JSON.parse(fileContents);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading tables.json:', error);
  }

  return [...DEFAULT_TABLES];
}

function saveTablesToDisk(tablesList) {
  const serialized = JSON.stringify(tablesList, null, 2);

  // 1. Write to /tmp (always writable in Vercel Serverless environment)
  try {
    fs.writeFileSync(TMP_TABLES_FILE, serialized, 'utf-8');
    const stat = fs.statSync(TMP_TABLES_FILE);
    lastTmpTablesMtime = stat.mtimeMs;
  } catch (error) {
    console.error('Error saving tables to tmp:', error);
  }

  // 2. Also write to public/tables.json for local dev persistence
  try {
    fs.writeFileSync(PUBLIC_TABLES_FILE, serialized, 'utf-8');
  } catch {
    // Expected EROFS on Vercel serverless read-only filesystem
  }

  return true;
}

function ensureTablesLoaded() {
  let needsReload = !globalForTables.__addis_tables__;

  if (fs.existsSync(TMP_TABLES_FILE)) {
    try {
      const stat = fs.statSync(TMP_TABLES_FILE);
      if (stat.mtimeMs > lastTmpTablesMtime) {
        lastTmpTablesMtime = stat.mtimeMs;
        needsReload = true;
      }
    } catch {
      // Ignore stat error
    }
  }

  if (needsReload) {
    globalForTables.__addis_tables__ = loadTablesFromDisk();
  }
  return globalForTables.__addis_tables__;
}

export const TABLES_COOKIE_NAME = 'addis_custom_tables';

/**
 * Hydrates tables from cookieStore if available, ensuring custom tables
 * created in serverless Vercel environments persist across lambdas.
 */
export function hydrateTables(cookieStore) {
  if (cookieStore) {
    try {
      const cookieVal = cookieStore.get(TABLES_COOKIE_NAME)?.value;
      if (cookieVal) {
        const parsed = JSON.parse(cookieVal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          globalForTables.__addis_tables__ = parsed;
          saveTablesToDisk(parsed);
          return parsed;
        }
      }
    } catch {}
  }
  return ensureTablesLoaded();
}

/**
 * Save tables list to cookieStore for instant serverless cross-lambda persistence.
 */
export function saveTablesToCookie(cookieStore, tablesList) {
  if (!cookieStore || !Array.isArray(tablesList)) return;
  try {
    cookieStore.set(TABLES_COOKIE_NAME, JSON.stringify(tablesList), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (err) {
    console.error('Failed to save tables cookie:', err);
  }
}

export async function getTables(cookieStore) {
  return hydrateTables(cookieStore);
}

export async function getTableByNumber(number, cookieStore) {
  if (!number) return null;
  const tables = hydrateTables(cookieStore);
  const clean = String(number).trim().toLowerCase();
  return (
    tables.find(
      (t) =>
        String(t.number).trim().toLowerCase() === clean ||
        String(t.id).trim().toLowerCase() === clean
    ) || null
  );
}

export async function createTable(tableData, cookieStore) {
  const tables = hydrateTables(cookieStore);
  const trimmedNumber = String(tableData.number || '').trim();
  if (!trimmedNumber) return null;

  // Check for duplicate number
  const exists = tables.some((t) => String(t.number).trim() === trimmedNumber);
  if (exists) {
    return { error: `Table #${trimmedNumber} already exists.` };
  }

  const newTable = {
    id: `tbl-${Date.now()}`,
    number: trimmedNumber,
    label: String(tableData.label || '').trim() || 'General Dining',
    seats: Number(tableData.seats) || 4,
    createdAt: new Date().toISOString(),
  };

  tables.push(newTable);
  saveTablesToDisk(tables);
  if (cookieStore) {
    saveTablesToCookie(cookieStore, tables);
  }
  pushRemoteTables(tables).catch(() => {});

  return newTable;
}

export async function deleteTable(id, cookieStore) {
  if (!id) return false;
  const tables = hydrateTables(cookieStore);
  const index = tables.findIndex((t) => String(t.id) === String(id));
  if (index === -1) return false;

  tables.splice(index, 1);
  saveTablesToDisk(tables);
  if (cookieStore) {
    saveTablesToCookie(cookieStore, tables);
  }
  pushRemoteTables(tables).catch(() => {});

  return true;
}

export async function resetDefaultTables(cookieStore) {
  const tables = [...DEFAULT_TABLES];
  globalForTables.__addis_tables__ = tables;
  saveTablesToDisk(tables);
  if (cookieStore) {
    saveTablesToCookie(cookieStore, tables);
  }
  pushRemoteTables(tables).catch(() => {});
  return tables;
}

export async function fetchRemoteTables() {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${SYNC_TABLES_OBJECT_ID}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data) && json.data.length > 0) {
        globalForTables.__addis_tables__ = json.data;
        saveTablesToDisk(json.data);
        return json.data;
      }
    }
  } catch {
    // Safe no-op on network issues
  }
  return null;
}

export async function pushRemoteTables(tables) {
  try {
    await fetch(`https://api.restful-api.dev/objects/${SYNC_TABLES_OBJECT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'addis_eats_tables_sync',
        data: tables,
      }),
      cache: 'no-store',
    });
  } catch {
    // Safe no-op on network issues
  }
}
