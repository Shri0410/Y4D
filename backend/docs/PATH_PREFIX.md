# Path Prefix Support

## Overview

Your application is deployed at `https://y4d.ngo/dev`, which means all routes need to support the `/dev` path prefix.

## What's Been Configured

The server now automatically handles the `/dev` path prefix for:

### ✅ Supported Endpoints

1. **Swagger Documentation:**
   - `https://y4d.ngo/dev/api-docs` ✅
   - `https://y4d.ngo/api-docs` ✅ (also works)

2. **API Routes:**
   - `https://y4d.ngo/dev/api/auth/login` ✅
   - `https://y4d.ngo/api/auth/login` ✅ (also works)

3. **Health Check:**
   - `https://y4d.ngo/dev/` ✅
   - `https://y4d.ngo/` ✅ (also works)

4. **Static Files:**
   - `https://y4d.ngo/dev/api/uploads/...` ✅
   - `https://y4d.ngo/api/uploads/...` ✅ (also works)

## How It Works

The server automatically detects the path prefix from:
1. `API_BASE_URL` environment variable (if it contains a path)
2. Request URL (if it starts with `/dev/`)

## Configuration

### Environment Variable

Set in your `.env` file:

```env
API_BASE_URL=https://y4d.ngo/dev
```

This ensures:
- Swagger uses the correct base URL
- All API responses use the correct path
- CORS works correctly

## Testing

After deployment, test these URLs:

```bash
# Health check
curl https://y4d.ngo/dev/

# Swagger docs
curl https://y4d.ngo/dev/api-docs

# API endpoint
curl https://y4d.ngo/dev/api/test-db
```

## Troubleshooting

### If Swagger shows 404

1. **Check NODE_ENV:**
   ```env
   NODE_ENV=development  # Swagger is disabled in production
   ```

2. **Check API_BASE_URL:**
   ```env
   API_BASE_URL=https://y4d.ngo/dev
   ```

3. **Verify route registration:**
   - Routes are registered at both `/api` and `/dev/api`
   - Swagger is available at both `/api-docs` and `/dev/api-docs`

### If API endpoints return 404

- Ensure routes are registered with both paths
- Check that `API_BASE_URL` includes `/dev`
- Verify the request URL matches the registered paths

## Notes

- Both `/api` and `/dev/api` paths work (for backward compatibility)
- The server automatically detects the prefix from requests
- Swagger UI adapts to the correct base URL automatically

