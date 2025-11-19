const db = require('../config/database');

/**
 * Application Logger Service
 * Logs all application activities to database for monitoring and debugging
 */

const LogLevel = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  DEBUG: 'debug'
};

const LogType = {
  // Authentication & Authorization
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  TOKEN_VERIFY: 'token_verify',
  PERMISSION_DENIED: 'permission_denied',
  
  // CRUD Operations
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  
  // Status Changes
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
  APPROVE: 'approve',
  REJECT: 'reject',
  SUSPEND: 'suspend',
  
  // File Operations
  UPLOAD: 'upload',
  DELETE_FILE: 'delete_file',
  
  // System Operations
  SYSTEM_START: 'system_start',
  SYSTEM_ERROR: 'system_error',
  DATABASE_ERROR: 'database_error',
  VALIDATION_ERROR: 'validation_error',
  
  // Feature Usage
  FEATURE_ACCESS: 'feature_access',
  EXPORT: 'export',
  IMPORT: 'import',
  SEARCH: 'search',
  FILTER: 'filter',
  
  // API Operations
  API_REQUEST: 'api_request',
  API_RESPONSE: 'api_response',
  API_ERROR: 'api_error'
};

/**
 * Create a log entry in the database
 * @param {Object} logData - Log entry data
 * @param {string} logData.level - Log level (info, success, warning, error, debug)
 * @param {string} logData.type - Log type (login, create, update, etc.)
 * @param {string} logData.feature - Feature/module name
 * @param {string} logData.message - Log message
 * @param {number} logData.user_id - User ID (optional)
 * @param {string} logData.ip_address - IP address (optional)
 * @param {string} logData.user_agent - User agent (optional)
 * @param {string} logData.resource_type - Resource type (optional)
 * @param {number} logData.resource_id - Resource ID (optional)
 * @param {Object} logData.metadata - Additional metadata (optional)
 * @param {string} logData.request_method - HTTP method (optional)
 * @param {string} logData.request_url - Request URL (optional)
 * @param {number} logData.status_code - HTTP status code (optional)
 * @param {number} logData.response_time - Response time in ms (optional)
 * @param {string} logData.error_stack - Error stack trace (optional)
 */
async function createLog(logData) {
  try {
    const {
      level = LogLevel.INFO,
      type,
      feature,
      message,
      user_id = null,
      ip_address = null,
      user_agent = null,
      resource_type = null,
      resource_id = null,
      metadata = null,
      request_method = null,
      request_url = null,
      status_code = null,
      response_time = null,
      error_stack = null
    } = logData;

    // Validate required fields
    if (!type || !feature || !message) {
      console.error('❌ Logger: Missing required fields (type, feature, message)');
      return;
    }

    const query = `
      INSERT INTO application_logs (
        level, type, feature, message, user_id, ip_address, user_agent,
        resource_type, resource_id, metadata, request_method, request_url,
        status_code, response_time, error_stack, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const metadataJson = metadata ? JSON.stringify(metadata) : null;

    await db.query(query, [
      level,
      type,
      feature,
      message,
      user_id,
      ip_address,
      user_agent,
      resource_type,
      resource_id,
      metadataJson,
      request_method,
      request_url,
      status_code,
      response_time,
      error_stack
    ]);

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      const logSymbol = {
        [LogLevel.INFO]: 'ℹ️',
        [LogLevel.SUCCESS]: '✅',
        [LogLevel.WARNING]: '⚠️',
        [LogLevel.ERROR]: '❌',
        [LogLevel.DEBUG]: '🔍'
      }[level] || '📝';

      console.log(`${logSymbol} [${feature}] ${message}`);
    }
  } catch (error) {
    // Fallback to console if database logging fails
    console.error('❌ Failed to write log to database:', error.message);
    console.error('Log data:', logData);
  }
}

/**
 * Log info message
 */
async function info(feature, message, data = {}) {
  await createLog({
    level: LogLevel.INFO,
    type: data.type || LogType.FEATURE_ACCESS,
    feature,
    message,
    ...data
  });
}

/**
 * Log success message
 */
async function success(feature, message, data = {}) {
  await createLog({
    level: LogLevel.SUCCESS,
    type: data.type || LogType.FEATURE_ACCESS,
    feature,
    message,
    ...data
  });
}

/**
 * Log warning message
 */
async function warning(feature, message, data = {}) {
  await createLog({
    level: LogLevel.WARNING,
    type: data.type || LogType.FEATURE_ACCESS,
    feature,
    message,
    ...data
  });
}

/**
 * Log error message
 */
async function error(feature, message, errorObj = null, data = {}) {
  await createLog({
    level: LogLevel.ERROR,
    type: data.type || LogType.SYSTEM_ERROR,
    feature,
    message,
    error_stack: errorObj ? (errorObj.stack || errorObj.message) : null,
    metadata: errorObj ? { error: errorObj.message, ...data.metadata } : data.metadata,
    ...data
  });
}

/**
 * Log debug message
 */
async function debug(feature, message, data = {}) {
  if (process.env.NODE_ENV === 'development') {
    await createLog({
      level: LogLevel.DEBUG,
      type: data.type || LogType.FEATURE_ACCESS,
      feature,
      message,
      ...data
    });
  }
}

/**
 * Log CRUD operations
 */
async function logCreate(feature, resourceType, resourceId, userId, message, data = {}) {
  await success(feature, message || `${resourceType} created successfully`, {
    type: LogType.CREATE,
    resource_type: resourceType,
    resource_id: resourceId,
    user_id: userId,
    ...data
  });
}

async function logRead(feature, resourceType, userId, message, data = {}) {
  await info(feature, message || `${resourceType} retrieved`, {
    type: LogType.READ,
    resource_type: resourceType,
    user_id: userId,
    ...data
  });
}

async function logUpdate(feature, resourceType, resourceId, userId, message, data = {}) {
  await success(feature, message || `${resourceType} updated successfully`, {
    type: LogType.UPDATE,
    resource_type: resourceType,
    resource_id: resourceId,
    user_id: userId,
    ...data
  });
}

async function logDelete(feature, resourceType, resourceId, userId, message, data = {}) {
  await warning(feature, message || `${resourceType} deleted`, {
    type: LogType.DELETE,
    resource_type: resourceType,
    resource_id: resourceId,
    user_id: userId,
    ...data
  });
}

/**
 * Log authentication events
 */
async function logLogin(userId, username, ipAddress, userAgent, success, errorMsg = null) {
  await createLog({
    level: success ? LogLevel.SUCCESS : LogLevel.ERROR,
    type: LogType.LOGIN,
    feature: 'authentication',
    message: success 
      ? `User ${username} logged in successfully`
      : `Failed login attempt for ${username}: ${errorMsg || 'Invalid credentials'}`,
    user_id: success ? userId : null,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: { username, success }
  });
}

/**
 * Log API request/response
 */
async function logApiRequest(req, res, responseTime) {
  const userId = req.user ? req.user.id : null;
  const level = res.statusCode >= 400 ? LogLevel.ERROR : 
                res.statusCode >= 300 ? LogLevel.WARNING : LogLevel.SUCCESS;

  await createLog({
    level,
    type: res.statusCode >= 400 ? LogType.API_ERROR : LogType.API_REQUEST,
    feature: 'api',
    message: `${req.method} ${req.path} - ${res.statusCode}`,
    user_id: userId,
    ip_address: req.ip || req.connection.remoteAddress,
    user_agent: req.get('user-agent'),
    request_method: req.method,
    request_url: req.originalUrl || req.url,
    status_code: res.statusCode,
    response_time: responseTime,
    metadata: {
      query: req.query,
      params: req.params,
      body_keys: req.body ? Object.keys(req.body) : []
    }
  });
}

module.exports = {
  createLog,
  info,
  success,
  warning,
  error,
  debug,
  logCreate,
  logRead,
  logUpdate,
  logDelete,
  logLogin,
  logApiRequest,
  LogLevel,
  LogType
};

