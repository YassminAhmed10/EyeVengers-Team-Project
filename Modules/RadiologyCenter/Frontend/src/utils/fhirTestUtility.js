/**
 * FHIR Integration Test Utility
 * Run this in browser DevTools console to verify FHIR integration
 */

// Test 1: Check if services are importable
async function testFhirServices() {
    console.log('🧪 Test 1: Checking FHIR Services...\n');
    
    try {
        // This will show if modules load correctly
        const fhirIntegration = window.__fhirIntegration;
        const fhirLogger = window.__fhirLogger;
        
        if (fhirIntegration && fhirLogger) {
            console.log('✅ FHIR Services loaded successfully');
            return true;
        } else {
            console.log('⚠️ Services not globally exposed - check ProfilePage imports');
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading services:', error);
        return false;
    }
}

// Test 2: Check localStorage for patient data
function testLocalStorage() {
    console.log('\n🧪 Test 2: Checking localStorage Patient Data...\n');
    
    const keys = [
        'patientEmail',
        'patientId',
        'patientName',
        'radiologyPatientFirstName',
        'radiologyPatientLastName',
        'radiologyPatientPhone'
    ];
    
    let dataCount = 0;
    keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`✅ ${key}: ${value}`);
            dataCount++;
        }
    });
    
    if (dataCount === 0) {
        console.log('⚠️ No patient data in localStorage - try logging in first');
    }
    
    return dataCount > 0;
}

// Test 3: Check API connectivity
async function testApiConnectivity() {
    console.log('\n🧪 Test 3: Checking API Connectivity...\n');
    
    const endpoints = [
        { name: 'Eye Clinic', url: 'http://localhost:5201/api/Patient/search?query=test' },
        { name: 'Radiology Center', url: 'http://localhost:5301/api/Patient/1' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint.url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok || response.status === 401 || response.status === 404) {
                console.log(`✅ ${endpoint.name}: Reachable (${response.status})`);
            } else {
                console.log(`⚠️ ${endpoint.name}: Responded but status ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.name}: Connection failed - Is the API running?`);
        }
    }
}

// Test 4: Check console for FHIR segments
function testFhirLogging() {
    console.log('\n🧪 Test 4: FHIR Segment Logging...\n');
    console.log('Expected logs when ProfilePage loads:');
    console.log('1. System Integration message (yellow text)');
    console.log('2. Connection event (cyan/green frame)');
    console.log('3. PID segment (patient data)');
    console.log('4. SCH segments (appointments)');
    console.log('5. OBX segments (observations)');
    console.log('\n📋 Check console history above for these messages...');
}

// Test 5: Check for Firebase errors (should NOT appear)
function testNoFirebaseErrors() {
    console.log('\n🧪 Test 5: Verifying No Firebase Errors...\n');
    
    // Get console logs (limited in scope)
    console.log('Checking for Firebase imports in ProfilePage...');
    console.log('Expected: ❌ NO "firestore" imports');
    console.log('Expected: ✅ YES "fhirIntegrationService" imports');
    console.log('\nIf you see "Firebase load error: Missing permissions"');
    console.log('→ ProfilePage.jsx still has old Firebase code');
}

// Test 6: Simulate FHIR Query
async function testFhirQuery() {
    console.log('\n🧪 Test 6: Testing FHIR Query...\n');
    
    const email = localStorage.getItem('patientEmail') || 'test@example.com';
    console.log(`Testing FHIR query for: ${email}\n`);
    
    try {
        const response = await fetch(
            `http://localhost:5201/api/Patient/search?query=${encodeURIComponent(email)}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/fhir+json'
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ FHIR Query Successful!');
            console.log('Response:', data);
            
            if (Array.isArray(data) && data.length > 0) {
                console.log('\n✅ Patient found in Clinic system:');
                console.log(`Name: ${data[0].firstName} ${data[0].lastName}`);
                console.log(`Email: ${data[0].email}`);
                console.log(`Phone: ${data[0].phone}`);
            }
        } else {
            console.log(`⚠️ Query returned status: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ FHIR Query failed:', error.message);
        console.log('Possible issues:');
        console.log('1. Eye Clinic API not running on port 5201');
        console.log('2. Invalid authentication token');
        console.log('3. Patient not found in database');
    }
}

// Main test runner
async function runAllTests() {
    console.clear();
    console.log('\n' + '='.repeat(70));
    console.log('  FHIR/HL7 INTEGRATION TEST SUITE');
    console.log('  Radiology Center Frontend');
    console.log('='.repeat(70) + '\n');
    
    const test1 = testFhirServices();
    const test2 = testLocalStorage();
    await testApiConnectivity();
    testFhirLogging();
    testNoFirebaseErrors();
    await testFhirQuery();
    
    console.log('\n' + '='.repeat(70));
    console.log('  TEST COMPLETE - See results above');
    console.log('='.repeat(70) + '\n');
}

// Export for console access
window.fhirTests = {
    runAll: runAllTests,
    services: testFhirServices,
    storage: testLocalStorage,
    api: testApiConnectivity,
    logging: testFhirLogging,
    firebase: testNoFirebaseErrors,
    query: testFhirQuery
};

// Quick access instruction
console.log(`
╔════════════════════════════════════════════════════════════════╗
║  FHIR Integration Test Utility Loaded                          ║
║                                                                ║
║  Run all tests:         fhirTests.runAll()                    ║
║  Test services:         fhirTests.services()                  ║
║  Test localStorage:     fhirTests.storage()                   ║
║  Test API:              fhirTests.api()                       ║
║  Test logging:          fhirTests.logging()                   ║
║  Test no Firebase:      fhirTests.firebase()                  ║
║  Test FHIR query:       fhirTests.query()                     ║
╚════════════════════════════════════════════════════════════════╝
`);

// Auto-run for development
if (window.location.hostname === 'localhost') {
    // Uncomment to auto-run on page load:
    // runAllTests();
}
