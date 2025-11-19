/**
 * Build script for deployment
 * Prepares the application for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building application for deployment...\n');

let hasErrors = false;
const errors = [];
const warnings = [];
const steps = [];

// Helper function to run steps
function runStep(name, fn) {
  try {
    console.log(`📦 ${name}...`);
    const result = fn();
    steps.push({ name, status: 'success' });
    console.log(`   ✅ ${name} completed\n`);
    return result;
  } catch (error) {
    steps.push({ name, status: 'error', error: error.message });
    errors.push(`${name}: ${error.message}`);
    console.log(`   ❌ ${name} failed: ${error.message}\n`);
    hasErrors = true;
    return null;
  }
}

// Step 1: Validate environment
runStep('Validating environment', () => {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found. Create it before deployment.');
  }

  require('dotenv').config({ path: envPath });
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Check production settings
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.API_BASE_URL) {
      warnings.push('API_BASE_URL not set in production. Will use request hostname.');
    }
    if (!process.env.ALLOWED_ORIGINS) {
      warnings.push('ALLOWED_ORIGINS not set in production. Using defaults.');
    }
  }
});

// Step 2: Check dependencies
runStep('Checking dependencies', () => {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    throw new Error('node_modules not found. Run "npm install" first.');
  }

  // Check if package-lock.json exists
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  if (!fs.existsSync(packageLockPath)) {
    warnings.push('package-lock.json not found. Consider running "npm install" to lock dependencies.');
  }
});

// Step 3: Ensure upload directories exist
runStep('Preparing upload directories', () => {
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
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('   📁 Created uploads directory');
  }

  requiredDirs.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`   📁 Created ${dir} directory`);
    }
  });
});

// Step 4: Validate critical files
runStep('Validating critical files', () => {
  const criticalFiles = [
    'server.js',
    'package.json',
    'config/database.js',
    'routes/index.js',
    'utils/validateEnv.js'
  ];

  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Critical file missing: ${file}`);
    }
  });
});

// Step 5: Check database files
runStep('Checking database files', () => {
  const dbSqlPath = path.join(__dirname, '..', 'db', 'database.sql');
  if (!fs.existsSync(dbSqlPath)) {
    warnings.push('database.sql not found. Make sure database is set up before deployment.');
  } else {
    console.log('   ✅ database.sql found');
  }
});

// Step 6: Create .gitignore if missing
runStep('Checking .gitignore', () => {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    warnings.push('.gitignore not found. Consider adding one to exclude sensitive files.');
  } else {
    console.log('   ✅ .gitignore exists');
  }
});

// Step 7: Validate production readiness
if (process.env.NODE_ENV === 'production') {
  runStep('Validating production configuration', () => {
    // Check JWT_SECRET strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET is less than 32 characters. Consider using a stronger secret.');
    }

    // Check if using default values
    const defaultJWT = ['your_super_secret_jwt_key_change_in_production', 'your_jwt_secret_here'];
    if (defaultJWT.includes(process.env.JWT_SECRET)) {
      throw new Error('JWT_SECRET is using default value. Change it before deployment!');
    }

    // Check database SSL
    if (process.env.DB_SSL !== 'true') {
      warnings.push('Database SSL is disabled. Consider enabling it for production.');
    }

    console.log('   ✅ Production configuration validated');
  });
}

// Step 8: Create build folder for deployment
runStep('Creating build folder', () => {
  const buildDir = path.join(__dirname, '..', 'dist');
  const sourceDir = path.join(__dirname, '..');

  // Remove existing build folder
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
    console.log('   🗑️  Removed existing build folder');
  }

  // Create build folder
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('   📁 Created dist/ folder');

  // Files and folders to copy
  const filesToCopy = [
    'server.js',
    'package.json',
    'package-lock.json',
    '.gitignore'
  ];

  const foldersToCopy = [
    'config',
    'middleware',
    'routes',
    'services',
    'utils',
    'db',
    'docs'
  ];

  // Copy files
  filesToCopy.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(buildDir, file);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`   📄 Copied ${file}`);
    }
  });

  // Copy folders recursively
  function copyFolder(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyFolder(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  foldersToCopy.forEach(folder => {
    const sourcePath = path.join(sourceDir, folder);
    const destPath = path.join(buildDir, folder);
    if (fs.existsSync(sourcePath)) {
      copyFolder(sourcePath, destPath);
      console.log(`   📁 Copied ${folder}/`);
    }
  });

  // Create uploads directory structure (empty)
  const uploadsDir = path.join(buildDir, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  const uploadSubdirs = ['mentors', 'management', 'board-trustees', 'accreditations', 'reports', 'banners', 'media', 'our-work'];
  uploadSubdirs.forEach(dir => {
    fs.mkdirSync(path.join(uploadsDir, dir), { recursive: true });
  });
  console.log('   📁 Created uploads/ structure');

  // Create .gitkeep in uploads to preserve structure
  fs.writeFileSync(path.join(uploadsDir, '.gitkeep'), '');
  uploadSubdirs.forEach(dir => {
    fs.writeFileSync(path.join(uploadsDir, dir, '.gitkeep'), '');
  });

  // Create README in build folder
  const buildReadme = `# Build Output

This folder contains the deployment-ready application.

## Contents

- All source code files
- Configuration files
- Database migrations
- Documentation
- Package files

## Deployment

1. Upload this entire folder to your server
2. Run \`npm install --production\` on the server
3. Create \`.env\` file with your environment variables
4. Run database migrations
5. Start server: \`npm start\`

## Note

- \`node_modules\` is NOT included (install on server)
- \`.env\` is NOT included (create on server)
- \`uploads/\` folders are empty (will be populated at runtime)
`;
  fs.writeFileSync(path.join(buildDir, 'README.md'), buildReadme);
  console.log('   📄 Created README.md');

  console.log(`   ✅ Build folder created at: ${buildDir}`);
});

// Step 9: Create deployment info file
runStep('Creating deployment info', () => {
  const deploymentInfo = {
    buildDate: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    apiBaseUrl: process.env.API_BASE_URL || 'Not set (will use request hostname)',
    hasDatabase: !!process.env.DB_HOST,
    hasJWTSecret: !!process.env.JWT_SECRET,
    port: process.env.PORT || '5000 (default)',
    buildFolder: 'dist/'
  };

  const infoPath = path.join(__dirname, '..', '.deployment-info.json');
  fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('   ✅ Deployment info created');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Build Summary');
console.log('='.repeat(60));

console.log(`\n✅ Completed Steps (${steps.filter(s => s.status === 'success').length}):`);
steps.filter(s => s.status === 'success').forEach(step => {
  console.log(`   ✅ ${step.name}`);
});

if (warnings.length > 0) {
  console.log(`\n⚠️  Warnings (${warnings.length}):`);
  warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
}

if (errors.length > 0) {
  console.log(`\n❌ Errors (${errors.length}):`);
  errors.forEach(error => console.log(`   ❌ ${error}`));
  console.log('\n❌ Build failed! Please fix the errors above before deploying.');
  process.exit(1);
} else {
  console.log('\n✅ Build completed successfully!');
  console.log('\n📋 Deployment Checklist:');
  console.log('   ✅ Environment variables configured');
  console.log('   ✅ Dependencies installed');
  console.log('   ✅ Upload directories prepared');
  console.log('   ✅ Critical files validated');
  console.log('\n🚀 Ready for deployment!');
  console.log('\n📁 Build folder location: dist/');
  console.log('\n📝 Next steps:');
  console.log('   1. Upload the dist/ folder to your server');
  console.log('   2. On server, run: npm install --production');
  console.log('   3. Create .env file with your environment variables');
  console.log('   4. Run database migrations: mysql -u user -p database < db/database.sql');
  console.log('   5. Start server: npm start');
  console.log('   6. Verify: curl https://your-domain.com/');
  console.log('\n');
  process.exit(0);
}

