# Build and Deployment Guide

## Building for Deployment

### Quick Start

```bash
npm run build
```

This command prepares your application for production deployment by:
- ✅ Validating environment variables
- ✅ Checking dependencies
- ✅ Preparing upload directories
- ✅ Validating critical files
- ✅ Checking production configuration
- ✅ Creating deployment info

## What the Build Script Does

### 1. Environment Validation
- Checks if `.env` file exists
- Validates all required environment variables are set
- Warns about missing production configurations

### 2. Dependency Check
- Verifies `node_modules` exists
- Checks for `package-lock.json`

### 3. Directory Preparation
- Creates `uploads/` directory if missing
- Creates all required subdirectories:
  - `mentors/`
  - `management/`
  - `board-trustees/`
  - `accreditations/`
  - `reports/`
  - `banners/`
  - `media/`
  - `our-work/`

### 4. File Validation
- Verifies critical files exist:
  - `server.js`
  - `package.json`
  - `config/database.js`
  - `routes/index.js`
  - `utils/validateEnv.js`

### 5. Production Checks
- Validates JWT_SECRET strength (minimum 32 characters)
- Checks for default/weak secrets
- Warns about SSL configuration
- Validates API_BASE_URL and ALLOWED_ORIGINS

### 6. Deployment Info
- Creates `.deployment-info.json` with build metadata

## Build Output

### Success Example
```
🚀 Building application for deployment...

📦 Validating environment...
   ✅ Validating environment completed

📦 Checking dependencies...
   ✅ Checking dependencies completed

...

✅ Build completed successfully!

📋 Deployment Checklist:
   ✅ Environment variables configured
   ✅ Dependencies installed
   ✅ Upload directories prepared
   ✅ Critical files validated

🚀 Ready for deployment!
```

### Error Example
```
❌ Errors (2):
   ❌ Missing required environment variables: JWT_SECRET, DB_PASSWORD
   ❌ node_modules not found. Run "npm install" first.

❌ Build failed! Please fix the errors above before deploying.
```

## Pre-Deployment Checklist

Before running `npm run build`, ensure:

- [ ] `.env` file exists with all required variables
- [ ] `npm install` has been run
- [ ] Database is configured
- [ ] JWT_SECRET is set and strong (32+ characters)
- [ ] `API_BASE_URL` is set for production
- [ ] `ALLOWED_ORIGINS` is configured for production

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Fix Any Errors
If build fails, fix the errors shown and run again.

### 3. Upload to Server
Upload all files to your server (excluding `node_modules` if you'll run `npm install` on server).

### 4. Install Dependencies on Server
```bash
npm install --production
```

### 5. Run Database Migrations
```bash
mysql -u your_user -p your_database < db/database.sql
```

### 6. Start the Server
```bash
npm start
# or with PM2
pm2 start server.js --name y4d-backend
```

## Build Script Location

The build script is located at:
```
backend/scripts/build.js
```

## Customization

You can modify `scripts/build.js` to add custom build steps:
- Code minification
- Asset optimization
- Additional validation
- File copying/preparation

## Troubleshooting

### Build Fails with "Missing environment variables"
- Create `.env` file
- Set all required variables (see `ENV_VALIDATION.md`)

### Build Fails with "node_modules not found"
- Run `npm install` first

### Build Shows Warnings
- Warnings don't prevent deployment
- Review and fix warnings for best practices
- Critical issues will show as errors

## Notes

- **Node.js backends don't need compilation** - This build script is for validation and preparation
- **No transpilation needed** - Node.js runs JavaScript directly
- **Build is optional** - You can deploy without running build, but it's recommended for validation

## Related Documentation

- `DEPLOYMENT.md` - Full deployment guide
- `ENV_VALIDATION.md` - Environment variable details
- `Y4D_NGO_DEPLOYMENT.md` - Specific deployment for y4d.ngo

