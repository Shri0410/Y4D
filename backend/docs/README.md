# Y4D Backend API
Backend API for Y4D (Y4D Foundation) Dashboard built with Node.js, Express, and MySQL.

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration and connection pool
├── middleware/
│   ├── auth.js              # JWT authentication & authorization middleware
│   └── logger.js            # Request/response logging middleware
├── services/
│   └── logger.js            # Application logging service
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── banners.js           # Banner management routes
│   └── ...                  # Other route modules
├── uploads/                 # File upload storage
├── server.js                # Main application entry point
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```env
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=y4d_dashboard
   DB_PORT=3306
   DB_CONNECTION_LIMIT=20
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   ```

4. Run the database migrations:
   ```bash
   mysql -u your_user -p your_database < database.sql
   ```

5. Start the server:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## 🔧 Configuration

### Database Configuration

The database configuration is located in `config/database.js`. It supports:

- Connection pooling (configurable via `DB_CONNECTION_LIMIT`)
- SSL connections (optional, configured via `DB_SSL`)
- Environment-based configuration
- Automatic connection error handling

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | Required |
| `DB_USER` | Database user | Required |
| `DB_PASSWORD` | Database password | Required |
| `DB_NAME` | Database name | Required |
| `DB_PORT` | Database port | 3306 |
| `DB_CONNECTION_LIMIT` | Connection pool limit | 20 |
| `DB_SSL` | Enable SSL | false |
| `DB_SSL_REJECT_UNAUTHORIZED` | Reject unauthorized SSL | true |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `JWT_SECRET` | JWT secret key | Required |

## 📝 Application Logging

The application includes comprehensive logging to the database for monitoring and debugging.

### Logging Service

Located in `services/logger.js`, provides methods for logging:

- **Info**: General information logs
- **Success**: Successful operations
- **Warning**: Warning messages
- **Error**: Error logs with stack traces
- **Debug**: Debug information (development only)

### Log Types

- Authentication: `login`, `logout`, `register`, `token_verify`
- CRUD Operations: `create`, `read`, `update`, `delete`
- Status Changes: `activate`, `deactivate`, `approve`, `reject`, `suspend`
- File Operations: `upload`, `delete_file`
- System: `system_start`, `system_error`, `database_error`
- API: `api_request`, `api_response`, `api_error`

### Usage Example

```javascript
const logger = require('../services/logger');

// Log info
await logger.info('feature_name', 'Operation completed');

// Log success with metadata
await logger.success('users', 'User created successfully', {
  type: logger.LogType.CREATE,
  user_id: userId,
  resource_type: 'user',
  resource_id: newUserId
});

// Log error
await logger.error('api', 'Failed to process request', error, {
  request_method: 'POST',
  request_url: '/api/users'
});

// Log CRUD operations
await logger.logCreate('banners', 'banner', bannerId, userId, 'Banner created');
await logger.logUpdate('banners', 'banner', bannerId, userId, 'Banner updated');
await logger.logDelete('banners', 'banner', bannerId, userId, 'Banner deleted');
```

### Logging Middleware

The `middleware/logger.js` automatically logs:
- All API requests and responses
- Response times
- HTTP status codes
- Request metadata (method, URL, IP, user agent)

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (super_admin, admin, editor, viewer)
- Granular permissions system
- User status management (approved, pending, rejected, suspended)

## 📊 Database Schema

Key tables:
- `users` - User accounts
- `application_logs` - Application activity logs
- `audit_logs` - Audit trail
- `login_attempts` - Login attempt tracking
- `user_permissions` - Granular user permissions
- Content tables: `banners`, `mentors`, `management`, etc.

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify token

### Users
- `GET /api/users` - Get all users (admin)
- `POST /api/users` - Create user (admin)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/status` - Update user status
- `PATCH /api/users/:id/role` - Update user role

### Content Management
- Banners, Media, Reports, Mentors, Management, etc.

## 🚢 Deployment

### Production Checklist

1. Set `NODE_ENV=production` in `.env`
2. Use strong `JWT_SECRET`
3. Configure proper SSL settings for database
4. Set appropriate `DB_CONNECTION_LIMIT`
5. Enable proper CORS configuration
6. Set up proper file upload limits
7. Configure logging levels appropriately

### Environment Variables for Production

```env
NODE_ENV=production
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
JWT_SECRET=<strong-random-secret>
```

## 📦 Dependencies

- **express** - Web framework
- **mysql2** - MySQL driver
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **multer** - File uploads
- **cors** - CORS middleware
- **dotenv** - Environment variables

## 🐛 Troubleshooting

### Database Connection Issues

1. Verify environment variables are set correctly
2. Check database server is running
3. Verify network connectivity
4. Check SSL configuration if using SSL

### Logging Issues

- Logs are written asynchronously and won't block requests
- If database logging fails, errors are logged to console
- Check `application_logs` table for all application activities

## 📄 License

ISC

