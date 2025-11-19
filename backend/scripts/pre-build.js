/**
 * Pre-build script for deployment preparation
 * Runs validation and preparation steps before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Running pre-build checks...\n');

let hasErrors = false;
const errors = [];
const warnings = [];

// 1. Check if .env file exists
console.log('📝 Checking environment configuration...');
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  warnings.push('⚠️  .env file not found. Make sure to create it before deployment.');
  console.log('   ⚠️  .env file not found');
} else {
  console.log('   ✅ .env file exists');
  
  // Check for required variables
  require('dotenv').config({ path: envPath });
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    errors.push(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.log(`   ❌ Missing required variables: ${missingVars.join(', ')}`);
    hasErrors = true;
  } else {
    console.log('   ✅ All required environment variables are set');
  }
}

// 2. Check if node_modules exists
console.log('\n📦 Checking dependencies...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  errors.push('node_modules not found. Run "npm install" first.');
  console.log('   ❌ node_modules not found');
  hasErrors = true;
} else {
  console.log('   ✅ node_modules exists');
}

// 3. Check if upload directories exist (will be created on startup, but check anyway)
console.log('\n📁 Checking upload directories...');
const uploadsDir = path.join(__dirname, '..', 'uploads');
const requiredDirs = [
  'mentors',
  'management',
  'board-trustees',
  'accreditations',
  'reports',
  'banners',
  'media',
  'our-work'
];

if (!fs.existsSync(uploadsDir)) {
  warnings.push('uploads directory not found. Will be created on startup.');
  console.log('   ⚠️  uploads directory not found (will be created on startup)');
} else {
  console.log('   ✅ uploads directory exists');
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
      warnings.push(`Upload subdirectory missing: ${dir} (will be created on startup)`);
      console.log(`   ⚠️  ${dir} directory missing (will be created on startup)`);
    } else {
      console.log(`   ✅ ${dir} directory exists`);
    }
  });
}

// 4. Check if database.sql exists
console.log('\n🗄️  Checking database files...');
const dbSqlPath = path.join(__dirname, '..', 'db', 'database.sql');
if (!fs.existsSync(dbSqlPath)) {
  warnings.push('database.sql not found. Make sure database is set up.');
  console.log('   ⚠️  database.sql not found');
} else {
  console.log('   ✅ database.sql exists');
}

// 5. Validate server.js exists
console.log('\n🚀 Checking server files...');
const serverPath = path.join(__dirname, '..', 'server.js');
if (!fs.existsSync(serverPath)) {
  errors.push('server.js not found!');
  console.log('   ❌ server.js not found');
  hasErrors = true;
} else {
  console.log('   ✅ server.js exists');
}

// 6. Check production environment
console.log('\n🌍 Checking environment...');
if (process.env.NODE_ENV === 'production') {
  console.log('   ✅ Production environment detected');
  
  if (!process.env.API_BASE_URL) {
    warnings.push('API_BASE_URL not set in production. Will use request hostname.');
    console.log('   ⚠️  API_BASE_URL not set (will use request hostname)');
  } else {
    console.log(`   ✅ API_BASE_URL: ${process.env.API_BASE_URL}`);
  }
  
  if (!process.env.ALLOWED_ORIGINS) {
    warnings.push('ALLOWED_ORIGINS not set in production. Using defaults.');
    console.log('   ⚠️  ALLOWED_ORIGINS not set (using defaults)');
  } else {
    console.log(`   ✅ ALLOWED_ORIGINS configured`);
  }
} else {
  console.log('   ℹ️  Development environment');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Build Summary');
console.log('='.repeat(50));

if (warnings.length > 0) {
  console.log(`\n⚠️  Warnings (${warnings.length}):`);
  warnings.forEach(warning => console.log(`   - ${warning}`));
}

if (errors.length > 0) {
  console.log(`\n❌ Errors (${errors.length}):`);
  errors.forEach(error => console.log(`   - ${error}`));
  console.log('\n❌ Build failed! Please fix the errors above.');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Ensure .env file is configured correctly');
  console.log('   2. Run database migrations if needed');
  console.log('   3. Start server with: npm start');
  console.log('\n✅ Build completed successfully!');
  process.exit(0);
}

