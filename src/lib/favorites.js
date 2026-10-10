const globalForFavorites = globalThis;
const favorites = globalForFavorites.__addis_favorites__ || new Map();
if (!globalForFavorites.__addis_favorites__) {
  globalForFavorites.__addis_favorites__ = favorites;
}

/**
 * Get all favorited dish IDs for a specific user.
 * @param {string} userId - The authenticated user's session ID.
 * @returns {number[]} Array of dish IDs.
 */
export function getFavoriteIds(userId) {
  if (!userId || typeof userId !== 'string') return new Set();
  const userFavorites = favorites.get(userId);
  return userFavorites ? new Set(userFavorites) : new Set();
}

/**
 * Check if a dish is in a user's favorites.
 * @param {string} userId - The authenticated user's session ID.
 * @param {number|string} dishId - The ID of the dish.
 * @returns {boolean}
 */
export function isDishFavorite(userId, dishId) {
  if (!userId) return false;
  const userFavorites = favorites.get(userId);
  return userFavorites ? userFavorites.has(Number(dishId)) : false;
}

/**
 * Add a dish to a user's favorites.
 * @param {string} userId - The authenticated user's session ID.
 * @param {number|string} dishId - The ID of the dish to add.
 * @returns {boolean} True if added.
 */
export function addFavorite(userId, dishId) {
  if (!userId) return false;
  const numericId = Number(dishId);
  if (isNaN(numericId)) return false;

  let userFavorites = favorites.get(userId);
  if (!userFavorites) {
    userFavorites = new Set();
    favorites.set(userId, userFavorites);
  }
  userFavorites.add(numericId);
  return true;
}

/**
 * Remove a dish from a user's favorites.
 * @param {string} userId - The authenticated user's session ID.
 * @param {number|string} dishId - The ID of the dish to remove.
 * @returns {boolean} True if removed.
 */
export function removeFavorite(userId, dishId) {
  if (!userId) return false;
  const numericId = Number(dishId);
  const userFavorites = favorites.get(userId);
  if (!userFavorites) return false;

  return userFavorites.delete(numericId);
}

/**
 * Toggle a dish in a user's favorites.
 * @param {string} userId - The authenticated user's session ID.
 * @param {number|string} dishId - The ID of the dish to toggle.
 * @returns {boolean} New favorite state (true = favorited, false = removed).
 */
export function toggleFavorite(userId, dishId) {
  if (!userId) return false;
  const numericId = Number(dishId);
  if (isNaN(numericId)) return false;

  let userFavorites = favorites.get(userId);
  if (!userFavorites) {
    userFavorites = new Set();
    favorites.set(userId, userFavorites);
  }

  if (userFavorites.has(numericId)) {
    userFavorites.delete(numericId);
    return false;
  } else {
    userFavorites.add(numericId);
    return true;
  }
}

/**
 * Remove a deleted dish from all users' favorite lists.
 * @param {number|string} dishId - The ID of the deleted dish.
 */
export function removeDishFromAllFavorites(dishId) {
  const numericId = Number(dishId);
  if (isNaN(numericId)) return;

  for (const userFavorites of favorites.values()) {
    if (userFavorites instanceof Set) {
      userFavorites.delete(numericId);
    }
  }
}
