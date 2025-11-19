# Build Folder Guide

## What is the Build Folder?

The build folder (`dist/`) is created when you run `npm run build`. It contains a **deployment-ready** version of your application with only the necessary files.

## Location

```
backend/
├── dist/          ← Build folder (created by npm run build)
│   ├── server.js
│   ├── package.json
│   ├── config/
│   ├── routes/
│   ├── middleware/
│   └── ...
└── ...
```

## What's Included

### ✅ Included Files
- All source code (`.js` files)
- Configuration files
- Database migrations (`db/`)
- Documentation (`docs/`)
- Package files (`package.json`, `package-lock.json`)
- Upload directory structure (empty folders)

### ❌ NOT Included
- `node_modules/` - Install on server with `npm install --production`
- `.env` - Create on server with your environment variables
- Upload files - Will be created at runtime
- Development files (test files, scripts, etc.)

## Creating the Build Folder

```bash
npm run build
```

This will:
1. Validate your setup
2. Create `dist/` folder
3. Copy all necessary files
4. Create upload directory structure
5. Generate deployment info

## Using the Build Folder

### Option 1: Upload Build Folder

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder to server:**
   ```bash
   # Using SCP
   scp -r dist/ user@server:/path/to/deployment/
   
   # Using FTP/SFTP
   # Upload the entire dist/ folder
   ```

3. **On server:**
   ```bash
   cd /path/to/deployment/dist
   npm install --production
   cp .env.example .env  # Create .env file
   nano .env              # Edit with your values
   npm start
   ```

### Option 2: Deploy from Source (Recommended)

If you have Git on your server:

1. **Clone repository on server:**
   ```bash
   git clone your-repo-url
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install --production
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   nano .env
   ```

4. **Start server:**
   ```bash
   npm start
   ```

## Build Folder Structure

```
dist/
├── server.js              # Main entry point
├── package.json          # Dependencies
├── package-lock.json     # Locked versions
├── README.md             # Build instructions
├── config/               # Configuration files
│   ├── database.js
│   ├── swagger.js
│   └── swaggerDefinitions.js
├── middleware/           # Express middleware
│   ├── auth.js
│   └── logger.js
├── routes/               # API routes
│   ├── index.js
│   ├── auth.js
│   └── ...
├── services/             # Business logic
│   └── logger.js
├── utils/                # Utilities
│   ├── logger.js
│   └── validateEnv.js
├── db/                   # Database files
│   ├── database.sql
│   └── migrations/
├── docs/                 # Documentation
│   └── ...
└── uploads/              # Upload directories (empty)
    ├── mentors/
    ├── banners/
    └── ...
```

## When to Use Build Folder

### ✅ Use Build Folder When:
- Deploying to a server without Git
- Creating a deployment package
- Using CI/CD pipelines
- Need a clean, minimal deployment

### ❌ Don't Use Build Folder When:
- You have Git on the server (deploy from source)
- Using Docker (use Dockerfile instead)
- Using cloud platforms (they handle deployment)

## Cleaning Build Folder

To remove the build folder:

```bash
# Manual removal
rm -rf dist/

# Or rebuild (automatically removes old build)
npm run build
```

## Build Folder Size

The build folder is typically **small** (few MB) because:
- No `node_modules/` (install on server)
- No upload files (created at runtime)
- Only source code and config files

## Troubleshooting

### Build folder not created
- Check for errors in build output
- Ensure all required files exist
- Check file permissions

### Missing files in build folder
- Check if files exist in source
- Review build script output
- Verify file paths

### Upload directories empty
- This is normal - they're created empty
- Files will be uploaded at runtime
- `.gitkeep` files preserve structure

## Best Practices

1. **Always build before deployment**
   ```bash
   npm run build
   ```

2. **Test build folder locally**
   ```bash
   cd dist
   npm install --production
   npm start
   ```

3. **Don't commit build folder**
   - Already in `.gitignore`
   - Rebuild on each deployment

4. **Keep .env separate**
   - Never include in build
   - Create on server

## Summary

- **Build folder**: `dist/` (created by `npm run build`)
- **Purpose**: Deployment-ready package
- **Size**: Small (no node_modules)
- **Usage**: Upload to server, install dependencies, start

The build folder makes deployment easier by providing a clean, ready-to-deploy package!

