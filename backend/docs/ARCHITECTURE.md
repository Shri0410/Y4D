# Y4D Backend Architecture

## 🏗️ Architecture Overview

The backend has been restructured for better maintainability, reliability, and scalability.

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js              # Database connection configuration
│   ├── swagger.js                # Swagger configuration (schemas, components)
│   └── swaggerDefinitions.js    # Centralized API endpoint definitions
├── middleware/
│   ├── auth.js                  # Authentication & authorization middleware
│   └── logger.js                # Request/response logging middleware
├── services/
│   └── logger.js                # Application logging service
├── utils/
│   └── validateEnv.js          # Environment variable validation
├── routes/
│   ├── index.js                 # Centralized routes registration
│   ├── auth.js                  # Authentication routes
│   ├── users.js                 # User management routes
│   ├── banners.js               # Banner routes
│   └── ...                      # Other route modules
├── uploads/                     # File upload storage
├── server.js                    # Main application entry point
└── package.json
```

## 🔄 Key Architectural Improvements

### 1. Centralized Routing (`routes/index.js`)

**Before:** Routes registered directly in `server.js`
```javascript
app.use("/api/banners", require("./routes/banners"));
app.use("/api/auth", require("./routes/auth.js"));
// ... 15+ more route registrations
```

**After:** Single point of route registration
```javascript
// server.js
app.use("/api", apiRoutes);

// routes/index.js
router.use('/auth', authRoutes);
router.use('/banners', bannerRoutes);
// All routes in one place
```

**Benefits:**
- ✅ Single source of truth for all routes
- ✅ Easier to manage and maintain
- ✅ Better organization
- ✅ Easier to add/remove routes

### 2. Centralized Swagger Documentation (`config/swaggerDefinitions.js`)

**Before:** Swagger annotations scattered across all route files
```javascript
// routes/banners.js
/**
 * @swagger
 * /api/banners:
 *   get:
 *     ...
 */
```

**After:** All API definitions in one file
```javascript
// config/swaggerDefinitions.js
module.exports = {
  paths: {
    '/api/banners': {
      get: { ... },
      post: { ... }
    },
    '/api/mentors': { ... }
    // All endpoints defined here
  }
};
```

**Benefits:**
- ✅ Single point of documentation
- ✅ No need to modify route files for Swagger
- ✅ Easier to maintain and update
- ✅ Cleaner route files (no annotations)
- ✅ Better separation of concerns

### 3. Environment Validation (`utils/validateEnv.js`)

**Before:** Validation scattered in multiple files

**After:** Centralized validation on startup
```javascript
// server.js
const { validateEnv, isProduction } = require("./utils/validateEnv");
validateEnv(); // Validates all env vars before server starts
```

**Benefits:**
- ✅ Fails fast on missing configuration
- ✅ Type validation
- ✅ Production security warnings
- ✅ Clear error messages

### 4. Application Logging (`services/logger.js`)

**Before:** Console.log statements everywhere

**After:** Centralized logging service
```javascript
const logger = require('../services/logger');
await logger.info('feature', 'message', { metadata });
await logger.error('feature', 'message', error, { metadata });
```

**Benefits:**
- ✅ All logs stored in database
- ✅ Consistent logging format
- ✅ Easy to query and analyze
- ✅ Production-ready logging

## 🔌 Route Registration Flow

```
server.js
  └── app.use("/api", apiRoutes)
      └── routes/index.js
          ├── router.use('/auth', authRoutes)
          ├── router.use('/banners', bannerRoutes)
          ├── router.use('/mentors', mentorRoutes)
          └── ... (all routes)
```

## 📚 Swagger Documentation Flow

```
server.js
  └── swaggerSpec = require("./config/swagger")
      └── config/swagger.js
          ├── components (schemas, responses)
          └── paths: swaggerDefinitions.paths
              └── config/swaggerDefinitions.js
                  └── All API endpoint definitions
```

## 🎯 Benefits of New Architecture

### Maintainability
- **Single Responsibility**: Each file has a clear purpose
- **Centralized Configuration**: All config in one place
- **Easy Updates**: Update Swagger without touching route files

### Reliability
- **Environment Validation**: Catches config errors early
- **Error Handling**: Centralized error handling
- **Logging**: Comprehensive logging for debugging

### Scalability
- **Modular Routes**: Easy to add new routes
- **Clean Structure**: Easy to understand and extend
- **Type Safety**: Environment variable type validation

### Developer Experience
- **Clear Structure**: Easy to find files
- **Documentation**: Single source for API docs
- **Consistency**: Consistent patterns across codebase

## 📝 Adding New Routes

### Step 1: Create Route File
```javascript
// routes/myNewRoute.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  // Your logic
});

module.exports = router;
```

### Step 2: Register in Routes Index
```javascript
// routes/index.js
const myNewRoutes = require('./myNewRoute');
router.use('/my-new-route', myNewRoutes);
```

### Step 3: Add Swagger Definition
```javascript
// config/swaggerDefinitions.js
paths: {
  '/api/my-new-route': {
    get: {
      summary: 'Get my new route data',
      tags: ['My New Route'],
      responses: { ... }
    }
  }
}
```

## 🔒 Security Features

1. **Environment Validation**: Validates all required env vars
2. **Production Mode**: Swagger disabled in production
3. **JWT Authentication**: Token-based auth
4. **Role-Based Access**: Granular permissions
5. **Request Logging**: All requests logged for audit

## 📊 Logging Architecture

```
Request → middleware/logger.js (requestLogger)
  └── Logs to: services/logger.js
      └── Stores in: application_logs table
```

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure all required environment variables
- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Enable `DB_SSL=true` for production
- [ ] Verify Swagger is disabled (automatic)
- [ ] Test all API endpoints
- [ ] Monitor application logs

## 📖 Documentation

- **API Documentation**: Available at `/api-docs` (development only)
- **Environment Variables**: See `ENV_VALIDATION.md`
- **Swagger Setup**: See `SWAGGER_SETUP.md`
- **Logging**: See `RESTRUCTURE_SUMMARY.md`

