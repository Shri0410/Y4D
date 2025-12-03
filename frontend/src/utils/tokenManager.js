/**
 * Token Manager Utility
 * Handles JWT token storage with expiration checks
 */

const TOKEN_KEY = 'token';
const TOKEN_EXPIRES_KEY = 'token_expires';
const USER_KEY = 'user';
const TOKEN_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Set token with expiration timestamp
 */
export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    const expiresAt = Date.now() + TOKEN_DURATION;
    localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt.toString());
  } catch (error) {
    logger.error('Error setting token:', error);
  }
};

/**
 * Get token if it exists and hasn't expired
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY);

    if (!token || !expiresAt) {
      return null;
    }

    // Check if token has expired
    if (Date.now() > parseInt(expiresAt, 10)) {
      clearToken();
      return null;
    }

    return token;
  } catch (error) {
    logger.error('Error getting token:', error);
    return null;
  }
};

/**
 * Check if token is valid (exists and not expired)
 */
export const isTokenValid = () => {
  return getToken() !== null;
};

/**
 * Clear all auth-related data from localStorage
 */
export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    logger.error('Error clearing token:', error);
  }
};

/**
 * Set user data
 */
export const setUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    logger.error('Error setting user:', error);
  }
};

/**
 * Get user data
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    logger.error('Error getting user:', error);
    return null;
  }
};

/**
 * Clear all auth data (token + user)
 */
export const clearAuth = () => {
  clearToken();
};

