# Deployment Guide

## 🌐 Server Hostname Configuration

When deploying to a production server, the application automatically detects and uses the server's hostname. However, you can also explicitly configure it.

### Automatic Hostname Detection

The application automatically uses the request hostname in production. No additional configuration needed if:
- Your server is behind a reverse proxy (nginx, Apache, etc.)
- The `Host` header is properly forwarded
- You're using a standard deployment setup

### Manual Configuration (Recommended for Production)

For better control and security, set these environment variables in production:

```env
# Production Environment Variables
NODE_ENV=production

# API Base URL (your server's public URL)
API_BASE_URL=https://api.yourdomain.com
# or
API_BASE_URL=https://yourdomain.com/api

# Allowed CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com

# Database Configuration
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=y4d_dashboard
DB_PORT=3306
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# JWT Secret (use a strong secret!)
JWT_SECRET=your_very_strong_jwt_secret_here

# Server Port (Optional - defaults to 5000)
# Set this if you want a specific port, or let the system assign one
PORT=5000
```

## 🔐 CORS Configuration

The application uses dynamic CORS configuration:

### Development
- Default allowed origins: `http://localhost:3000`, `http://localhost:5173`
- Can be customized via `ALLOWED_ORIGINS` environment variable

### Production
- Uses `ALLOWED_ORIGINS` environment variable (comma-separated list)
- Automatically includes the API's own domain from `API_BASE_URL`
- **Important**: Set `ALLOWED_ORIGINS` to prevent unauthorized access

### Example CORS Configuration

```env
# Allow multiple frontend domains
ALLOWED_ORIGINS=https://y4d.org,https://www.y4d.org,https://admin.y4d.org
```

## 🔌 Port Configuration

### Do You Need to Set PORT?

**Short Answer:** It depends on your deployment setup.

#### ✅ **You MUST set PORT if:**
- Using a reverse proxy (nginx/Apache) - Set a specific port (e.g., `5000`)
- Running multiple Node.js apps on the same server
- Your hosting provider doesn't auto-assign ports

#### ❌ **You DON'T need to set PORT if:**
- Deploying to cloud platforms (Heroku, Railway, Render, etc.) - They auto-assign `PORT`
- Using Docker with port mapping
- Using a process manager that handles ports

#### Default Behavior:
- If `PORT` is not set, the app defaults to **port 5000**
- The server listens on `0.0.0.0` (all network interfaces)

### Port Configuration Examples

**With Reverse Proxy (nginx):**
```env
PORT=5000  # App runs on port 5000, nginx forwards to it
```

**Cloud Platform (Heroku/Railway):**
```env
# Don't set PORT - platform provides it automatically
# PORT will be set by the platform
```

**Direct Deployment:**
```env
PORT=5000  # Or any available port
```

## 🚀 Deployment Steps

### 1. Set Environment Variables

Create a `.env` file on your production server:

```bash
# Copy example and edit
cp .env.example .env
nano .env
```

### 2. Install Dependencies

```bash
npm install --production
```

### 3. Run Database Migrations

```bash
mysql -u your_user -p your_database < db/database.sql
```

### 4. Start the Server

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name y4d-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### Using systemd

Create `/etc/systemd/system/y4d-backend.service`:

```ini
[Unit]
Description=Y4D Backend API
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable y4d-backend
sudo systemctl start y4d-backend
```

## 🔄 Reverse Proxy Setup (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Proxy to Node.js application
    # Make sure this port matches your PORT environment variable
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase timeouts for large file uploads
    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
}
```

## 📝 Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `API_BASE_URL` | No* | `http://localhost:5000` | Public API URL (*recommended in production) |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000,...` | Comma-separated allowed CORS origins |
| `PORT` | No | `5000` | Server port |
| `DB_HOST` | Yes | - | Database host |
| `DB_USER` | Yes | - | Database user |
| `DB_PASSWORD` | Yes | - | Database password |
| `DB_NAME` | Yes | - | Database name |
| `DB_PORT` | No | `3306` | Database port |
| `DB_SSL` | No | `false` | Enable SSL for database |
| `JWT_SECRET` | Yes | - | JWT secret key |

## ✅ Verification

After deployment, verify:

1. **Health Check**: `https://api.yourdomain.com/`
2. **Database Test**: `https://api.yourdomain.com/api/test-db`
3. **CORS**: Test from your frontend domain
4. **File Uploads**: Test file upload functionality
5. **Authentication**: Test login endpoint

## 🔍 Troubleshooting

### Hostname Not Detected

If the hostname is not being detected correctly:

1. **Set `API_BASE_URL` explicitly** in your `.env` file
2. **Check reverse proxy configuration** - ensure `Host` header is forwarded
3. **Verify SSL/TLS** - ensure HTTPS is properly configured

### CORS Issues

If you encounter CORS errors:

1. **Check `ALLOWED_ORIGINS`** - ensure your frontend domain is included
2. **Verify protocol** - use `https://` in production
3. **Check browser console** - look for specific CORS error messages

### File Upload Issues

If file uploads fail:

1. **Check upload directory permissions**: `chmod 755 uploads/`
2. **Verify disk space**: `df -h`
3. **Check Nginx/client_max_body_size** if using reverse proxy

## 📚 Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Reverse Proxy Guide](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)

