# Swagger API Documentation Setup

## ✅ Implementation Complete

Swagger/OpenAPI documentation has been successfully integrated into the Y4D Backend API.

## 📍 Access Points

- **Swagger UI**: `http://localhost:5000/api-docs`
- **Swagger JSON**: `http://localhost:5000/api-docs.json`

## 📦 Dependencies Added

- `swagger-jsdoc` (^6.2.8) - JSDoc to OpenAPI specification converter
- `swagger-ui-express` (^5.0.0) - Swagger UI for Express

## 🏗️ Structure

### Configuration File
- `config/swagger.js` - Main Swagger configuration with:
  - API information and metadata
  - Server URLs (development/production)
  - Security schemes (JWT Bearer Auth)
  - Reusable schemas (User, LoginRequest, Error, etc.)
  - Common response definitions
  - API tags/categories

### Annotated Routes
Routes with Swagger documentation:
- ✅ `server.js` - Health check and database test endpoints
- ✅ `routes/auth.js` - All authentication endpoints (login, register, verify)
- ✅ `routes/users.js` - User management endpoints (get all, profile, create)

## 📝 Adding Documentation to New Routes

### Basic Endpoint Documentation

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
 *     tags: [YourTag]
 *     security:
 *       - bearerAuth: []  # If authentication required
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 */
router.get('/your-endpoint', async (req, res) => {
  // Your code
});
```

### Using Request Body

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   post:
 *     summary: Create something
 *     tags: [YourTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/YourSchema'
 *     responses:
 *       201:
 *         description: Created successfully
 */
```

### Using Reusable Schemas

Reference schemas defined in `config/swagger.js`:

```javascript
schema:
  $ref: '#/components/schemas/User'
```

Available schemas:
- `User`
- `LoginRequest`
- `LoginResponse`
- `RegisterRequest`
- `Error`
- `Success`
- `Banner`

### Using Common Responses

Reference common responses:

```javascript
responses:
  401:
    $ref: '#/components/responses/UnauthorizedError'
  403:
    $ref: '#/components/responses/ForbiddenError'
  404:
    $ref: '#/components/responses/NotFoundError'
```

## 🔐 Authentication in Swagger UI

1. Click the **"Authorize"** button at the top of Swagger UI
2. Enter your JWT token (obtained from `/api/auth/login`)
3. Format: `Bearer <your-token>` or just `<your-token>`
4. Click **"Authorize"** and then **"Close"**
5. All protected endpoints will now use this token

## 🎨 Customization

### Update API Info
Edit `config/swagger.js`:
```javascript
info: {
  title: 'Your API Title',
  version: '1.0.0',
  description: 'Your description'
}
```

### Add New Schema
In `config/swagger.js`, add to `components.schemas`:
```javascript
YourSchema: {
  type: 'object',
  properties: {
    field1: { type: 'string' },
    field2: { type: 'integer' }
  }
}
```

### Add New Tag
In `config/swagger.js`, add to `tags` array:
```javascript
{
  name: 'YourTag',
  description: 'Description of your tag'
}
```

## 📋 Next Steps

To document remaining routes, add Swagger annotations following the same pattern:

1. **Banners** (`routes/banners.js`)
2. **Media** (`routes/media.js`)
3. **Our Work** (`routes/ourwork.js`)
4. **Mentors** (`routes/mentors.js`)
5. **Management** (`routes/management.js`)
6. **Board Trustees** (`routes/boardTrustees.js`)
7. **Careers** (`routes/careers.js`)
8. **Reports** (`routes/reports.js`)
9. **Accreditations** (`routes/accreditations.js`)
10. **Permissions** (`routes/userPermissions.js`)

## 🚀 Production Considerations

1. **Disable in Production** (Optional):
   ```javascript
   if (process.env.NODE_ENV !== 'production') {
     app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
   }
   ```

2. **Update Server URL**:
   Set `API_BASE_URL` environment variable for production server URL

3. **Custom Styling**:
   Already configured to hide Swagger topbar. Customize in `server.js`:
   ```javascript
   customCss: '.swagger-ui .topbar { display: none }'
   ```

## 📚 Resources

- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express Documentation](https://github.com/scottie1984/swagger-ui-express)

## ✨ Features

- ✅ Interactive API documentation
- ✅ Try-it-out functionality
- ✅ JWT authentication support
- ✅ Reusable schemas and responses
- ✅ Organized by tags
- ✅ Request/response examples
- ✅ Error response documentation

