#!/usr/bin/env node

// Simple test script to verify phone number authentication
// Run with: node test-phone-auth.js

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testClientRegistration() {
  console.log('🧪 Testing client registration with phone number...');
  
  try {
    const response = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1-555-123-4567',
        password: 'testpass123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Client registration successful!');
      console.log('Client data:', data.client);
      return data.client;
    } else {
      console.log('❌ Registration failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return null;
  }
}

async function testClientLogin(phoneNumber, password) {
  console.log('🧪 Testing client login with phone number...');
  
  try {
    // This would normally be done through NextAuth, but we'll test the database lookup
    const response = await fetch(`${baseUrl}/api/clients/search?phone=${encodeURIComponent(phoneNumber)}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.client) {
        console.log('✅ Client found by phone number!');
        console.log('Client:', data.client.firstName, data.client.lastName);
        return true;
      }
    }
    
    console.log('❌ Client not found');
    return false;
  } catch (error) {
    console.log('❌ Login test error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Phone Number Authentication Tests\n');
  
  // Test 1: Registration
  const client = await testClientRegistration();
  if (!client) {
    console.log('❌ Registration test failed, skipping login test');
    return;
  }
  
  console.log('');
  
  // Test 2: Login/Search
  await testClientLogin(client.phoneNumber, 'testpass123');
  
  console.log('\n🏁 Tests completed!');
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testClientRegistration, testClientLogin }; 