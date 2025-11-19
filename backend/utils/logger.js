/**
 * Console Logger Utility
 * Disables console output in production environment
 */

const { isProduction, isDevelopment } = require('./validateEnv');

/**
 * Console logger that respects NODE_ENV
 * Only logs in development mode
 */
const consoleLogger = {
  log: (...args) => {
    if (!isProduction()) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors, even in production (they're important)
    console.error(...args);
  },
  
  warn: (...args) => {
    if (!isProduction()) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (!isProduction()) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment()) {
      console.debug(...args);
    }
  },
  
  // Special method for startup messages (always shown)
  startup: (...args) => {
    console.log(...args);
  }
};

module.exports = consoleLogger;

