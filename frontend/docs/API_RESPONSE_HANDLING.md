# Frontend API Response Handling

## Overview
The frontend now handles standardized backend responses from the Common Response Utility.

## Backend Response Format

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

### Validation Error Response:
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

### Paginated Response:
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

## API Response Utility

**Location:** `frontend/src/utils/apiResponse.js`

### Available Functions

#### 1. `extractData(response)`
Extract data from standardized API response.

```javascript
import { extractData } from '../utils/apiResponse';

const response = await api.get('/endpoint');
const data = extractData(response);
// Returns: response.data.data (for new format) or response.data (for legacy)
```

#### 2. `extractErrorMessage(error)`
Extract error message from standardized API error.

```javascript
import { extractErrorMessage } from '../utils/apiResponse';

try {
  await api.post('/endpoint', data);
} catch (error) {
  const message = extractErrorMessage(error);
  // Returns: error.response.data.error.message (for new format)
}
```

#### 3. `extractValidationErrors(error)`
Extract validation errors from API error.

```javascript
import { extractValidationErrors } from '../utils/apiResponse';

try {
  await api.post('/endpoint', data);
} catch (error) {
  const validationErrors = extractValidationErrors(error);
  // Returns: Array of validation errors
}
```

#### 4. `handleApiError(error, options)`
Handle API error with automatic toast notification.

```javascript
import { handleApiError } from '../utils/apiResponse';

try {
  await api.post('/endpoint', data);
} catch (error) {
  handleApiError(error, { showToast: true });
  // Automatically shows toast and logs error
}
```

#### 5. `handleApiSuccess(response, options)`
Handle API success with automatic toast notification.

```javascript
import { handleApiSuccess } from '../utils/apiResponse';

const response = await api.post('/endpoint', data);
const data = handleApiSuccess(response, { 
  showToast: true,
  customMessage: 'Custom success message'
});
// Automatically shows toast if message exists
```

#### 6. `apiCall(apiCall, options)`
Wrapper for API calls that handles standardized responses.

```javascript
import { apiCall } from '../utils/apiResponse';

try {
  const data = await apiCall(
    api.post('/endpoint', formData),
    {
      showSuccessToast: true,
      showErrorToast: true,
      successMessage: 'Item created successfully!'
    }
  );
} catch (error) {
  // Error already handled with toast
}
```

---

## Usage Examples

### Example 1: Simple API Call
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

### Example 2: Create with Success Message
```javascript
import api from '../services/api';
import { handleApiSuccess, handleApiError } from '../utils/apiResponse';

const createItem = async (itemData) => {
  try {
    const response = await api.post('/items', itemData);
    const data = handleApiSuccess(response, {
      customMessage: 'Item created successfully!'
    });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
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
      {
        successMessage: 'Item created successfully!'
      }
    );
    return data;
  } catch (error) {
    // Error already handled
    throw error;
  }
};
```

### Example 4: Handling Validation Errors
```javascript
import api from '../services/api';
import { extractErrorMessage, extractValidationErrors } from '../utils/apiResponse';

const submitForm = async (formData) => {
  try {
    await api.post('/submit', formData);
  } catch (error) {
    const validationErrors = extractValidationErrors(error);
    
    if (validationErrors.length > 0) {
      // Handle validation errors
      validationErrors.forEach(err => {
        setFieldError(err.field, err.message);
      });
    } else {
      // Handle general error
      const message = extractErrorMessage(error);
      toast.error(message);
    }
  }
};
```

### Example 5: Paginated Response
```javascript
import api from '../services/api';
import { extractData, extractPagination } from '../utils/apiResponse';

const fetchPaginatedItems = async (page = 1) => {
  try {
    const response = await api.get(`/items?page=${page}`);
    const data = extractData(response);
    const pagination = extractPagination(response);
    
    setItems(data);
    setPagination(pagination);
  } catch (error) {
    handleApiError(error);
  }
};
```

---

## Migration Guide

### Step 1: Import the utility
```javascript
import { extractData, handleApiError, handleApiSuccess } from '../utils/apiResponse';
```

### Step 2: Update API calls
```javascript
// Before
const response = await api.get('/items');
setItems(response.data);

// After
const response = await api.get('/items');
const data = extractData(response);
setItems(data);
```

### Step 3: Update error handling
```javascript
// Before
catch (error) {
  const errorMessage = error.response?.data?.error || 'Error occurred';
  toast.error(errorMessage);
}

// After
catch (error) {
  handleApiError(error);
  // Automatically shows toast and logs error
}
```

### Step 4: Update success handling
```javascript
// Before
const response = await api.post('/items', data);
toast.success('Item created!');

// After
const response = await api.post('/items', data);
handleApiSuccess(response, { customMessage: 'Item created!' });
```

---

## Backward Compatibility

The utility maintains backward compatibility with legacy response formats:
- If response doesn't have `success` field, it treats it as legacy format
- Legacy format: Returns `response.data` directly
- New format: Returns `response.data.data`

---

## Applied To

✅ `frontend/src/services/api.jsx` - Updated to use extractData
✅ `frontend/src/component/OurWorkManagement.jsx` - Updated error/success handling

**Remaining:** Other components can be updated gradually

---

## Benefits

1. **Consistency** - All API responses handled uniformly
2. **Automatic Toast** - Success/error messages shown automatically
3. **Error Logging** - Automatic error logging
4. **Validation Support** - Easy handling of validation errors
5. **Pagination Support** - Easy extraction of pagination metadata
6. **Backward Compatible** - Works with both new and legacy formats

---

**Created:** $(date)
**Status:** Ready for use

