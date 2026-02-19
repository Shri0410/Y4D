# Frontend Code Restructure & Improvement Guide

## 📋 Current State Analysis

### Current Structure Issues:
1. **Inconsistent folder naming**: `component/` vs `components/`
2. **Mixed API patterns**: Direct `axios` calls, `fetch`, and service layer mixed
3. **Scattered API calls**: API calls in components, pages, and services
4. **No clear feature-based organization**
5. **Inconsistent naming conventions**: `Baner.css` (typo), `Corporatepartnership.jsx` (no camelCase)
6. **No centralized error handling**
7. **Duplicate code patterns across components**

---

## 🎯 Recommended Folder Structure

```
frontend/src/
├── api/                          # All API-related code
│   ├── client/                   # API client setup
│   │   ├── axiosClient.js        # Axios instance & interceptors
│   │   ├── requestInterceptor.js # Request interceptors
│   │   └── responseInterceptor.js # Response interceptors
│   ├── services/                 # Feature-based API services
│   │   ├── auth.service.js       # Authentication APIs
│   │   ├── banners.service.js   # Banner APIs
│   │   ├── careers.service.js   # Career APIs
│   │   ├── media.service.js     # Media APIs
│   │   ├── ourwork.service.js   # Our Work APIs
│   │   ├── users.service.js     # User management APIs
│   │   ├── reports.service.js   # Reports APIs
│   │   ├── impact.service.js    # Impact data APIs
│   │   └── payment.service.js   # Payment APIs
│   ├── endpoints/                # API endpoint constants
│   │   └── routes.js            # Centralized route definitions
│   └── types/                    # API response types (if using TypeScript)
│       └── responses.js
│
├── components/                    # Reusable UI components (singular, consistent)
│   ├── common/                   # Common/shared components
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.css
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Loading/
│   │   └── ErrorBoundary/
│   ├── layout/                   # Layout components
│   │   ├── Navbar/
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.css
│   │   ├── Footer/
│   │   └── PageLayout/
│   ├── forms/                    # Form components
│   │   ├── DonateForm/
│   │   ├── ContactForm/
│   │   └── RegistrationForm/
│   └── admin/                    # Admin-specific components
│       ├── Dashboard/
│       ├── UserManagement/
│       ├── BannerManagement/
│       └── MediaManager/
│
├── features/                     # Feature-based modules (optional, for large apps)
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── donations/
│   ├── media/
│   └── admin/
│
├── pages/                        # Page components (route-level)
│   ├── public/                  # Public pages
│   │   ├── Home/
│   │   ├── About/
│   │   ├── Contact/
│   │   └── DonateNow/
│   ├── work/                    # Our Work pages
│   │   ├── QualityEducation/
│   │   ├── Healthcare/
│   │   └── Livelihood/
│   └── admin/                   # Admin pages
│       └── Dashboard/
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.js
│   ├── useBanners.js
│   ├── useApi.js                # Generic API hook
│   ├── usePagination.js
│   └── useDebounce.js
│
├── utils/                        # Utility functions
│   ├── api/                     # API utilities
│   │   ├── responseHandler.js   # Response parsing
│   │   ├── errorHandler.js      # Error handling
│   │   └── requestBuilder.js   # Request construction
│   ├── validation/              # Validation utilities
│   │   └── validators.js
│   ├── formatting/              # Formatting utilities
│   │   └── formatters.js
│   ├── constants/               # App constants
│   │   └── constants.js
│   └── helpers/                 # General helpers
│       ├── logger.js
│       ├── tokenManager.js
│       └── permissions.jsx
│
├── config/                       # Configuration files
│   ├── api.js                   # API configuration
│   ├── routes.js                # Route configuration
│   └── env.js                   # Environment config
│
├── styles/                       # Global styles
│   ├── variables.css            # CSS variables
│   ├── mixins.css               # CSS mixins
│   ├── common.css               # Common styles
│   └── themes.css               # Theme styles
│
├── assets/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── contexts/                     # React contexts
│   ├── AuthContext.js
│   ├── ThemeContext.js
│   └── AppContext.js
│
└── types/                        # TypeScript types (if using TS)
    └── index.d.ts
```

---

## 🔧 API Organization Improvements

### 1. Centralized API Client

**File: `api/client/axiosClient.js`**
```javascript
import axios from 'axios';
import { API_BASE } from '../../config/api';
import { getToken, clearAuth } from '../../utils/tokenManager';
import { requestInterceptor } from './requestInterceptor';
import { responseInterceptor } from './responseInterceptor';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors
apiClient.interceptors.request.use(
  requestInterceptor.onFulfilled,
  requestInterceptor.onRejected
);

apiClient.interceptors.response.use(
  responseInterceptor.onFulfilled,
  responseInterceptor.onRejected
);

export default apiClient;
```

### 2. Feature-Based API Services

**File: `api/services/banners.service.js`**
```javascript
import apiClient from '../client/axiosClient';
import { handleApiError, extractData } from '../../utils/api/responseHandler';

/**
 * Banner Service
 * All banner-related API calls
 */
export const bannerService = {
  /**
   * Get banners by page and section
   * @param {string} page - Page name (e.g., 'home', 'donate')
   * @param {string} section - Section name (e.g., 'hero', 'campaigns')
   * @returns {Promise<Array>} Array of banners
   */
  getBanners: async (page = 'home', section = null) => {
    try {
      let url = `/banners/page/${page}`;
      if (section) url += `?section=${section}`;
      
      const response = await apiClient.get(url);
      return extractData(response);
    } catch (error) {
      handleApiError(error, { context: 'bannerService.getBanners' });
      return [];
    }
  },

  /**
   * Get all banners (admin)
   * @returns {Promise<Array>} Array of all banners
   */
  getAllBanners: async () => {
    try {
      const response = await apiClient.get('/banners');
      return extractData(response);
    } catch (error) {
      handleApiError(error, { context: 'bannerService.getAllBanners' });
      return [];
    }
  },

  /**
   * Get banner by ID
   * @param {number} id - Banner ID
   * @returns {Promise<Object>} Banner object
   */
  getBannerById: async (id) => {
    try {
      const response = await apiClient.get(`/banners/${id}`);
      return extractData(response);
    } catch (error) {
      handleApiError(error, { context: 'bannerService.getBannerById' });
      throw error;
    }
  },

  /**
   * Create new banner
   * @param {FormData} formData - Banner data with file
   * @returns {Promise<Object>} Created banner
   */
  createBanner: async (formData) => {
    try {
      const response = await apiClient.post('/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    } catch (error) {
      handleApiError(error, { context: 'bannerService.createBanner' });
      throw error;
    }
  },

  /**
   * Update banner
   * @param {number} id - Banner ID
   * @param {FormData} formData - Updated banner data
   * @returns {Promise<Object>} Updated banner
   */
  updateBanner: async (id, formData) => {
    try {
      const response = await apiClient.put(`/banners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    } catch (error) {
      handleApiError(error, { context: 'bannerService.updateBanner' });
      throw error;
    }
  },

  /**
   * Delete banner
   * @param {number} id - Banner ID
   * @returns {Promise<void>}
   */
  deleteBanner: async (id) => {
    try {
      await apiClient.delete(`/banners/${id}`);
    } catch (error) {
      handleApiError(error, { context: 'bannerService.deleteBanner' });
      throw error;
    }
  },
};

export default bannerService;
```

### 3. Centralized Endpoint Constants

**File: `api/endpoints/routes.js`**
```javascript
/**
 * API Endpoint Constants
 * Centralized route definitions for consistency
 */
export const API_ROUTES = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Banners
  BANNERS: {
    BASE: '/banners',
    BY_PAGE: (page) => `/banners/page/${page}`,
    BY_ID: (id) => `/banners/${id}`,
    ACTIVE: '/banners/active',
    PAGES_LIST: '/banners/pages/list',
  },

  // Media
  MEDIA: {
    BASE: '/media',
    BY_TYPE: (type) => `/media/${type}`,
    BY_ID: (type, id) => `/media/${type}/${id}`,
    PUBLISHED: (type) => `/media/published/${type}`,
  },

  // Careers
  CAREERS: {
    BASE: '/careers',
    ACTIVE: '/careers/active',
    APPLY: '/careers/apply',
    BY_ID: (id) => `/careers/${id}`,
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    PERMISSIONS: (id) => `/users/${id}/permissions`,
  },

  // Payment
  PAYMENT: {
    CREATE_ORDER: '/payment/create-order',
    VERIFY_PAYMENT: '/payment/verify-payment',
    KEY: '/payment/key',
  },
};

export default API_ROUTES;
```

### 4. Custom API Hook

**File: `hooks/useApi.js`**
```javascript
import { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '../utils/api/errorHandler';

/**
 * Generic API hook for data fetching
 * @param {Function} apiCall - API function to call
 * @param {Array} dependencies - useEffect dependencies
 * @param {Object} options - Options
 */
export const useApi = (apiCall, dependencies = [], options = {}) => {
  const { 
    immediate = true, 
    onSuccess, 
    onError,
    defaultData = null 
  } = options;

  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err, { 
        showToast: false,
        context: 'useApi'
      });
      setError(errorMessage);
      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, refetch: execute };
};

export default useApi;
```

---

## 🏗️ Component Organization

### 1. Component Structure Pattern

**Each component should follow this structure:**
```
ComponentName/
├── ComponentName.jsx          # Main component
├── ComponentName.css          # Component styles
├── ComponentName.test.jsx     # Tests (if applicable)
├── index.js                   # Export file
└── hooks/                     # Component-specific hooks (if needed)
    └── useComponentName.js
```

**Example: `components/common/Button/Button.jsx`**
```javascript
import React from 'react';
import './Button.css';
import PropTypes from 'prop-types';

/**
 * Button Component
 * Reusable button with variants
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const classes = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'outline']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
};

export default Button;
```

### 2. Naming Conventions

**Files:**
- Components: `PascalCase.jsx` (e.g., `BannerManagement.jsx`)
- Utilities: `camelCase.js` (e.g., `tokenManager.js`)
- Constants: `UPPER_SNAKE_CASE.js` (e.g., `API_ROUTES.js`)
- Hooks: `useCamelCase.js` (e.g., `useBanners.js`)
- CSS: Match component name (e.g., `BannerManagement.css`)

**Variables & Functions:**
- Components: `PascalCase` (e.g., `const BannerManagement = () => {}`)
- Functions: `camelCase` (e.g., `const fetchBanners = async () => {}`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `const API_BASE = '...'`)
- Hooks: `useCamelCase` (e.g., `const useBanners = () => {}`)

---

## 🛡️ Robustness Improvements

### 1. Error Boundary Wrapper

**File: `components/common/ErrorBoundary/ErrorBoundary.jsx`**
```javascript
import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 2. Request Retry Logic

**File: `api/client/retryHandler.js`**
```javascript
/**
 * Retry handler for failed API requests
 */
export const retryRequest = async (requestFn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};
```

### 3. Request Cancellation

**File: `hooks/useCancellableRequest.js`**
```javascript
import { useEffect, useRef } from 'react';
import { CancelToken } from 'axios';

export const useCancellableRequest = () => {
  const cancelTokenSourceRef = useRef(null);

  const createCancelToken = () => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Request cancelled');
    }
    cancelTokenSourceRef.current = CancelToken.source();
    return cancelTokenSourceRef.current.token;
  };

  useEffect(() => {
    return () => {
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  return { createCancelToken };
};
```

### 4. Loading States Management

**File: `hooks/useLoadingState.js`**
```javascript
import { useState, useCallback } from 'react';

export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};
```

---

## 📝 Migration Checklist

### Phase 1: API Organization
- [ ] Create `api/client/` directory structure
- [ ] Move axios setup to `axiosClient.js`
- [ ] Create feature-based service files
- [ ] Create endpoint constants file
- [ ] Update all components to use new services

### Phase 2: Component Reorganization
- [ ] Rename `component/` to `components/`
- [ ] Organize components into subdirectories (common, layout, forms, admin)
- [ ] Fix naming inconsistencies (Baner → Banner, etc.)
- [ ] Create index.js files for easier imports

### Phase 3: Utilities & Hooks
- [ ] Organize utils into subdirectories
- [ ] Create custom hooks for common patterns
- [ ] Standardize error handling
- [ ] Add request retry logic

### Phase 4: Code Quality
- [ ] Add PropTypes or TypeScript
- [ ] Add ESLint rules for naming conventions
- [ ] Add Prettier for code formatting
- [ ] Add unit tests for utilities and hooks

---

## 🎨 Best Practices

### 1. Import Organization
```javascript
// 1. React and third-party libraries
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Internal utilities and config
import { API_BASE } from '../config/api';
import logger from '../utils/logger';

// 3. Components
import Button from '../components/common/Button/Button';
import Navbar from '../components/layout/Navbar/Navbar';

// 4. Styles
import './ComponentName.css';
```

### 2. Component Structure
```javascript
// 1. Imports
// 2. Constants
// 3. Component definition
// 4. Hooks
// 5. Event handlers
// 6. Effects
// 7. Render helpers
// 8. Main render
// 9. Export
```

### 3. Error Handling Pattern
```javascript
try {
  const data = await apiService.getData();
  // Handle success
} catch (error) {
  // Error already handled by interceptor/service
  // Just handle UI state here
  setError(error.message);
}
```

---

## 📚 Additional Recommendations

1. **Add TypeScript**: Gradually migrate to TypeScript for better type safety
2. **Add Storybook**: For component documentation and testing
3. **Add Testing**: Jest + React Testing Library for unit tests
4. **Add Code Splitting**: Use React.lazy() for route-based code splitting
5. **Add State Management**: Consider Redux or Zustand for complex state
6. **Add Form Library**: React Hook Form for better form management
7. **Add Validation Library**: Yup or Zod for schema validation
8. **Add i18n**: For internationalization support

---

## 🔄 Migration Example

### Before:
```javascript
// pages/DonateNow.jsx
import axios from 'axios';
import { API_BASE } from '../config/api';

const fetchBanners = async () => {
  try {
    const res = await axios.get(`${API_BASE}/banners/page/donate?section=hero`);
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
```

### After:
```javascript
// pages/DonateNow.jsx
import { useApi } from '../hooks/useApi';
import { bannerService } from '../api/services/banners.service';

const DonateNow = () => {
  const { data: banners, loading } = useApi(
    () => bannerService.getBanners('donate', 'hero'),
    []
  );
  
  // Component logic...
};
```

---

This guide provides a comprehensive roadmap for improving your frontend codebase structure, organization, and robustness.

