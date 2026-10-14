import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { removeDishFromAllFavorites } from './favorites.js';

const PUBLIC_DISHES_FILE = path.join(process.cwd(), 'public', 'dishes.json');
const TMP_DISHES_FILE = path.join(os.tmpdir(), 'addis_dishes.json');
const SYNC_DISHES_OBJECT_ID = 'ff808181a09d98f701a13b0526496024';

const globalForDishes = globalThis;
let lastTmpDishesMtime = 0;

/**
 * Read dishes from disk into memory. Checks /tmp first (persists on Vercel),
 * then falls back to public/dishes.json.
 */
function loadDishesFromDisk() {
  try {
    if (fs.existsSync(TMP_DISHES_FILE)) {
      const fileContents = fs.readFileSync(TMP_DISHES_FILE, 'utf-8');
      const parsed = JSON.parse(fileContents);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore tmp read errors
  }

  try {
    if (fs.existsSync(PUBLIC_DISHES_FILE)) {
      const fileContents = fs.readFileSync(PUBLIC_DISHES_FILE, 'utf-8');
      const parsed = JSON.parse(fileContents);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading dishes.json:', error);
  }
  return [];
}

/**
 * Persist dishes from memory to disk (/tmp on Vercel and public/dishes.json locally).
 */
function saveDishesToDisk(dishesList) {
  const serialized = JSON.stringify(dishesList, null, 2);

  // 1. Write to /tmp (always writable in Vercel Serverless environment)
  try {
    fs.writeFileSync(TMP_DISHES_FILE, serialized, 'utf-8');
    const stat = fs.statSync(TMP_DISHES_FILE);
    lastTmpDishesMtime = stat.mtimeMs;
  } catch (error) {
    console.error('Error saving dishes to tmp:', error);
  }

  // 2. Also write to public/dishes.json for local dev persistence
  try {
    fs.writeFileSync(PUBLIC_DISHES_FILE, serialized, 'utf-8');
  } catch {
    // Expected EROFS on Vercel serverless read-only filesystem
  }

  return true;
}

/**
 * Initialize in-memory cache if not already populated or if /tmp was updated by another process.
 */
function ensureDishesLoaded() {
  let needsReload = !globalForDishes.__addis_dishes__;

  if (fs.existsSync(TMP_DISHES_FILE)) {
    try {
      const stat = fs.statSync(TMP_DISHES_FILE);
      if (stat.mtimeMs > lastTmpDishesMtime) {
        lastTmpDishesMtime = stat.mtimeMs;
        needsReload = true;
      }
    } catch {
      // Ignore stat error
    }
  }

  if (needsReload) {
    globalForDishes.__addis_dishes__ = loadDishesFromDisk();
  }
  return globalForDishes.__addis_dishes__;
}

/**
 * Apply availability overrides map { [dishId]: boolean } to dishes list.
 */
export function applyAvailabilityToDishes(dishesList, availabilityMap) {
  if (!Array.isArray(dishesList)) return [];
  if (!availabilityMap || typeof availabilityMap !== 'object') return dishesList;

  return dishesList.map((dish) => {
    const key = String(dish.id);
    if (availabilityMap[key] !== undefined) {
      return {
        ...dish,
        available: Boolean(availabilityMap[key]),
      };
    }
    return dish;
  });
}

/**
 * Mutate in-memory dishes cache with availability overrides.
 */
export function syncDishAvailabilityOverrides(overrides) {
  if (!overrides || typeof overrides !== 'object') return;
  const dishes = ensureDishesLoaded();
  for (const [id, available] of Object.entries(overrides)) {
    const dish = dishes.find((d) => String(d.id) === String(id));
    if (dish) {
      dish.available = Boolean(available);
    }
  }
  saveDishesToDisk(dishes);
}

/**
 * Fetch remote availability overrides for cross-container / cross-browser sync on Vercel.
 */
export async function fetchRemoteDishAvailability() {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${SYNC_DISHES_OBJECT_ID}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data && typeof json.data === 'object') {
        syncDishAvailabilityOverrides(json.data);
        return json.data;
      }
    }
  } catch {
    // Safe no-op on network issues
  }
  return null;
}

/**
 * Broadcast dish availability change to remote store so isolated serverless containers synchronize.
 */
export async function pushRemoteDishAvailability(dishId, available) {
  try {
    const current = (await fetchRemoteDishAvailability()) || {};
    current[String(dishId)] = Boolean(available);
    await fetch(`https://api.restful-api.dev/objects/${SYNC_DISHES_OBJECT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'addis_eats_dish_availability_sync',
        data: current,
      }),
      cache: 'no-store',
    });
  } catch {
    // Safe no-op on network issues
  }
}

/**
 * Retrieve all dishes.
 */
export async function getDishes() {
  return ensureDishesLoaded();
}

/**
 * Retrieve a dish by ID.
 */
export async function getDishById(id) {
  const dishes = ensureDishesLoaded();
  return dishes.find((item) => String(item.id) === String(id)) || null;
}

/**
 * Retrieve a dish strictly by its dish name or name slug.
 * Rejects typos and numeric IDs.
 * Supports:
 * - "Doro Wot", "Doro%20Wot", "doro wot"
 * - "doro-wot"
 */
export async function getDishBySlugOrId(param) {
  if (!param) return null;
  const dishes = await ensureDishesLoaded();
  const raw = String(param).trim();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw).trim();
  } catch {
    decoded = raw;
  }

  const cleanSlug = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const normalizedParam = cleanSlug(decoded);

  // 1. Exact or case-insensitive dish name match (e.g. "Doro Wot" or "doro wot")
  const byName = dishes.find((d) => d.name.toLowerCase() === decoded.toLowerCase());
  if (byName) return byName;

  // 2. Clean name slug match (e.g. "doro-wot")
  const bySlug = dishes.find((d) => cleanSlug(d.name) === normalizedParam);
  if (bySlug) return bySlug;

  return null;
}

export const getDishByName = getDishBySlugOrId;

/**
 * Create a new dish.
 * @param {Object} dishData
 */
export async function createDish(dishData) {
  const dishes = await ensureDishesLoaded();

  // Generate next unique numeric ID
  const maxId = dishes.reduce((max, d) => Math.max(max, Number(d.id) || 0), 0);
  const newId = maxId + 1;

  const newDish = {
    id: newId,
    name: dishData.name.trim(),
    category: dishData.category.trim(),
    price: Number(dishData.price),
    vegetarian: Boolean(dishData.vegetarian),
    available: dishData.available !== undefined ? Boolean(dishData.available) : true,
    image: dishData.image?.trim() || '/images/dishes/genfo.jpg',
    description: dishData.description?.trim() || undefined,
  };

  dishes.push(newDish);
  await saveDishesToDisk(dishes);

  return newDish;
}

/**
 * Update an existing dish.
 * @param {number|string} id
 * @param {Object} dishData
 */
export async function updateDish(id, dishData) {
  const dishes = await ensureDishesLoaded();
  const index = dishes.findIndex((item) => String(item.id) === String(id));

  if (index === -1) {
    return null;
  }

  const existing = dishes[index];
  const updatedDish = {
    ...existing,
    name: dishData.name !== undefined ? dishData.name.trim() : existing.name,
    category: dishData.category !== undefined ? dishData.category.trim() : existing.category,
    price: dishData.price !== undefined ? Number(dishData.price) : existing.price,
    vegetarian: dishData.vegetarian !== undefined ? Boolean(dishData.vegetarian) : existing.vegetarian,
    available: dishData.available !== undefined ? Boolean(dishData.available) : existing.available !== undefined ? existing.available : true,
    image: dishData.image !== undefined ? dishData.image.trim() : existing.image,
    description: dishData.description !== undefined ? dishData.description.trim() : existing.description,
  };

  dishes[index] = updatedDish;
  await saveDishesToDisk(dishes);

  return updatedDish;
}

/**
 * Toggle a dish's availability (Available <=> Sold Out).
 * @param {number|string} id
 */
export async function toggleDishAvailability(id) {
  const dishes = await ensureDishesLoaded();
  const index = dishes.findIndex((item) => String(item.id) === String(id));

  if (index === -1) {
    return null;
  }

  const currentAvailable = dishes[index].available !== false; // defaults to true
  const updatedDish = {
    ...dishes[index],
    available: !currentAvailable,
  };

  dishes[index] = updatedDish;
  await saveDishesToDisk(dishes);

  return updatedDish;
}

/**
 * Delete a dish by ID.
 * @param {number|string} id
 */
export async function deleteDish(id) {
  const dishes = await ensureDishesLoaded();
  const index = dishes.findIndex((item) => String(item.id) === String(id));

  if (index === -1) {
    return false;
  }

  dishes.splice(index, 1);
  removeDishFromAllFavorites(id);
  await saveDishesToDisk(dishes);

  return true;
}

