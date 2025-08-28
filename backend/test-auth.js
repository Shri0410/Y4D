// backend/test-auth.js
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Testing authentication...');
  
  try {
    // Test login with admin credentials
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', {
      token: response.data.token ? '***' : 'missing',
      user: response.data.user
    });
    
    // Test token verification
    if (response.data.token) {
      const verifyResponse = await axios.get(`${API_BASE}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ Token verification successful!');
      console.log('User data:', verifyResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    
    // Test if server is running
    try {
      const statusResponse = await axios.get(`${API_BASE}/auth/verify`);
      console.log('Server status:', statusResponse.status);
    } catch (statusError) {
      console.error('❌ Server may not be running or CORS issue');
      console.error('Make sure backend is running on port 5000');
    }
  }
}

testAuth();