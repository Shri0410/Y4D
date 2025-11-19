const logger = require('../services/logger');

/**
 * Request/Response Logging Middleware
 * Automatically logs all API requests and responses
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const responseTime = Date.now() - startTime;
    
    // Log the request/response asynchronously (don't block response)
    logger.logApiRequest(req, res, responseTime).catch(err => {
      console.error('Failed to log API request:', err);
    });

    return originalJson(data);
  };

  // Override res.send for other response types
  const originalSend = res.send.bind(res);
  res.send = function (data) {
    const responseTime = Date.now() - startTime;
    
    logger.logApiRequest(req, res, responseTime).catch(err => {
      console.error('Failed to log API request:', err);
    });

    return originalSend(data);
  };

  // Handle errors
  const originalStatus = res.status.bind(res);
  res.status = function (code) {
    const responseTime = Date.now() - startTime;
    
    logger.logApiRequest(req, res, responseTime).catch(err => {
      console.error('Failed to log API request:', err);
    });

    return originalStatus(code);
  };

  next();
}

/**
 * Error Logging Middleware
 * Logs errors that occur during request processing
 */
function errorLogger(err, req, res, next) {
  const userId = req.user ? req.user.id : null;

  logger.error(
    'api',
    `Error in ${req.method} ${req.path}: ${err.message}`,
    err,
    {
      type: logger.LogType.API_ERROR,
      user_id: userId,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent'),
      request_method: req.method,
      request_url: req.originalUrl || req.url,
      status_code: res.statusCode || 500,
      metadata: {
        query: req.query,
        params: req.params,
        error_name: err.name
      }
    }
  ).catch(logErr => {
    console.error('Failed to log error:', logErr);
  });

  next(err);
}

module.exports = {
  requestLogger,
  errorLogger
};

