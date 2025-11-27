# Frontend API Integration Guide

## Overview
The frontend now integrates with the backend's standardized response format from the Common Response Utility.

## Backend Response Format

The backend now returns responses in a standardized format:

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": "Detailed error (development only)"
  }
}
```

---

## Frontend Response Handler

**Location:** `frontend/src/utils/apiResponse.js`

### Key Functions

1. **`extractData(response)`** - Extract data from response
2. **`extractErrorMessage(error)`** - Extract error message
3. **`handleApiError(error, options)`** - Handle errors with toast
4. **`handleApiSuccess(response, options)`** - Handle success with toast
5. **`apiCall(promise, options)`** - Wrapper for API calls

---

## Implementation Status

### ✅ Completed

1. **API Response Utility Created**
   - `frontend/src/utils/apiResponse.js` - Complete response handler

2. **API Service Updated**
   - `frontend/src/services/api.jsx` - Updated to use `extractData()`
   - Response interceptor enhanced to extract error messages

3. **Components Updated**
   - `frontend/src/component/OurWorkManagement.jsx` - Uses new response handlers
   - `frontend/src/component/LoginPage.jsx` - Uses new response handlers

### ⚠️ Remaining

- Other components still use legacy error handling
- Can be updated gradually as needed

---

## Usage Examples

### Example 1: Simple GET Request
```javascript
import api from '../services/api';
import { extractData, handleApiError } from '../utils/apiResponse';

const fetchItems = async () => {
  try {
    const response = await api.get('/items');
    const data = extractData(response);
    setItems(data);
  } catch (error) {
    handleApiError(error);
  }
};
```

### Example 2: POST with Success Message
```javascript
import api from '../services/api';
import { handleApiSuccess, handleApiError } from '../utils/apiResponse';

const createItem = async (itemData) => {
  try {
    const response = await api.post('/items', itemData);
    handleApiSuccess(response, {
      customMessage: 'Item created successfully!'
    });
  } catch (error) {
    handleApiError(error);
  }
};
```

### Example 3: Using apiCall Wrapper
```javascript
import api from '../services/api';
import { apiCall } from '../utils/apiResponse';

const createItem = async (itemData) => {
  try {
    const data = await apiCall(
      api.post('/items', itemData),
      { successMessage: 'Item created successfully!' }
    );
    return data;
  } catch (error) {
    // Error already handled with toast
  }
};
```

---

## Migration Checklist

For each component that makes API calls:

- [ ] Import response utilities
- [ ] Replace `response.data` with `extractData(response)`
- [ ] Replace error handling with `handleApiError(error)`
- [ ] Replace success handling with `handleApiSuccess(response)`
- [ ] Test with both new and legacy response formats

---

## Backward Compatibility

The utility maintains backward compatibility:
- Works with new standardized format
- Falls back to legacy format if `success` field not present
- No breaking changes to existing code

---

**Created:** $(date)
**Status:** Ready for use

