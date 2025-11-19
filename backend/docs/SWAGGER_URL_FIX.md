# Swagger URL Auto-Detection Fix

## Problem

Swagger was showing `http://localhost:5000/dev` instead of `https://y4d.ngo/dev` in the server dropdown.

## Solution

Updated the `getApiBaseUrl()` function to properly detect the hostname from request headers, especially when behind a reverse proxy.

## How It Works

### Detection Priority

1. **Request Headers (Highest Priority)**
   - Checks `X-Forwarded-Host` header (set by reverse proxies)
   - Falls back to `Host` header
   - Detects protocol from `X-Forwarded-Proto` or `req.protocol`
   - Detects path prefix from request URL

2. **Environment Variable**
   - Uses `API_BASE_URL` if set

3. **Default**
   - Falls back to `http://localhost:5000` for local development

### Key Changes

1. **Trust Proxy Enabled**
   ```javascript
   app.set('trust proxy', true);
   ```
   This allows Express to read `X-Forwarded-*` headers correctly.

2. **Header Priority**
   - `X-Forwarded-Host` (from reverse proxy)
   - `Host` header
   - `req.hostname`

3. **Protocol Detection**
   - `X-Forwarded-Proto` (from reverse proxy)
   - `req.protocol`
   - Defaults to `https` for production

4. **Path Prefix Detection**
   - From `API_BASE_URL` environment variable
   - Or from request URL (if starts with `/dev/`)

## Configuration

### Required Environment Variable

```env
API_BASE_URL=https://y4d.ngo/dev
```

This ensures:
- Swagger knows the base path (`/dev`)
- Fallback if headers aren't available
- Consistent URL across all requests

### Trust Proxy

The server now trusts the proxy, which is required for:
- Correct protocol detection (`https` vs `http`)
- Correct hostname detection
- Proper `X-Forwarded-*` header reading

## Testing

After deployment, Swagger should show:
- **Server URL**: `https://y4d.ngo/dev` ✅
- **Not**: `http://localhost:5000/dev` ❌

## Troubleshooting

### Still showing localhost?

1. **Check environment variable:**
   ```env
   API_BASE_URL=https://y4d.ngo/dev
   ```

2. **Verify trust proxy is enabled:**
   ```javascript
   app.set('trust proxy', true);
   ```

3. **Check request headers:**
   - `X-Forwarded-Host` should contain `y4d.ngo`
   - `X-Forwarded-Proto` should contain `https`

4. **Restart server** after changes

### Debug Mode

The code includes debug logging (in development mode) that shows:
- Detected protocol
- Detected host
- Forwarded headers
- Final URL

Check server logs for:
```
Swagger URL Detection: { ... }
```

## Summary

- ✅ Auto-detects hostname from request
- ✅ Supports reverse proxy headers
- ✅ Detects path prefix (`/dev`)
- ✅ Uses `https` in production
- ✅ Falls back to `API_BASE_URL` if needed

