# Rate Limiting Implementation

## Overview
Rate limiting has been implemented to protect the API from abuse and brute force attacks. Different rate limits are applied based on endpoint type.

## Rate Limiters

### 1. **authLimiter** - Authentication Endpoints
- **Limit:** 5 requests per 15 minutes
- **Applied to:**
  - `/api/auth/login`
  - `/api/auth/register`
  - `/api/registration/request`
- **Purpose:** Prevent brute force attacks on authentication

### 2. **uploadLimiter** - File Upload Endpoints
- **Limit:** 10 uploads per hour
- **Applied to:**
  - POST `/api/our-work/admin/:category` (create with file)
  - PUT `/api/our-work/admin/:category/:id` (update with file)
- **Purpose:** Prevent resource exhaustion from excessive file uploads

### 3. **adminLimiter** - Admin Endpoints
- **Limit:** 50 requests per 15 minutes
- **Applied to:**
  - GET `/api/our-work/admin/:category` (list items)
  - GET `/api/our-work/admin/:category/:id` (get item)
  - DELETE `/api/our-work/admin/:category/:id` (delete)
  - PATCH `/api/our-work/admin/:category/:id/status` (toggle status)
  - PATCH `/api/our-work/admin/:category/:id/order` (update order)
  - GET `/api/our-work/admin/stats/:category` (statistics)
  - GET `/api/our-work/admin/categories/stats` (all stats)
- **Purpose:** Moderate limits for admin operations

### 4. **publicLimiter** - Public Read-Only Endpoints
- **Limit:** 200 requests per 15 minutes
- **Applied to:**
  - GET `/api/our-work/published/:category` (public list)
  - GET `/api/our-work/published/:category/:id` (public detail)
- **Purpose:** Allow reasonable public access while preventing abuse

### 5. **apiLimiter** - General API Endpoints
- **Limit:** 100 requests per 15 minutes
- **Purpose:** General rate limiting for other API endpoints (can be applied as needed)

## Rate Limit Headers

When rate limiting is active, the following headers are included in responses:

- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining in current window
- `RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## Error Response

When rate limit is exceeded, the API returns:

```json
{
  "error": "Too many requests, please try again after 15 minutes",
  "retryAfter": "15 minutes"
}
```

Status Code: `429 Too Many Requests`

## Development Mode

In development mode (`NODE_ENV=development`), you can skip rate limiting by adding `?skipRateLimit=true` to the URL (only for auth endpoints).

## Configuration

Rate limits can be adjusted in `backend/middleware/rateLimiter.js`:

```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Time window
  max: 5,                    // Max requests
  // ... other options
});
```

## Best Practices

1. **Authentication endpoints** should have strict limits (5-10 requests)
2. **File uploads** should be limited to prevent resource exhaustion
3. **Public endpoints** can have more lenient limits (100-200 requests)
4. **Admin endpoints** should have moderate limits (50-100 requests)

## Monitoring

Rate limit violations are logged using `consoleLogger.warn()` with the following information:
- IP address
- Request path
- Request method
- User ID (if authenticated)

