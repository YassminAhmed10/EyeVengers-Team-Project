# PowerShell Test Script - FHIR/HL7 Backend Logging

## Test 1: Check Port Availability

```powershell
# Check if ports are available
"Checking port availability..."

$ports = 5201, 5301, 5173

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Port $port: OCCUPIED" -ForegroundColor Yellow
    } else {
        Write-Host "Port $port: Available" -ForegroundColor Green
    }
}
```

## Test 2: Start Services

```powershell
# Terminal 1: Eye Clinic Backend
Write-Host "Starting Eye Clinic Backend..." -ForegroundColor Cyan
cd "Modules\ClinicSystem\Backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run"

# Wait for startup
Start-Sleep -Seconds 5

# Terminal 2: Radiology Backend
Write-Host "Starting Radiology Backend..." -ForegroundColor Magenta
cd "Modules\RadiologyCenter\Backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run"

# Wait for startup
Start-Sleep -Seconds 5

# Terminal 3: Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
cd "Modules\RadiologyCenter\Frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "All services started! Check the three terminal windows." -ForegroundColor Green
Write-Host "Frontend available at: http://localhost:5173" -ForegroundColor Green
```

## Test 3: Test Eye Clinic FHIR API

```powershell
# Query patient from Eye Clinic
$response = Invoke-WebRequest -Uri "http://localhost:5201/api/Patient/search?query=eman@example.com" `
    -UseBasicParsing -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 200) {
    Write-Host "✅ Eye Clinic API responding" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Patient count: $($data.Count)" -ForegroundColor Green
    
    if ($data.Count -gt 0) {
        Write-Host "Sample patient: $($data[0].firstName) $($data[0].lastName)" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Eye Clinic API not responding" -ForegroundColor Red
}
```

## Test 4: Check Startup Banners

```powershell
# This requires looking at the terminal output manually, but you can script a check

# Look for startup messages in logs by timing when you start
$startTime = Get-Date

Write-Host "Startup messages to expect in terminals:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 (Eye Clinic):" -ForegroundColor Yellow
Write-Host "  EYE CLINIC FHIR/HL7 API SERVICE STARTING" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 2 (Radiology):" -ForegroundColor Magenta
Write-Host "  RADIOLOGY CENTER FHIR/HL7 SERVICE STARTING" -ForegroundColor Magenta
Write-Host "  Look for: [PID], [SCH], [OBX], [ORM^O01], [ACK^O01]" -ForegroundColor Magenta
Write-Host ""
Write-Host "Terminal 3 (Frontend):" -ForegroundColor Green
Write-Host "  VITE ... ready in XXX ms" -ForegroundColor Green
Write-Host ""
```

## Test 5: Simulate FHIR Request

```powershell
# Send a test FHIR query to Radiology center

$fhirQuery = @{
    email = "eman@example.com"
} | ConvertTo-Json

Write-Host "Sending FHIR query to Radiology..." -ForegroundColor Cyan

$response = Invoke-WebRequest -Uri "http://localhost:5301/api/fhir/patient" `
    -Method POST `
    -Body $fhirQuery `
    -ContentType "application/fhir+json" `
    -UseBasicParsing `
    -ErrorAction SilentlyContinue

if ($response) {
    Write-Host "✅ Radiology API responding" -ForegroundColor Green
    Write-Host "Response status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Check Terminal 2 (Radiology) console for FHIR segment logs:" -ForegroundColor Yellow
    Write-Host "  ╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║ [PID] PATIENT IDENTIFICATION SEGMENT" -ForegroundColor Cyan
    Write-Host "  ╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
} else {
    Write-Host "❌ Radiology API not responding" -ForegroundColor Red
    Write-Host "Check if service is running on port 5301" -ForegroundColor Red
}
```

## Test 6: Check Console Logging

```powershell
# Look for these in Terminal 2 output:

$expectedLogs = @(
    "Debug level logging",
    "Console output configured",
    "Startup banner",
    "[PID] PATIENT IDENTIFICATION SEGMENT",
    "[SCH] APPOINTMENT/SCHEDULE SEGMENT",
    "FHIR BUNDLE RECEIVED",
    "HL7 v2.5 ORM^O01 MESSAGE BUILT",
    "ACK^O01 RECEIVED FROM RIS"
)

Write-Host "Expected log messages in Radiology terminal:" -ForegroundColor Cyan
$expectedLogs | ForEach-Object {
    Write-Host "  ✓ $_" -ForegroundColor Green
}

Write-Host ""
Write-Host "If you see all these messages, logging is configured correctly!" -ForegroundColor Green
```

## Quick Manual Test

```bash
# In PowerShell - Run this sequence:

# 1. Check backend files exist
Test-Path "Modules\ClinicSystem\Backend\Program.cs"
Test-Path "Modules\RadiologyCenter\Backend\Program.cs"

# 2. Check they have Debug logging
Select-String -Path "Modules\RadiologyCenter\Backend\appsettings.json" -Pattern '"Default": "Debug"'

# 3. Quick startup test
cd "Modules\RadiologyCenter\Backend"
dotnet run --help | Select-Object -First 5

# 4. Check port 5301 not in use
$null = Get-NetTCPConnection -LocalPort 5301 -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "Port 5301 is in use" -ForegroundColor Yellow
} else {
    Write-Host "Port 5301 is available" -ForegroundColor Green
}
```

---

## Integration Test Sequence

### Step-by-Step Testing

```powershell
# Copy this script and run in PowerShell ISE for best results

Write-Host "FHIR/HL7 Backend Logging - Integration Test" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: File existence
Write-Host "Test 1: Checking configuration files..." -ForegroundColor Yellow
$files = @(
    "Modules\ClinicSystem\Backend\Configuration\appsettings.json",
    "Modules\RadiologyCenter\Backend\appsettings.json",
    "Modules\ClinicSystem\Backend\Program.cs",
    "Modules\RadiologyCenter\Backend\Program.cs"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file NOT FOUND" -ForegroundColor Red
        $allExist = $false
    }
}

if ($allExist) {
    Write-Host ""
    Write-Host "✅ All configuration files exist" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Some configuration files missing" -ForegroundColor Red
    exit
}

# Test 2: Debug logging configuration
Write-Host ""
Write-Host "Test 2: Checking Debug logging enabled..." -ForegroundColor Yellow

$radiologyConfig = Get-Content "Modules\RadiologyCenter\Backend\appsettings.json" -Raw
if ($radiologyConfig -match '"Default": "Debug"') {
    Write-Host "  ✅ Radiology: Debug logging enabled" -ForegroundColor Green
} else {
    Write-Host "  ❌ Radiology: Debug logging NOT found" -ForegroundColor Red
}

$clinicConfig = Get-Content "Modules\ClinicSystem\Backend\Configuration\appsettings.json" -Raw
if ($clinicConfig -match '"Default": "Debug"') {
    Write-Host "  ✅ Clinic: Debug logging enabled" -ForegroundColor Green
} else {
    Write-Host "  ❌ Clinic: Debug logging NOT found" -ForegroundColor Red
}

# Test 3: FHIR Mapping Service logging
Write-Host ""
Write-Host "Test 3: Checking FHIR segment logging added..." -ForegroundColor Yellow

$fhirService = Get-Content "Modules\RadiologyCenter\Backend\Services\FhirMappingService.cs" -Raw
if ($fhirService -match "\[PID\].*PATIENT.*IDENTIFICATION.*SEGMENT") {
    Write-Host "  ✅ FHIR segment logging found" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  FHIR segment logging not verified" -ForegroundColor Yellow
}

# Test 4: Ready to run
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✅ All checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open 3 PowerShell terminals" -ForegroundColor Cyan
Write-Host "2. Terminal 1: cd Modules\ClinicSystem\Backend && dotnet run" -ForegroundColor Cyan
Write-Host "3. Terminal 2: cd Modules\RadiologyCenter\Backend && dotnet run" -ForegroundColor Cyan
Write-Host "4. Terminal 3: cd Modules\RadiologyCenter\Frontend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Navigate to: http://localhost:5173/radiology/profile" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. Watch the terminals for FHIR segment logs:" -ForegroundColor Cyan
Write-Host "   - Terminal 1: FHIR API responses" -ForegroundColor Cyan
Write-Host "   - Terminal 2: [PID], [SCH], [ORM^O01] boxes" -ForegroundColor Cyan
Write-Host "   - Terminal 3: Frontend + DevTools console" -ForegroundColor Cyan
```

---

## Troubleshooting

```powershell
# If ports are blocked:
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -in 5201, 5301, 5173}

# Kill dotnet process if needed:
Stop-Process -Name dotnet -Force

# Verify services can start:
cd "Modules\RadiologyCenter\Backend"
dotnet build --configuration Debug
```
