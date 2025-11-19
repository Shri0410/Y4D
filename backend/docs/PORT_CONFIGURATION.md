# Port Configuration Guide

## Quick Answer

**Do you need to provide PORT on the server?**

- **With Reverse Proxy (nginx/Apache):** ✅ **YES** - Set `PORT=5000` (or your chosen port)
- **Cloud Platforms (Heroku/Railway/Render):** ❌ **NO** - They auto-assign `PORT`
- **Direct Deployment:** ✅ **YES** - Set `PORT=5000` (or any available port)
- **Docker:** ⚠️ **MAYBE** - Depends on your setup

## Current Configuration

The application is configured as:

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", ...);
```

This means:
- ✅ Defaults to port **5000** if `PORT` is not set
- ✅ Listens on all network interfaces (`0.0.0.0`)
- ✅ Can be overridden with `PORT` environment variable

## Deployment Scenarios

### 1. Reverse Proxy Setup (nginx/Apache)

**You MUST set PORT:**

```env
PORT=5000
```

**Why?** Your reverse proxy forwards requests to this port:
```nginx
proxy_pass http://localhost:5000;  # Must match PORT
```

### 2. Cloud Platforms

**You DON'T need to set PORT:**

Platforms like Heroku, Railway, Render automatically provide `PORT`:
```env
# Don't set PORT - platform handles it
# PORT will be something like: 12345 (auto-assigned)
```

### 3. Direct Server Deployment

**You SHOULD set PORT:**

```env
PORT=5000
```

Or any available port:
```env
PORT=3000
PORT=8080
```

### 4. Docker

**Depends on your setup:**

```dockerfile
# Option 1: Use environment variable
ENV PORT=5000
EXPOSE 5000

# Option 2: Let Docker handle it
EXPOSE 5000
```

```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "5000:5000"  # Host:Container
    environment:
      - PORT=5000
```

### 5. PM2 / Process Manager

**Recommended to set PORT:**

```env
PORT=5000
```

Then:
```bash
pm2 start server.js --name y4d-backend
```

## Port Conflicts

If port 5000 is already in use:

1. **Find what's using the port:**
   ```bash
   # Linux/Mac
   lsof -i :5000
   # or
   netstat -tulpn | grep 5000
   
   # Windows
   netstat -ano | findstr :5000
   ```

2. **Use a different port:**
   ```env
   PORT=5001
   # or
   PORT=8080
   ```

3. **Update reverse proxy** (if using one):
   ```nginx
   proxy_pass http://localhost:5001;  # Match new PORT
   ```

## Best Practices

### ✅ Recommended Setup

```env
# .env file
NODE_ENV=production
PORT=5000
API_BASE_URL=https://api.yourdomain.com
```

### ✅ With Reverse Proxy

```env
# Backend .env
PORT=5000

# nginx config
proxy_pass http://localhost:5000;
```

### ✅ Cloud Platform

```env
# .env (don't set PORT)
NODE_ENV=production
API_BASE_URL=https://your-app.railway.app
# PORT will be provided by platform
```

## Verification

After deployment, verify the port:

```bash
# Check if server is listening
curl http://localhost:5000/
# or
curl http://localhost:5000/api/test-db
```

## Summary

| Deployment Type | Set PORT? | Default Works? |
|----------------|-----------|----------------|
| Reverse Proxy | ✅ Yes | ✅ Yes (5000) |
| Cloud Platform | ❌ No | ✅ Yes (auto) |
| Direct Server | ✅ Yes | ✅ Yes (5000) |
| Docker | ⚠️ Maybe | ✅ Yes (5000) |
| PM2 | ✅ Recommended | ✅ Yes (5000) |

**Bottom Line:** The app works with or without setting PORT (defaults to 5000), but it's **recommended to set it explicitly** for clarity and consistency.

