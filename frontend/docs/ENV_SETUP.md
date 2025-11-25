# Environment Variables Setup

## Overview

The frontend now uses centralized API configuration through environment variables. This allows easy switching between development and production environments.

## Environment Files

### `.env.development` (Local Development)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_UPLOADS_BASE_URL=http://localhost:5000/api/uploads
```

### `.env.production` (QA/Production)
```env
VITE_API_BASE_URL=https://y4d.ngo/dev/api
VITE_UPLOADS_BASE_URL=https://y4d.ngo/dev/api/uploads
```

## How to Use

1. **For Local Development:**
   - Create `.env.development` file in `frontend/` directory
   - Add the variables above
   - Run `npm run dev`

2. **For QA/Production Build:**
   - Create `.env.production` file in `frontend/` directory
   - Add the variables above
   - Run `npm run build`

## Important Notes

- Environment variables must be prefixed with `VITE_` to be accessible in Vite
- Files are gitignored (`.env*` files should not be committed)
- Use `.env.example` as a template
- Changes require restarting the dev server

## Centralized Configuration

All API URLs are now imported from `src/config/api.js`:

```javascript
import { API_BASE, UPLOADS_BASE, SERVER_BASE } from '../config/api';
```

This ensures a single source of truth for all API endpoints.

