const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Validate environment variables
const { validateEnv, isProduction } = require("./utils/validateEnv");
validateEnv();

// Import console logger (respects NODE_ENV)
const consoleLogger = require("./utils/logger");

// Import database and middleware
const db = require("./config/database");
const { requestLogger, errorLogger } = require("./middleware/logger");
const logger = require("./services/logger");

// Import Swagger (only if not in production)
let swaggerUi, swaggerSpec;
if (!isProduction()) {
  swaggerUi = require("swagger-ui-express");
  const swaggerConfig = require("./config/swagger");
  swaggerSpec = swaggerConfig;
}

// Import centralized routes
const apiRoutes = require("./routes");

/**
 * Ensure required upload directories exist
 */
const ensureUploadDirs = () => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  const dirs = [
    "mentors",
    "management",
    "board-trustees",
    "accreditations",
    "reports",
    "banners",
    "media",
    "our-work"
  ];

  dirs.forEach((dir) => {
    const dirPath = path.join(uploadsDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        consoleLogger.log(`✅ Created upload directory: ${dirPath}`);
      }
  });
};

// Initialize upload directories
ensureUploadDirs();

// Create Express app
const app = express();

// Trust proxy for correct protocol and hostname detection
// This is important when behind a reverse proxy (like nginx or hosting providers)
app.set('trust proxy', true);

// ==================== Path Prefix Detection ====================
// Detect if app is served under a path prefix (e.g., /dev)
// This is useful for hosting providers that serve apps at subpaths
function getBasePath(req) {
  // Check if API_BASE_URL has a path
  if (process.env.API_BASE_URL) {
    try {
      const url = new URL(process.env.API_BASE_URL);
      if (url.pathname && url.pathname !== '/') {
        return url.pathname;
      }
    } catch (e) {
      // Invalid URL, continue
    }
  }
  
  // Try to detect from request path
  // If request comes to /dev/api-docs, base path is /dev
  const path = req.originalUrl || req.url;
  if (path.startsWith('/dev/')) {
    return '/dev';
  }
  
  return '';
}

// Middleware to set base path on request object
app.use((req, res, next) => {
  req.basePath = getBasePath(req);
  next();
});

// ==================== Middleware ====================
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      consoleLogger.debug('CORS: Request with no origin, allowing');
      return callback(null, true);
    }
    
    // Get allowed origins from environment variable
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().toLowerCase())
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'].map(o => o.toLowerCase());
    
    // Also allow the API's own domain (for both development and production)
    const apiUrl = process.env.API_BASE_URL || '';
    if (apiUrl) {
      try {
        const url = new URL(apiUrl);
        const apiOrigin = `${url.protocol}//${url.host}`.toLowerCase();
        if (!allowedOrigins.includes(apiOrigin)) {
          allowedOrigins.push(apiOrigin);
        }
      } catch (e) {
        // Invalid URL, skip
        consoleLogger.debug('CORS: Invalid API_BASE_URL, skipping');
      }
    }
    
    // Normalize origin for comparison (remove trailing slash, lowercase)
    const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed;
    });
    
    if (isAllowed) {
      consoleLogger.debug(`CORS: Origin ${origin} is allowed`);
      callback(null, true);
    } else {
      consoleLogger.warn(`CORS: Origin ${origin} is not allowed. Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging middleware (must be before routes)
app.use(requestLogger);

// Static file serving (support path prefix)
app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/dev/api/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger API Documentation (Disabled in production)
// Support path prefixes like /dev
if (!isProduction()) {
  // Dynamic Swagger setup with request-based URL and path prefix support
  app.use(["/api-docs", "/dev/api-docs"], swaggerUi.serve, (req, res, next) => {
    // Get the correct base URL from request (auto-detects hostname)
    const apiBaseUrl = swaggerSpec.getApiBaseUrl(req);
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      consoleLogger.debug('Swagger URL Detection:', {
        protocol: req.protocol,
        host: req.get('host'),
        forwardedHost: req.get('x-forwarded-host'),
        forwardedProto: req.get('x-forwarded-proto'),
        originalUrl: req.originalUrl,
        detectedUrl: apiBaseUrl
      });
    }
    
    // Update Swagger spec with dynamic server URL
    const dynamicSpec = {
      ...swaggerSpec,
      servers: [
        {
          url: apiBaseUrl,
          description: 'Current server'
        }
      ]
    };
    
    swaggerUi.setup(dynamicSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "Y4D API Documentation",
      customfavIcon: "/favicon.ico"
    })(req, res, next);
  });

  // Swagger JSON endpoint with dynamic URL and path prefix support
  app.get(["/api-docs.json", "/dev/api-docs.json"], (req, res) => {
    // Get the correct base URL from request (auto-detects hostname)
    const apiBaseUrl = swaggerSpec.getApiBaseUrl(req);
    
    const dynamicSpec = {
      ...swaggerSpec,
      servers: [
        {
          url: apiBaseUrl,
          description: 'Current server'
        }
      ]
    };
    res.setHeader("Content-Type", "application/json");
    res.send(dynamicSpec);
  });
  
  // Log Swagger URL on startup (will show localhost in dev)
  const swaggerUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  consoleLogger.startup(`📚 Swagger UI available at: ${swaggerUrl}/api-docs`);
  if (process.env.API_BASE_URL && process.env.API_BASE_URL.includes('/dev')) {
    consoleLogger.startup(`📚 Swagger UI also available at: ${swaggerUrl}/dev/api-docs`);
  }
} else {
  // In production, return 404 for Swagger endpoints
  app.get(["/api-docs", "/dev/api-docs"], (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  
  app.get(["/api-docs.json", "/dev/api-docs.json"], (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
}

// ==================== Routes ====================
// Health check endpoint (support path prefix)
app.get(["/", "/dev"], async (req, res) => {
  await logger.info("system", "Health check endpoint accessed", {
    ip_address: req.ip,
    request_method: req.method,
    request_url: req.url
  });
  res.json({ 
    message: "Y4D Backend API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Database connection test endpoint (support path prefix)
app.get(["/api/test-db", "/dev/api/test-db"], async (req, res) => {
  try {
    const [results] = await db.query("SELECT 1 + 1 AS solution");
    await logger.success("system", "Database connection test successful", {
      ip_address: req.ip
    });
    res.json({
      message: "Database connection successful",
      solution: results[0].solution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    await logger.error("system", "Database connection test failed", error, {
      ip_address: req.ip
    });
    res.status(500).json({ 
      error: "Database connection failed",
      details: error.message 
    });
  }
});

// API Routes - All routes registered through centralized index
// Support both /api and /dev/api paths
app.use("/api", apiRoutes);
app.use("/dev/api", apiRoutes);

// 404 handler
app.use((req, res) => {
  logger.warning("api", `404 - Route not found: ${req.method} ${req.url}`, {
    ip_address: req.ip,
    request_method: req.method,
    request_url: req.url
  });
  res.status(404).json({ 
    error: "Route not found",
    path: req.url 
  });
});

// Error handling middleware (must be last)
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ==================== Server Startup ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", async () => {
  consoleLogger.startup(`🚀 Server running on port ${PORT}`);
  consoleLogger.startup(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  
  // Log server information
  if (isProduction()) {
    consoleLogger.startup("🔒 Production mode: Swagger UI is disabled");
    if (process.env.API_BASE_URL) {
      consoleLogger.startup(`🌐 API Base URL: ${process.env.API_BASE_URL}`);
    } else {
      consoleLogger.startup("⚠️  API_BASE_URL not set - will use request hostname dynamically");
    }
    if (process.env.ALLOWED_ORIGINS) {
      consoleLogger.startup(`🔐 Allowed CORS origins: ${process.env.ALLOWED_ORIGINS}`);
    }
  } else {
    consoleLogger.startup("🔓 Development mode: Swagger UI is enabled");
    consoleLogger.startup(`🌐 API Base URL: ${process.env.API_BASE_URL || 'http://localhost:5000'}`);
  }
  
  // Log server startup
  await logger.createLog({
    level: logger.LogLevel.SUCCESS,
    type: logger.LogType.SYSTEM_START,
    feature: "system",
    message: `Server started successfully on port ${PORT}`,
    metadata: {
      port: PORT,
      node_env: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    }
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  consoleLogger.startup("SIGTERM signal received: closing HTTP server");
  await logger.info("system", "Server shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", async () => {
  consoleLogger.startup("SIGINT signal received: closing HTTP server");
  await logger.info("system", "Server shutting down gracefully");
  process.exit(0);
});
