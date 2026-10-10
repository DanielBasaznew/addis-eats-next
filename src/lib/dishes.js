import fs from 'node:fs/promises';
import path from 'node:path';
import { removeDishFromAllFavorites } from './favorites.js';

const DISHES_FILE = path.join(process.cwd(), 'public', 'dishes.json');

const globalForDishes = globalThis;

/**
 * Read dishes from disk into memory.
 */
async function loadDishesFromDisk() {
  try {
    const fileContents = await fs.readFile(DISHES_FILE, 'utf-8');
    const parsed = JSON.parse(fileContents);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading dishes.json:', error);
    return [];
  }
}

/**
 * Persist dishes from memory to disk.
 */
async function saveDishesToDisk(dishesList) {
  try {
    await fs.writeFile(DISHES_FILE, JSON.stringify(dishesList, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving dishes.json:', error);
    return false;
  }
}

/**
 * Initialize in-memory cache if not already populated.
 */
async function ensureDishesLoaded() {
  if (!globalForDishes.__addis_dishes__) {
    const list = await loadDishesFromDisk();
    globalForDishes.__addis_dishes__ = list;
  }
  return globalForDishes.__addis_dishes__;
}

/**
 * Retrieve all dishes.
 */
export async function getDishes() {
  return await ensureDishesLoaded();
}

/**
 * Retrieve a dish by ID.
 */
export async function getDishById(id) {
  const dishes = await ensureDishesLoaded();
  return dishes.find((item) => String(item.id) === String(id)) || null;
}

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
    image: dishData.image !== undefined ? dishData.image.trim() : existing.image,
    description: dishData.description !== undefined ? dishData.description.trim() : existing.description,
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
