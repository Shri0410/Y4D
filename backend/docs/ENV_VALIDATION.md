# Environment Variable Validation

## ✅ Implementation Complete

Environment variable validation has been implemented with the following features:

## 📋 Features

### 1. Required Variables Validation
The following environment variables are **required** and will cause the application to exit if missing:

- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT secret key

### 2. Optional Variables with Defaults
The following variables have defaults and will be set automatically if not provided:

- `DB_PORT` - Default: `3306`
- `DB_CONNECTION_LIMIT` - Default: `20`
- `DB_SSL` - Default: `false`
- `DB_SSL_REJECT_UNAUTHORIZED` - Default: `true`
- `PORT` - Default: `5000`
- `NODE_ENV` - Default: `development`
- `API_BASE_URL` - Default: `http://localhost:5000`

### 3. Type Validation
- **Numbers**: Validates that numeric values are valid numbers
- **Booleans**: Validates that boolean values are `true`/`false` or `1`/`0`

### 4. Production Warnings
When `NODE_ENV=production`, the validator will warn about:
- Weak JWT secrets (less than 32 characters)
- Default database credentials
- Disabled SSL connections

### 5. Swagger Access Control
- **Development**: Swagger UI is available at `/api-docs`
- **Production**: Swagger endpoints return 404 (disabled)

## 🚀 Usage

### Development Mode
```bash
# .env file
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=y4d_dashboard
JWT_SECRET=your_secret_key

# Swagger will be available at http://localhost:5000/api-docs
```

### Production Mode
```bash
# .env file
NODE_ENV=production
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=strong_password
DB_NAME=y4d_dashboard
JWT_SECRET=very_long_and_secure_secret_key_at_least_32_chars
DB_SSL=true

# Swagger will be disabled (returns 404)
```

## 📝 Validation Flow

1. **Startup**: `validateEnv()` is called immediately after loading `.env`
2. **Check Required**: Validates all required variables are present
3. **Set Defaults**: Sets default values for optional variables
4. **Type Validation**: Validates and converts types (number, boolean)
5. **Production Checks**: Warns about security issues in production
6. **Exit on Error**: Application exits if required variables are missing

## ⚠️ Error Messages

### Missing Required Variables
```
❌ Environment Variable Validation Failed:

   Missing required environment variables: DB_HOST, JWT_SECRET

Please set the required environment variables in your .env file.
```

### Production Warnings
```
⚠️  Environment Variable Warnings:
   ⚠️  WARNING: JWT_SECRET should be a strong, unique secret (at least 32 characters) in production!
   ⚠️  WARNING: Database SSL is disabled in production. Consider enabling it for security.
```

## 🔒 Security Features

### Production Mode
- Swagger UI is completely disabled
- Swagger endpoints return 404
- Warnings for insecure configurations
- Validates JWT secret strength

### Development Mode
- Swagger UI is enabled
- More lenient validation
- Helpful warnings instead of errors

## 📦 Files

- `utils/validateEnv.js` - Validation utility
- `.env.example` - Example environment file
- `server.js` - Uses validation on startup

## 🛠️ Helper Functions

```javascript
const { validateEnv, getEnv, isProduction, isDevelopment } = require('./utils/validateEnv');

// Validate all environment variables
validateEnv();

// Get environment variable with default
const port = getEnv('PORT', 5000);

// Check environment
if (isProduction()) {
  // Production-specific code
}

if (isDevelopment()) {
  // Development-specific code
}
```

## ✅ Validation Checklist

Before deploying to production, ensure:

- [ ] All required variables are set
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is at least 32 characters long
- [ ] `DB_SSL=true` for secure database connections
- [ ] Database credentials are not defaults
- [ ] Swagger is disabled (automatic in production)

