// Debug script to check server endpoints
// Run this in browser console to test API connectivity

async function testServerEndpoints() {
    console.log('🔍 Testing Yathrika Server Endpoints...');
    
    // Test 1: Check if server is running
    try {
        const healthCheck = await fetch('http://localhost:3001/api/user/verify-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: '+911234567890', name: 'Test User' })
        });
        
        if (healthCheck.ok) {
            console.log('✅ Server is running on port 3001');
            const result = await healthCheck.json();
            console.log('Result:', result);
        } else {
            console.log('❌ Server responded with error:', healthCheck.status, healthCheck.statusText);
        }
    } catch (error) {
        console.log('❌ Cannot connect to server:', error.message);
        console.log('Make sure:');
        console.log('1. Server is running: cd server && npm start');
        console.log('2. MongoDB is running');
        console.log('3. Port 3001 is not blocked');
    }
    
    // Test 2: Check CORS
    try {
        const corsTest = await fetch('http://localhost:3001/', { method: 'GET' });
        console.log('✅ CORS is working');
    } catch (error) {
        if (error.message.includes('cors')) {
            console.log('❌ CORS issue detected');
        }
    }
}

// Run the test
testServerEndpoints();