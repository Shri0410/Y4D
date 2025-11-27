# Common Response Utility

## Overview
A standardized response utility has been created to ensure consistent API responses across all endpoints.

## Location
`backend/utils/response.js`

## Available Functions

### 1. `sendError(res, statusCode, message, error, requestId)`
Send standardized error response.

**Parameters:**
- `res` - Express response object
- `statusCode` - HTTP status code (e.g., 400, 401, 404, 500)
- `message` - Error message for client
- `error` - Error object or details (optional, for logging)
- `requestId` - Request ID for tracking (optional)

**Example:**
```javascript
const { sendError } = require('../utils/response');

// Simple error
sendError(res, 400, 'Invalid input');

// Error with details (logged server-side)
sendError(res, 500, 'Database error', error);
```

**Response Format:**
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "requestId": "optional-request-id"
  }
}
```

In development mode, additional `details` are included:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": "Detailed error information"
  }
}
```

---

### 2. `sendSuccess(res, data, message, statusCode)`
Send standardized success response.

**Parameters:**
- `res` - Express response object
- `data` - Response data (can be object, array, or null)
- `message` - Success message (optional)
- `statusCode` - HTTP status code (default: 200)

**Example:**
```javascript
const { sendSuccess } = require('../utils/response');

// Simple success
sendSuccess(res, { id: 123, name: 'Item' });

// Success with message
sendSuccess(res, { id: 123 }, 'Item created successfully');

// Created (201)
sendSuccess(res, { id: 123 }, 'Item created', 201);
```

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

---

### 3. `sendPaginated(res, data, pagination)`
Send paginated response.

**Parameters:**
- `res` - Express response object
- `data` - Array of items
- `pagination` - Pagination metadata object

**Example:**
```javascript
const { sendPaginated } = require('../utils/response');

sendPaginated(res, items, {
  page: 1,
  limit: 20,
  total: 100,
  totalPages: 5
});
```

**Response Format:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 4. `sendValidationError(res, errors)`
Send validation error response.

**Parameters:**
- `res` - Express response object
- `errors` - Array of validation errors

**Example:**
```javascript
const { sendValidationError } = require('../utils/response');

sendValidationError(res, [
  { field: 'email', message: 'Invalid email format' },
  { field: 'password', message: 'Password too short' }
]);
```

**Response Format:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "validationErrors": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

---

### 5. Helper Functions

#### `sendUnauthorized(res, message)`
Send 401 Unauthorized error.

#### `sendForbidden(res, message)`
Send 403 Forbidden error.

#### `sendNotFound(res, message)`
Send 404 Not Found error.

#### `sendConflict(res, message)`
Send 409 Conflict error.

#### `sendInternalError(res, error, message)`
Send 500 Internal Server Error.

**Example:**
```javascript
const { sendUnauthorized, sendNotFound, sendInternalError } = require('../utils/response');

// 401
sendUnauthorized(res, 'Invalid credentials');

// 404
sendNotFound(res, 'User not found');

// 500
sendInternalError(res, error, 'Database connection failed');
```

---

## Usage Examples

### Before (Inconsistent):
```javascript
// Different formats across routes
res.status(400).json({ error: 'Invalid input' });
res.status(500).json({ error: 'Server error', details: error.message });
res.json({ message: 'Success', data: result });
```

### After (Standardized):
```javascript
const { sendError, sendSuccess, sendNotFound } = require('../utils/response');

// Consistent error format
sendError(res, 400, 'Invalid input');
sendError(res, 500, 'Server error', error);
sendSuccess(res, result, 'Operation successful');
sendNotFound(res, 'Item not found');
```

---

## Benefits

1. **Consistency** - All responses follow the same format
2. **Security** - Error details only exposed in development
3. **Logging** - Automatic error logging
4. **Maintainability** - Single place to update response format
5. **Type Safety** - Clear function signatures

---

## Migration Guide

### Step 1: Import the utility
```javascript
const { sendError, sendSuccess } = require('../utils/response');
```

### Step 2: Replace error responses
```javascript
// Old
res.status(400).json({ error: 'Invalid input' });

// New
sendError(res, 400, 'Invalid input');
```

### Step 3: Replace success responses
```javascript
// Old
res.json({ message: 'Success', data: result });

// New
sendSuccess(res, result, 'Success');
```

### Step 4: Replace 404 responses
```javascript
// Old
res.status(404).json({ error: 'Not found' });

// New
sendNotFound(res, 'Not found');
```

---

## Applied To

✅ `backend/routes/ourwork.js` - All endpoints updated
✅ `backend/routes/auth.js` - Login and register updated

**Remaining:** Other route files can be updated gradually

---

**Created:** $(date)
**Status:** Ready for use

