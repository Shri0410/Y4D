# Console Logging in Production

## Overview

The application uses a custom console logger (`utils/logger.js`) that automatically disables console output in production environments.

## How It Works

### Development Mode
- All `console.log()`, `console.warn()`, `console.info()`, and `console.debug()` statements are displayed
- Full debugging information is available

### Production Mode
- `console.log()`, `console.warn()`, `console.info()`, and `console.debug()` are **silently disabled**
- `console.error()` is **always shown** (errors are critical)
- Startup messages use `consoleLogger.startup()` which always displays

## Usage

### In Route Files

```javascript
const consoleLogger = require('../utils/logger');

// Regular logging (disabled in production)
consoleLogger.log('User logged in:', userId);
consoleLogger.warn('Rate limit approaching');
consoleLogger.info('Processing request');

// Errors (always shown)
consoleLogger.error('Database connection failed:', error);

// Debug (only in development)
consoleLogger.debug('Debug information');
```

### Available Methods

| Method | Production | Development | Use Case |
|--------|-----------|-------------|----------|
| `consoleLogger.log()` | ❌ Disabled | ✅ Enabled | General logging |
| `consoleLogger.warn()` | ❌ Disabled | ✅ Enabled | Warnings |
| `consoleLogger.info()` | ❌ Disabled | ✅ Enabled | Informational messages |
| `consoleLogger.debug()` | ❌ Disabled | ✅ Enabled | Debug information |
| `consoleLogger.error()` | ✅ Always | ✅ Always | Errors (critical) |
| `consoleLogger.startup()` | ✅ Always | ✅ Always | Server startup messages |

## Migration Guide

### Before
```javascript
console.log('User logged in');
console.error('Error occurred');
```

### After
```javascript
const consoleLogger = require('../utils/logger');

consoleLogger.log('User logged in');
consoleLogger.error('Error occurred');
```

## Benefits

1. **Performance**: No console overhead in production
2. **Security**: Sensitive information not logged in production
3. **Clean Logs**: Only errors and critical messages in production
4. **Debugging**: Full logs available in development

## Important Notes

- **Errors are always logged** - Use `consoleLogger.error()` for critical issues
- **Startup messages are always shown** - Use `consoleLogger.startup()` for server initialization
- **Database logging** - Use the application logger service (`services/logger.js`) for persistent logging

## Production Best Practices

1. Use `consoleLogger.error()` for all error conditions
2. Use application logger (`services/logger.js`) for audit trails
3. Avoid logging sensitive data (passwords, tokens, etc.)
4. Use structured logging for better analysis

