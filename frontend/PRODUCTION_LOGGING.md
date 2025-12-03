# Production Logging Guide

## How Vite Handles Environment Modes

Vite uses `import.meta.env.MODE` to determine the build mode, **not** `NODE_ENV`.

### Development Mode
- **Command**: `npm run dev`
- **Mode**: Always `development`
- **Behavior**: All logs are shown (logger.log, logger.warn, logger.info, logger.debug)
- **Note**: Setting `NODE_ENV=production` while running `npm run dev` will NOT suppress logs

### Production Mode
- **Command**: `npm run build` (then `npm run preview` to test)
- **Mode**: `production`
- **Behavior**: Only errors are shown (logger.error), all other logs are suppressed

## Testing Production Mode

To test that logs are suppressed in production:

```bash
# 1. Build for production
npm run build

# 2. Preview the production build
npm run preview
```

When you open the preview URL, you should see:
- ✅ Only `logger.error()` messages (if any errors occur)
- ❌ No `logger.log()`, `logger.warn()`, `logger.info()`, or `logger.debug()` messages

## Current Behavior

- **Development** (`npm run dev`): All logs shown
- **Production** (`npm run build`): Only errors shown

## Environment Variables

Vite environment variables:
- `import.meta.env.MODE` - Current mode ('development' or 'production')
- `import.meta.env.DEV` - `true` in development
- `import.meta.env.PROD` - `true` in production builds
- `import.meta.env.VITE_*` - Your custom environment variables

## Important Notes

1. **NODE_ENV doesn't control Vite's mode** - Vite uses its own MODE system
2. **npm run dev always runs in development** - Logs will always show
3. **To test production logging** - You must build and preview the production build
4. **Production builds are optimized** - Code is minified and logs are removed at build time

