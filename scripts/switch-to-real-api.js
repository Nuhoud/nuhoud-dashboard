#!/usr/bin/env node

/**
 * Script to switch from mock authentication to real API integration
 * Run this script when you're ready to connect to the real backend
 */

const fs = require('fs');
const path = require('path');

const apiFile = path.join(__dirname, '../src/services/api.js');

console.log('🔄 Switching from mock authentication to real API...');

// Read the current API file
let content = fs.readFileSync(apiFile, 'utf8');

// Replace mock login with real API call
const mockLoginPattern = /\/\/ Temporary mock login for development\/testing[\s\S]*?throw new Error\('Invalid credentials[\s\S]*?\);/;
const realLoginCode = `// Real API call
    const response = await apiMain.post('/auth/login?isMobile=false', {
      identifier,
      password
    });
    
    const { token, user } = response.data;
    
    // Store user data
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', user.name || user.email);
    localStorage.setItem('userEmail', user.email);
    
    return response;`;

content = content.replace(mockLoginPattern, realLoginCode);

// Write the updated content
fs.writeFileSync(apiFile, content);

console.log('✅ Successfully switched to real API integration!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Ensure your backend services are running:');
console.log('   - Main backend on port 3000');
console.log('   - Job portal service on port 4000');
console.log('');
console.log('2. Create real user accounts in your backend');
console.log('');
console.log('3. Update environment variables if needed');
console.log('');
console.log('4. Test the login with real credentials');
console.log('');
console.log('⚠️  Remember to remove the test credentials info box from Login.js'); 