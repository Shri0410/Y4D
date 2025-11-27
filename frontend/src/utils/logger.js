/**
 * Logger Utility
 * Environment-aware logging that only logs in development
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log info messages (development only)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log error messages
   * In production, these should be sent to error tracking service
   */
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, send to error tracking service (e.g., Sentry)
      // errorTrackingService.captureException(...args);
    }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log debug messages (development only)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log info messages (development only)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

export default logger;

