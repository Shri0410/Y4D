# Banner Delete 500 Error - Server Debugging Guide

## Problem
Banner deletion works on local but returns 500 error on server: `DELETE https://y4d.ngo/dev/api/banners/47 500 (Internal Server Error)`

## Common Causes & Solutions

### 1. File Path Issue (Most Common)
**Problem:** `__dirname` points to different location on server (e.g., `dist/` folder)

**Fixed:** Now uses `process.cwd()` and tries multiple path locations

**Check:**
- Server logs will show which paths were searched
- Look for: `🔍 Searching for media file:` in logs

### 2. File System Permissions
**Problem:** Server process doesn't have write/delete permissions on `uploads/banners/` folder

**Solution:**
```bash
# On server, check permissions:
ls -la uploads/banners/

# Fix permissions (if needed):
chmod -R 755 uploads/banners/
chown -R your-user:your-group uploads/banners/
```

### 3. Directory Structure Difference
**Problem:** Server has different directory structure than local

**Solution:**
- Check server logs for `currentWorkingDirectory` and `__dirname`
- Verify `uploads/banners/` exists in correct location
- Code now tries multiple paths automatically

### 4. Database Connection Issue
**Problem:** Database query fails on server

**Check:**
- Database credentials in `.env` on server
- Database connection is working
- `banners` table exists

### 5. Missing File (Non-Critical)
**Problem:** File already deleted but record still in database

**Status:** ✅ Fixed - Code now continues with DB delete even if file not found

## Debugging Steps

### Step 1: Check Server Logs
Look for these log messages in your server console:
```
🗑️ Deleting banner with ID: 47
🔍 Searching for media file: { filename, paths }
🗑️ Deleted media file: ... OR
⚠️ Media file not found in any expected location: ...
✅ Banner deleted successfully ID: 47
```

### Step 2: Verify File Exists
```bash
# SSH into server and check:
ls -la uploads/banners/
# Look for the file mentioned in the error
```

### Step 3: Check Permissions
```bash
# On server:
ls -ld uploads/banners/
# Should show write permissions for your server user
```

### Step 4: Test Database Query
```bash
# In backend directory on server:
node -e "const db = require('./config/database'); db.query('SELECT id, media FROM banners WHERE id = 47').then(([r]) => console.log('Banner:', r[0])).catch(e => console.error('Error:', e.message))"
```

### Step 5: Check Directory Structure
```bash
# On server, verify structure:
pwd  # Should show current working directory
ls -la  # Should see uploads/ folder
ls -la uploads/banners/  # Should see banner files
```

## Recent Fixes Applied

1. ✅ **Fixed file path resolution** - Uses `process.cwd()` instead of `__dirname`
2. ✅ **Multiple path fallbacks** - Tries 4 different possible paths
3. ✅ **Non-blocking file deletion** - DB delete continues even if file delete fails
4. ✅ **Better error logging** - Shows exact paths searched and errors
5. ✅ **Standardized error responses** - Uses response utility

## Expected Behavior After Fix

- Code tries multiple paths to find the file
- If file not found, deletion continues (logs warning)
- Database record is deleted regardless of file deletion status
- Detailed logs help identify path issues

## Server-Specific Checks

### Check Current Working Directory
The code logs `currentWorkingDirectory` - verify it's correct:
```bash
# On server, when Node.js runs, what is process.cwd()?
# Should be the backend directory or project root
```

### Verify Uploads Directory
```bash
# Ensure uploads directory exists and is accessible:
mkdir -p uploads/banners
chmod 755 uploads/banners
```

### Check File Ownership
```bash
# Files should be owned by the user running Node.js:
ps aux | grep node  # Find Node.js process user
ls -la uploads/banners/  # Check file ownership
```

## Quick Fix Commands (Server)

```bash
# 1. Ensure directory exists
mkdir -p uploads/banners

# 2. Fix permissions
chmod -R 755 uploads/
chown -R $(whoami):$(whoami) uploads/

# 3. Verify structure
ls -la uploads/banners/

# 4. Restart server
pm2 restart your-app-name
# OR
systemctl restart your-service
```

## Next Steps

1. **Check server logs** for the detailed error message
2. **Verify file permissions** on `uploads/banners/` directory
3. **Check directory structure** matches expected paths
4. **Test manually** - try deleting a file via SSH to verify permissions

The code is now more robust and will work even if file paths differ between local and server environments.

