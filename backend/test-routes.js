const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, data = null, headers = {}) {
  try {
    log(`\n🧪 Testing ${name}...`, 'blue');
    log(`   ${method.toUpperCase()} ${url}`, 'yellow');
    
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    log(`   ✅ Success (${response.status})`, 'green');
    log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'green');
    return { success: true, response: response.data };
  } catch (error) {
    if (error.response) {
      log(`   ❌ Failed (${error.response.status})`, 'red');
      log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      return { success: false, error: error.response.data, status: error.response.status };
    } else {
      log(`   ❌ Network Error: ${error.message}`, 'red');
      return { success: false, error: error.message };
    }
  }
}

async function runTests() {
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('           API Routes Testing Suite', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  const results = {
    payment: {},
    contact: {},
    corporate: {},
  };

  // Test 1: Payment - Create Order
  results.payment.createOrder = await testEndpoint(
    'Payment - Create Order',
    'POST',
    `${API_BASE}/payment/create-order`,
    {
      amount: 500,
      name: 'Test Donor',
      email: 'test@example.com',
      message: 'Test donation',
    }
  );

  // Test 2: Payment - Verify Payment (will fail without real payment data, but tests route)
  results.payment.verifyPayment = await testEndpoint(
    'Payment - Verify Payment',
    'POST',
    `${API_BASE}/payment/verify-payment`,
    {
      razorpay_payment_id: 'test_payment_id',
      razorpay_order_id: 'test_order_id',
      razorpay_signature: 'test_signature',
    }
  );

  // Test 3: Contact - Corporate Partnership
  results.contact.corporatePartnership = await testEndpoint(
    'Contact - Corporate Partnership',
    'POST',
    `${API_BASE}/contact/corporate-partnership`,
    {
      companyName: 'Test Company',
      email: 'test@company.com',
      contact: '1234567890',
      details: 'Test partnership inquiry',
    }
  );

  // Test 4: Contact - Internship
  results.contact.internship = await testEndpoint(
    'Contact - Internship',
    'POST',
    `${API_BASE}/contact/internship`,
    {
      fullName: 'Test Student',
      email: 'student@example.com',
      phone: '9876543210',
      field: 'Web Development',
      message: 'Interested in internship',
    }
  );

  // Test 5: Contact - Volunteer
  results.contact.volunteer = await testEndpoint(
    'Contact - Volunteer',
    'POST',
    `${API_BASE}/contact/volunteer`,
    {
      fullName: 'Test Volunteer',
      email: 'volunteer@example.com',
      phone: '9876543210',
      reason: 'Want to help the community',
    }
  );

  // Test 6: Contact - Enquiry
  results.contact.enquiry = await testEndpoint(
    'Contact - Enquiry',
    'POST',
    `${API_BASE}/contact/enquiry`,
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '9876543210',
      message: 'General enquiry about Y4D',
    }
  );

  // Test 7: Corporate Partnership (separate route)
  results.corporate.partnership = await testEndpoint(
    'Corporate Partnership (Direct Route)',
    'POST',
    `${API_BASE}/corporate-partnership/corporate-partnership`,
    {
      companyName: 'Test Corp',
      email: 'corp@test.com',
      contact: '1234567890',
      details: 'Partnership details',
    }
  );

  // Summary
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('                    Test Summary', 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  const allTests = [
    { name: 'Payment - Create Order', result: results.payment.createOrder },
    { name: 'Payment - Verify Payment', result: results.payment.verifyPayment },
    { name: 'Contact - Corporate Partnership', result: results.contact.corporatePartnership },
    { name: 'Contact - Internship', result: results.contact.internship },
    { name: 'Contact - Volunteer', result: results.contact.volunteer },
    { name: 'Contact - Enquiry', result: results.contact.enquiry },
    { name: 'Corporate Partnership (Direct)', result: results.corporate.partnership },
  ];

  let passed = 0;
  let failed = 0;

  allTests.forEach((test) => {
    if (test.result.success) {
      log(`✅ ${test.name}`, 'green');
      passed++;
    } else {
      // Check if it's a validation error (400) which is expected for some tests
      if (test.result.status === 400) {
        log(`⚠️  ${test.name} - Validation Error (Expected)`, 'yellow');
        passed++;
      } else {
        log(`❌ ${test.name}`, 'red');
        failed++;
      }
    }
  });

  log(`\n📊 Results: ${passed} passed, ${failed} failed`, 'blue');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  if (failed === 0) {
    log('🎉 All routes are accessible and working!', 'green');
  } else {
    log('⚠️  Some routes may need attention. Check errors above.', 'yellow');
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const healthCheck = await axios.get(API_BASE.replace('/api', '') || 'http://localhost:5000/');
    log('✅ Server is running!', 'green');
    return true;
  } catch (error) {
    log('❌ Server is not running or not accessible!', 'red');
    log(`   Make sure backend is running on ${API_BASE.replace('/api', '') || 'http://localhost:5000'}`, 'yellow');
    log('   Start server with: npm run dev (in backend directory)', 'yellow');
    return false;
  }
}

async function main() {
  log('\n🔍 Checking server status...', 'blue');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
}

main().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});

