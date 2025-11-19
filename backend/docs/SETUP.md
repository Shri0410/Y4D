# Quick Setup Guide

## 🚀 Getting Started

### Step 1: Create .env File

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=y4d_dashboard
DB_PORT=3306

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

### Step 3: Start the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

## ✅ Verification

Once started, you should see:
- ✅ Environment variables validated successfully
- 🚀 Server running on port 5000
- 📚 Swagger UI available at http://localhost:5000/api-docs

## 🔧 Troubleshooting

### Missing Environment Variables

If you see an error about missing environment variables:

1. **Check if .env file exists** in the `backend` directory
2. **Verify all required variables are set:**
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`

### Database Connection Issues

1. **Verify MySQL is running**
2. **Check database credentials** in `.env`
3. **Ensure database exists:** `y4d_dashboard`
4. **Run database migrations:** `mysql -u user -p database < database.sql`

### Port Already in Use

If port 5000 is already in use:
- Change `PORT=5000` to another port in `.env`
- Or stop the process using port 5000

## 📝 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_USER` | Database username | `root` |
| `DB_PASSWORD` | Database password | `your_password` |
| `DB_NAME` | Database name | `y4d_dashboard` |
| `JWT_SECRET` | JWT secret key | `your_secret_key_here` |

## 🔒 Security Notes

- **Never commit `.env` file** to version control
- **Use strong JWT_SECRET** in production (32+ characters)
- **Change default values** before deploying
- **Enable SSL** for database in production (`DB_SSL=true`)

