# Frontend Analysis - Y4D Website

## 📋 Overview

The frontend is a **React 18** application built with **Vite**, using **React Router** for navigation and **Axios** for API communication.

## 🛠️ Technology Stack

### Core Technologies
- **React 18.2.0** - UI library
- **Vite 4.3.2** - Build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing
- **Axios 1.11.0** - HTTP client

### UI Libraries & Dependencies
- **AOS (Animate On Scroll) 2.3.4** - Scroll animations
- **React Slick 0.31.0** - Carousel component
- **React Simple Maps 3.0.0** - Map visualization
- **React Tooltip 5.29.1** - Tooltip component
- **Typeface Poppins** - Font family

### Development Tools
- **ESLint** - Code linting
- **@vitejs/plugin-react** - Vite React plugin

## 📁 Project Structure

```
frontend/
├── public/
│   ├── partners/          # Partner logos (55 PNG files)
│   └── vite.svg
├── src/
│   ├── assets/            # Static assets (images, videos, logos)
│   ├── component/         # Reusable React components (33 files)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components (67 files)
│   ├── services/          # API service layer
│   ├── styles/            # Global styles
│   ├── utils/              # Utility functions
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global CSS
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

## 🔍 Key Components

### Pages (35 JSX files)
- **Public Pages**: Home, About, Our Team, Our Work, Contact, etc.
- **Content Pages**: Quality Education, Healthcare, Livelihood, Environment Sustainability, IDP
- **Media Pages**: Blogs, Stories, Events, Documentaries, Newsletters
- **Admin Pages**: Dashboard (protected)

### Components (21 JSX files)
- **Layout**: Navbar, Footer, Banner
- **Admin**: Dashboard, LoginPage, UserManagement, MediaManager
- **Forms**: RegistrationForm, PublicRegistrationForm, PasswordResetModal
- **Content**: BannerManagement, OurWorkManagement, AccreditationManagement

## 🔌 API Integration

### Current API Configuration

**Main API Base URL:**
```javascript
const API_BASE = "https://y4dorg-backend.onrender.com/api";
```

**Issues Found:**
1. **Hardcoded URLs** in multiple files:
   - `services/api.jsx`: `https://y4dorg-backend.onrender.com/api`
   - `utils/permissions.jsx`: `https://y4dorg-backend.onrender.com/api`
   - `hooks/useBanners.js`: Mixed URLs (`y4dorg-backend.onrender.com` and `localhost:5000`)
   - `pages/Blogs.jsx`: `http://localhost:5000/uploads/banners/`
   - `component/OurWorkManager.jsx`: `http://localhost:5000${item.image_url}`
   - Many other files with hardcoded URLs

2. **No Environment Variable Configuration**:
   - No `.env` file
   - No `VITE_` prefixed environment variables
   - Only `BlogDetails.jsx` uses `import.meta.env.VITE_API_BASE` (but with fallback)

3. **Inconsistent API Endpoints**:
   - Some use `https://y4dorg-backend.onrender.com/api`
   - Some use `https://y4dorg-backend.onrender.com/` (missing `/api`)
   - Some use `http://localhost:5000` (development only)
   - Upload URLs vary: `/uploads/`, `/api/uploads/`

### API Service Layer

**File**: `src/services/api.jsx`

**Current Implementation:**
```javascript
const API_BASE = "https://y4dorg-backend.onrender.com/api";
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" }
});
```

**Exported Functions:**
- `getCareers()` - Fetch job listings
- `applyForJob()` - Submit job application
- `getImpactData()` - Fetch impact statistics
- `getManagement()` - Fetch management team
- `getMentors()` - Fetch mentors
- `getReports()` - Fetch reports
- `getBanners()` - Fetch banners (but uses direct axios, not api instance)
- `getAllBanners()` - Fetch all banners (direct axios)
- `getAccreditations()` - Fetch accreditations

## 🔐 Authentication Flow

### Login Process
1. User submits credentials via `LoginPage.jsx` or `AdminLogin.jsx`
2. POST request to `/api/auth/login`
3. On success:
   - Token stored in `localStorage.setItem('token', data.token)`
   - User data stored in `localStorage.setItem('user', JSON.stringify(data.user))`
4. User redirected to Dashboard

### Protected Routes
- `/admin/*` - Requires authentication
- Dashboard checks `isAuthenticated` state
- API requests include token: `Authorization: Bearer ${token}`

### Permission System
- **File**: `src/utils/permissions.jsx`
- Fetches permissions from `/api/permissions/my-permissions`
- Caches permissions in memory
- Role-based fallback: `super_admin`, `admin`, `editor`, `viewer`
- Granular permissions: `can_view`, `can_create`, `can_edit`, `can_delete`, `can_publish`

## 🎨 Styling

### CSS Organization
- Component-level CSS files (e.g., `Dashboard.css`, `Navbar.css`)
- Global styles in `index.css`
- Common styles in `styles/common.css`
- Dynamic content styles in `styles/dynamic-content.css`
- Font Awesome 6.4.0 via CDN

### Fonts
- **Poppins** via `typeface-poppins` package

## 🚀 Routing

### Route Structure
```javascript
/                    → Home
/about               → About
/our-team            → Our Team
/our-work            → Our Work
/quality-education   → Quality Education
/livelihood          → Livelihood
/healthcare          → Healthcare
/environment-sustainability → Environment
/idp                 → IDP
/careers             → Careers
/media-corner         → Media Corner
/blogs               → Blogs
/stories             → Stories
/events              → Events
/documentaries       → Documentaries
/newsletters         → Newsletters
/contact             → Contact
/admin/*             → Admin Dashboard (protected)
/register            → Public Registration
```

### Page Transitions
- Custom `PageTransition` component
- 1.7 second transition on route change
- Loading state managed in `App.jsx`

## ⚠️ Critical Issues

### 1. **Hardcoded API URLs**
**Impact**: Cannot easily switch between development/production environments

**Files Affected:**
- `services/api.jsx`
- `utils/permissions.jsx`
- `hooks/useBanners.js`
- `pages/Blogs.jsx`
- `pages/Stories.jsx`
- `pages/QualityEducation.jsx`
- `pages/Livelihood.jsx`
- `pages/Healthcare.jsx`
- `pages/EnvironmentSustainability.jsx`
- `pages/IDP.jsx`
- `pages/Events.jsx`
- `pages/Documentaries.jsx`
- `pages/NewsLetters.jsx`
- `pages/LegalReports.jsx`
- `pages/Home.jsx`
- `pages/About.jsx`
- `pages/DonateNow.jsx`
- `component/UserManagement.jsx`
- `component/RegistrationRequests.jsx`
- `component/RegistrationModal.jsx`
- `component/PasswordResetModal.jsx`
- `component/PublicRegistrationForm.jsx`
- `component/OurWorkManager.jsx`
- `component/OurWorkManagement.jsx`
- `component/MediaManager.jsx`
- `component/AdminLogin.jsx`
- `component/LoginPage.jsx`
- `component/Dashboard.jsx`

### 2. **No Environment Variable Support**
**Impact**: Cannot configure API URLs per environment

**Missing:**
- `.env` file
- `.env.development` file
- `.env.production` file
- Vite environment variable configuration

### 3. **Inconsistent Upload URL Patterns**
**Impact**: Images may not load correctly

**Patterns Found:**
- `https://y4dorg-backend.onrender.com/uploads/banners/`
- `https://y4dorg-backend.onrender.com/api/uploads/banners/`
- `http://localhost:5000/uploads/banners/`
- `http://localhost:5000${item.image_url}`

### 4. **Mixed API Base URLs**
**Impact**: Some requests may fail or point to wrong server

**Variations:**
- `https://y4dorg-backend.onrender.com/api` (correct)
- `https://y4dorg-backend.onrender.com/` (missing `/api`)
- `http://localhost:5000/api` (development only)

### 5. **No Axios Interceptor for Auth Token**
**Impact**: Must manually add token to each request

**Current State:**
- Token manually added: `headers: { Authorization: Bearer ${token} }`
- No automatic token injection
- No automatic token refresh
- No automatic logout on 401

### 6. **Console.log Statements in Production**
**Impact**: Performance and security concerns

**Found in:**
- `services/api.jsx` - Multiple console.log/console.error
- `hooks/useBanners.js` - console.error
- `pages/BlogDetails.jsx` - Uses env vars but has fallback
- Many other files

## 📊 Statistics

- **Total Files**: ~100+ files
- **Pages**: 35 JSX pages
- **Components**: 21 JSX components
- **API Endpoints Used**: ~20+ different endpoints
- **Hardcoded URLs**: 30+ instances
- **CSS Files**: 32 CSS files

## ✅ Recommendations

### 1. **Implement Environment Variables**
```env
# .env.development
VITE_API_BASE_URL=http://localhost:5000/api
VITE_UPLOADS_BASE_URL=http://localhost:5000/api/uploads

# .env.production
VITE_API_BASE_URL=https://y4d.ngo/dev/api
VITE_UPLOADS_BASE_URL=https://y4d.ngo/dev/api/uploads
```

### 2. **Centralize API Configuration**
Create `src/config/api.js`:
```javascript
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:5000/api/uploads';
```

### 3. **Update Axios Instance**
Add auth token interceptor:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4. **Replace All Hardcoded URLs**
Use centralized config from `src/config/api.js`

### 5. **Add Build Script for Production**
Update `vite.config.js` for production optimizations

### 6. **Remove Console.log in Production**
Use a logger utility similar to backend

### 7. **Standardize Upload URLs**
Use consistent pattern: `${UPLOADS_BASE}/banners/`, etc.

## 🔗 Backend Integration

### Current Backend URL
- **Production**: `https://y4dorg-backend.onrender.com`
- **New Backend**: `https://y4d.ngo/dev` (needs to be configured)

### API Endpoints Used
- `/api/auth/login` - Authentication
- `/api/auth/reset-password` - Password reset
- `/api/users` - User management
- `/api/permissions/my-permissions` - Permissions
- `/api/banners` - Banner management
- `/api/mentors` - Mentors
- `/api/management` - Management team
- `/api/board-trustees` - Board of trustees
- `/api/careers` - Careers
- `/api/media` - Media content
- `/api/our-work` - Our work content
- `/api/reports` - Reports
- `/api/accreditations` - Accreditations
- `/api/impact-data` - Impact data
- `/api/registration` - Registration requests

## 📝 Next Steps

1. Create environment variable configuration
2. Centralize API configuration
3. Replace all hardcoded URLs
4. Add axios interceptors for auth
5. Standardize upload URL patterns
6. Add production build optimizations
7. Remove console.log statements
8. Test with new backend URL (`https://y4d.ngo/dev`)

