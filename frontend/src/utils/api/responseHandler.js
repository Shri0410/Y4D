/**
 * API Response Handler
 * Utilities for handling standardized API responses
 * 
 * This file consolidates response handling logic from utils/apiResponse.js
 * and provides additional utilities for the new API structure
 */

import { extractData, extractErrorMessage, extractValidationErrors } from '../apiResponse';
import logger from '../logger';

/**
 * Handle API response with automatic data extraction
 * @param {Object} response - Axios response object
 * @param {Object} options - Options
 * @returns {*} - Extracted data
 */
export const handleResponse = (response, options = {}) => {
  const { logSuccess = false } = options;
  
  const data = extractData(response);
  
  if (logSuccess && import.meta.env.DEV) {
    logger.log('✅ API Success:', { data });
  }
  
  return data;
};

/**
 * Handle API error with context
 * @param {Error} error - Axios error object
 * @param {Object} options - Options
 * @param {string} options.context - Context for error logging
 * @param {boolean} options.showToast - Show toast notification
 * @param {boolean} options.throwError - Whether to throw error after handling
 * @returns {string} - Error message
 */
export const handleApiError = (error, options = {}) => {
  const {
    context = 'API',
    showToast = false,
    throwError = false,
    defaultMessage = 'An error occurred',
  } = options;

  const errorMessage = extractErrorMessage(error);
  const validationErrors = extractValidationErrors(error);

  // Log error with context
  logger.error(`❌ ${context} Error:`, {
    message: errorMessage,
    status: error.response?.status,
    validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
    url: error.config?.url,
  });

  // Show toast if requested (import toast only when needed to avoid circular deps)
  if (showToast) {
    import('../toast').then(({ default: toast }) => {
      if (validationErrors.length > 0) {
        const validationMessage = validationErrors
          .map(err => `${err.field || ''}: ${err.message || err}`)
          .join(', ');
        toast.error(`Validation failed: ${validationMessage}`);
      } else {
        toast.error(errorMessage || defaultMessage);
      }
    });
  }

  if (throwError) {
    throw error;
  }

  return errorMessage;
};

/**
 * Create a safe API call wrapper
 * @param {Function} apiCall - API function to call
 * @param {Object} options - Options
 * @returns {Promise} - Promise that resolves with data or rejects with error
 */
export const safeApiCall = async (apiCall, options = {}) => {
  const {
    context = 'API',
    defaultData = null,
    showToast = false,
  } = options;

  try {
    const response = await apiCall();
    return handleResponse(response, { logSuccess: true });
  } catch (error) {
    handleApiError(error, { context, showToast });
    return defaultData;
  }
};

export default {
  handleResponse,
  handleApiError,
  safeApiCall,
  extractData,
  extractErrorMessage,
  extractValidationErrors,
};

