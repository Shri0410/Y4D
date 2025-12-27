# Login 500 Error Debugging Guide

## Problem
Getting 500 Internal Server Error when attempting to login with message: "Login failed"

## Common Causes & Solutions

### 1. Database Connection Issue
**Symptoms:**
- Error in server logs: `ECONNREFUSED`, `ER_ACCESS_DENIED_ERROR`
- Database connection pool errors

**Solution:**
```bash
# Check database is running
# Verify .env file has correct database credentials:
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=y4d_dashboard
```

### 2. Missing Database Tables
**Symptoms:**
- Error: `ER_NO_SUCH_TABLE`
- Missing `application_logs` or `login_attempts` table

**Solution:**
```bash
# Run database migrations
# Check if these tables exist:
# - users
# - login_attempts
# - application_logs
```

### 3. Logger Service Failing
**Symptoms:**
- Error in `createLog` function
- Database insert fails for `application_logs`

**Solution:**
- Logger errors are now non-blocking (won't break login)
- Check server logs for specific database errors

### 4. JWT_SECRET Missing
**Symptoms:**
- JWT token creation fails
- Error in jwt.sign()

**Solution:**
```bash
# Add to .env file:
JWT_SECRET=your_strong_secret_key_at_least_32_characters_long
```

### 5. Database Query Error
**Symptoms:**
- SQL syntax errors
- Column mismatch errors

**Solution:**
- Check database schema matches expected structure
- Verify all required columns exist in `users` table

## Debugging Steps

### Step 1: Check Server Logs
Look for detailed error messages in your server console:
```bash
# Check backend terminal/console for:
❌ Login error: { message, stack, code }
```

### Step 2: Test Database Connection
```bash
# In backend directory, test connection:
node -e "require('./config/database').query('SELECT 1').then(() => console.log('✅ DB OK')).catch(e => console.error('❌ DB Error:', e))"
```

### Step 3: Verify Environment Variables
```bash
# Check .env file exists and has:
- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- JWT_SECRET
```

### Step 4: Check Database Tables
```sql
-- Run in MySQL:
SHOW TABLES;
-- Should see: users, login_attempts, application_logs

-- Check users table structure:
DESCRIBE users;
-- Should have: id, username, email, password, role, status
```

### Step 5: Test Login Directly
```bash
# Use curl or Postman to test:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## Recent Fixes Applied

1. ✅ Made logger calls non-blocking (won't break login if logging fails)
2. ✅ Added better error handling for database operations
3. ✅ Improved error messages with specific error codes
4. ✅ Added try-catch around all database operations in login flow

## Next Steps

1. Check server console for the actual error message
2. Verify database connection is working
3. Ensure all required tables exist
4. Check environment variables are set correctly

## Quick Fix Checklist

- [ ] Database is running and accessible
- [ ] `.env` file has all required variables
- [ ] `users` table exists with correct structure
- [ ] `login_attempts` table exists
- [ ] `application_logs` table exists (optional, won't break login if missing)
- [ ] `JWT_SECRET` is set in `.env`
- [ ] Server logs show specific error (not just "Login failed")

