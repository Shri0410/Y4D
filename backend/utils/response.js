/**
 * Standardized Response Utility
 * Provides consistent response formats across all API endpoints
 */

const consoleLogger = require('./logger');

/**
 * Check if running in development mode
 */
const isDevelopment = () => {
  return process.env.NODE_ENV !== 'production';
};

/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message for client
 * @param {Error|Object} error - Error object or details (optional)
 * @param {string} requestId - Request ID for tracking (optional)
 */
const sendError = (res, statusCode, message, error = null, requestId = null) => {
  // Log error server-side
  if (error) {
    if (error instanceof Error) {
      consoleLogger.error(`Error: ${message}`, {
        message: error.message,
        stack: error.stack,
        statusCode,
        requestId
      });
    } else {
      consoleLogger.error(`Error: ${message}`, {
        error,
        statusCode,
        requestId
      });
    }
  } else {
    consoleLogger.error(`Error: ${message}`, { statusCode, requestId });
  }

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      message,
      ...(requestId && { requestId })
    }
  };

  // Add details only in development
  if (isDevelopment() && error) {
    if (error instanceof Error) {
      errorResponse.error.details = error.message;
      // Don't expose stack trace even in development (too verbose)
    } else if (typeof error === 'object') {
      errorResponse.error.details = error;
    } else {
      errorResponse.error.details = String(error);
    }
  }

  return res.status(statusCode).json(errorResponse);
};

/**
 * Send standardized success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message (optional)
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data, message = null, statusCode = 200) => {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination metadata
 * @param {number} pagination.page - Current page
 * @param {number} pagination.limit - Items per page
 * @param {number} pagination.total - Total items
 * @param {number} pagination.totalPages - Total pages
 */
const sendPaginated = (res, data, pagination) => {
  return res.json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1
    }
  });
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
const sendValidationError = (res, errors) => {
  consoleLogger.warn('Validation error', { errors });
  
  return res.status(400).json({
    success: false,
    error: {
      message: 'Validation failed',
      validationErrors: errors
    }
  });
};

/**
 * Send unauthorized error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 */
const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, 401, message);
};

/**
 * Send forbidden error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 */
const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, 403, message);
};

/**
 * Send not found error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, 404, message);
};

/**
 * Send conflict error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 */
const sendConflict = (res, message = 'Resource already exists') => {
  return sendError(res, 409, message);
};

/**
 * Send internal server error response
 * @param {Object} res - Express response object
 * @param {Error|Object} error - Error object
 * @param {string} message - Error message (optional)
 */
const sendInternalError = (res, error, message = 'Internal server error') => {
  return sendError(res, 500, message, error);
};

module.exports = {
  sendError,
  sendSuccess,
  sendPaginated,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendInternalError
};

