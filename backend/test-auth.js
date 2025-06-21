// Simple test script for backend authentication
// Run with: node test-auth.js

// Load environment variables from .env file
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8787';

async function testBackend() {
  console.log('🧪 Testing Backend Authentication...\n');

  // Test health endpoint
  try {
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    if (healthRes.ok) {
      const health = await healthRes.json();
      console.log('✅ Health check passed:', health);
    } else {
      console.log('❌ Health check failed:', healthRes.status);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }

  // Test unauthenticated access (should fail)
  try {
    const meRes = await fetch(`${BACKEND_URL}/me`);
    if (meRes.status === 401) {
      console.log('✅ Unauthenticated access correctly rejected');
    } else {
      console.log('❌ Unauthenticated access should have been rejected');
    }
  } catch (error) {
    console.log('❌ Error testing unauthenticated access:', error.message);
  }

  console.log('\n📝 To test authenticated endpoints:');
  console.log('1. Start your backend: npm run dev');
  console.log('2. Open your frontend in a Farcaster-enabled browser');
  console.log('3. Check the browser console for authentication status');
  console.log('4. Use browser dev tools to inspect the Authorization header');
}

testBackend(); 