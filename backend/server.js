const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Validate environment variables
const { validateEnv, isProduction } = require("./utils/validateEnv");
validateEnv();

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
      console.log(`✅ Created upload directory: ${dirPath}`);
    }
  });
};

// Initialize upload directories
ensureUploadDirs();

// Create Express app
const app = express();

// ==================== Middleware ====================
// CORS configuration
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging middleware (must be before routes)
app.use(requestLogger);

// Static file serving
app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger API Documentation (Disabled in production)
if (!isProduction()) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Y4D API Documentation",
    customfavIcon: "/favicon.ico"
  }));

  // Swagger JSON endpoint
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  
  console.log("📚 Swagger UI available at: http://localhost:" + process.env.PORT + "/api-docs");
} else {
  // In production, return 404 for Swagger endpoints
  app.get("/api-docs", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  
  app.get("/api-docs.json", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });
}

// ==================== Routes ====================
// Health check endpoint
app.get("/", async (req, res) => {
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

// Database connection test endpoint
app.get("/api/test-db", async (req, res) => {
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
app.use("/api", apiRoutes);

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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  
  if (isProduction()) {
    console.log("🔒 Production mode: Swagger UI is disabled");
  } else {
    console.log("🔓 Development mode: Swagger UI is enabled");
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
  console.log("SIGTERM signal received: closing HTTP server");
  await logger.info("system", "Server shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await logger.info("system", "Server shutting down gracefully");
  process.exit(0);
});
