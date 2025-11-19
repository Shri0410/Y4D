# Y4D.NGO Deployment Guide

## Server Configuration

Your hosting provider (y4d.ngo) automatically handles port assignment, similar to cloud platforms like Heroku or Railway.

### Key Points:

1. **Port is auto-assigned** - You don't need to set `PORT` in your `.env`
2. **Host is auto-detected** - The server automatically uses the request hostname
3. **Path prefix** - Your API is served at `https://y4d.ngo/dev`

## Environment Variables

Create a `.env` file with:

```env
# Production Environment
NODE_ENV=production

# API Base URL - Your server URL
API_BASE_URL=https://y4d.ngo/dev

# Allowed CORS Origins
ALLOWED_ORIGINS=https://y4d.ngo,https://www.y4d.ngo

# Database Configuration
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=y4d_dashboard
DB_PORT=3306

# JWT Secret
JWT_SECRET=your_strong_jwt_secret_here

# PORT - NOT NEEDED (auto-assigned by hosting provider)
# PORT=5000  # Don't set this - hosting provider handles it
```

## Important Notes

### 1. Port Configuration
Your hosting provider automatically assigns the port, so:
- ✅ **Don't set `PORT`** in your `.env` file
- ✅ The server will use the port provided by the hosting environment
- ✅ Your app listens on `0.0.0.0` which works with auto-assigned ports

### 2. API Base URL
Since your API is at `https://y4d.ngo/dev`, make sure:
- Set `API_BASE_URL=https://y4d.ngo/dev` in your `.env`
- The application will use this for Swagger and API responses
- If not set, it will auto-detect from request hostname

### 3. Path Prefix
Your API endpoints will be:
- `https://y4d.ngo/dev/` - Health check
- `https://y4d.ngo/dev/api/auth/login` - Login
- `https://y4d.ngo/dev/api/users` - Users
- etc.

## Deployment Steps

1. **Upload your code** to the server

2. **Create `.env` file:**
   ```bash
   cd /path/to/backend
   nano .env
   ```
   Add the environment variables above (without PORT)

3. **Install dependencies:**
   ```bash
   npm install --production
   ```

4. **Start the server:**
   ```bash
   node server.js
   # or with PM2
   pm2 start server.js --name y4d-backend
   ```

## Verification

After deployment, test:

```bash
# Health check
curl https://y4d.ngo/dev/

# Database test
curl https://y4d.ngo/dev/api/test-db

# API endpoint
curl https://y4d.ngo/dev/api/auth/login
```

## Troubleshooting

### If you see "Host: undefined" or "Port: undefined"

This is normal for auto-assigned ports. The application will:
- Use the request hostname automatically
- Work correctly even if these show as undefined
- The actual host/port are handled by your hosting provider

### If API endpoints return 404

Check:
1. Is `API_BASE_URL` set correctly?
2. Are routes registered correctly?
3. Is the path prefix `/dev` handled correctly?

## Summary

- ✅ **Don't set PORT** - hosting provider handles it
- ✅ **Set API_BASE_URL** to `https://y4d.ngo/dev`
- ✅ **Set ALLOWED_ORIGINS** for CORS
- ✅ **Server auto-detects hostname** from requests

Your setup is similar to cloud platforms - the hosting provider manages ports automatically!

