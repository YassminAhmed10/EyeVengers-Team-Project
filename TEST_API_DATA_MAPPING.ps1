# PowerShell API Data Mapping Test Script
# This script tests the complete data mapping from the medical record API

Write-Host "========================================"
Write-Host "  Patient Medical Record API Test"
Write-Host "========================================"
Write-Host ""

# Configuration
$API_BASE = "http://localhost:5201"
$PATIENT_ID = "P-000123"  # Change this to your test patient ID
$TOKEN = ""  # Add your JWT token here if needed

Write-Host "API Base URL: $API_BASE"
Write-Host "Patient ID: $PATIENT_ID"
Write-Host ""

# Test 1: Check if record exists
Write-Host "1️⃣  Testing: Check if medical record exists"
Write-Host "   Endpoint: GET /api/MedicalRecord/check/{patientId}"
Write-Host ""

try {
    $headers = @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
    }
    if ($TOKEN) {
        $headers["Authorization"] = "Bearer $TOKEN"
    }
    
    $response1 = Invoke-RestMethod -Uri "$API_BASE/api/MedicalRecord/check/$PATIENT_ID" `
        -Method Get `
        -Headers $headers
    
    Write-Host ($response1 | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test 2: Get appointment info (most important - this is what the frontend uses)
Write-Host "2️⃣  Testing: Get appointment info (Frontend Data Source)"
Write-Host "   Endpoint: GET /api/MedicalRecord/appointment-info/{patientId}"
Write-Host ""

Write-Host "📋 EXPECTED FIELDS TO CHECK:"
Write-Host "   ✓ gender"
Write-Host "   ✓ nationalId"
Write-Host "   ✓ address"
Write-Host "   ✓ insuranceCompany"
Write-Host "   ✓ insuranceId"
Write-Host "   ✓ email"
Write-Host "   ✓ phone"
Write-Host "   ✓ birthDate"
Write-Host ""

try {
    $headers = @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
    }
    if ($TOKEN) {
        $headers["Authorization"] = "Bearer $TOKEN"
    }
    
    $response2 = Invoke-RestMethod -Uri "$API_BASE/api/MedicalRecord/appointment-info/$PATIENT_ID" `
        -Method Get `
        -Headers $headers
    
    Write-Host "📌 Full API Response:" -ForegroundColor Green
    Write-Host ($response2 | ConvertTo-Json -Depth 5)
    
    Write-Host ""
    Write-Host "📊 Data Extraction Summary:" -ForegroundColor Cyan
    
    $summary = @{
        patientId = $response2.patientId
        name = $response2.name
        gender = $response2.gender
        nationalId = $response2.nationalId
        address = $response2.address
        email = $response2.email
        phone = $response2.phone
        birthDate = $response2.birthDate
        insuranceCompany = $response2.insuranceCompany
        insuranceId = $response2.insuranceId
        policyNumber = $response2.policyNumber
        coverage = $response2.coverage
        emergencyContactName = $response2.emergencyContactName
        emergencyContactPhone = $response2.emergencyContactPhone
    }
    
    Write-Host ($summary | ConvertTo-Json)
    
    # Check for empty fields
    Write-Host ""
    Write-Host "⚠️  FIELD VALIDATION:" -ForegroundColor Yellow
    foreach ($key in $summary.Keys) {
        $value = $summary[$key]
        if ([string]::IsNullOrEmpty($value) -or $value -eq "0" -or $value -eq 0) {
            Write-Host "   ❌ $key : EMPTY" -ForegroundColor Red
        } else {
            Write-Host "   ✅ $key : $value" -ForegroundColor Green
        }
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test 3: Get full medical record
Write-Host "3️⃣  Testing: Get full medical record"
Write-Host "   Endpoint: GET /api/MedicalRecord/patient/{patientId}"
Write-Host ""

try {
    $headers = @{
        "Accept" = "application/json"
        "Content-Type" = "application/json"
    }
    if ($TOKEN) {
        $headers["Authorization"] = "Bearer $TOKEN"
    }
    
    $response3 = Invoke-RestMethod -Uri "$API_BASE/api/MedicalRecord/patient/$PATIENT_ID" `
        -Method Get `
        -Headers $headers
    
    if ($response3 -is [array]) {
        $response3 | ForEach-Object {
            Write-Host @{
                patientId = $_.patientId
                gender = $_.gender
                nationalId = $_.nationalId
                address = $_.address
                insuranceCompany = $_.insuranceCompany
            } | ConvertTo-Json
        }
    } else {
        Write-Host @{
            patientId = $response3.patientId
            gender = $response3.gender
            nationalId = $response3.nationalId
            address = $response3.address
            insuranceCompany = $response3.insuranceCompany
        } | ConvertTo-Json
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================"
Write-Host "  Test Complete"
Write-Host "========================================"
Write-Host ""
Write-Host "✅ If all fields (gender, nationalId, address, insuranceCompany) are populated,"
Write-Host "   then the data mapping is working correctly!"
Write-Host ""

Write-Host "📝 Next Steps:"
Write-Host "   1. Check the browser console (F12) for the API response logs"
Write-Host "   2. Look at the 'Data Extraction Summary' above"
Write-Host "   3. Verify that all patient information is populating the database"
Write-Host "   4. If fields are empty, check that the Appointment or Patient records have data"
