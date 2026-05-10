# FHIR Segment Logging - Windows Quick Start Script
# Run this to rebuild and verify FHIR segment logging is working

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         FHIR/HL7 SEGMENT LOGGING - WINDOWS SETUP              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Building Eye Clinic Backend..." -ForegroundColor Yellow
Push-Location "Modules\ClinicSystem\Backend"
dotnet build -q
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Clinic build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Eye Clinic Backend built successfully" -ForegroundColor Green
Pop-Location

Write-Host ""
Write-Host "Step 2: Building Radiology Center Backend..." -ForegroundColor Yellow
Push-Location "Modules\RadiologyCenter\Backend"
dotnet build -q
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Radiology build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Radiology Center Backend built successfully" -ForegroundColor Green
Pop-Location

Write-Host ""
Write-Host "Step 3: Checking frontend packages..." -ForegroundColor Yellow
Push-Location "Modules\RadiologyCenter\Frontend"
if (!(Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
    npm install -q
    Write-Host "✅ npm dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ npm dependencies already installed" -ForegroundColor Green
}
Pop-Location

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           READY TO START - OPEN 3 TERMINALS                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host ""
Write-Host "📌 TERMINAL 1 (Eye Clinic Backend - Port 5201)" -ForegroundColor Cyan
Write-Host "   cd Modules\ClinicSystem\Backend" -ForegroundColor White
Write-Host "   dotnet run" -ForegroundColor White

Write-Host ""
Write-Host "📌 TERMINAL 2 (Radiology Backend - Port 5301)" -ForegroundColor Magenta
Write-Host "   cd Modules\RadiologyCenter\Backend" -ForegroundColor White
Write-Host "   dotnet run" -ForegroundColor White

Write-Host ""
Write-Host "📌 TERMINAL 3 (Frontend - Port 5173)" -ForegroundColor Green
Write-Host "   cd Modules\RadiologyCenter\Frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White

Write-Host ""
Write-Host "🌐 THEN NAVIGATE TO:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173/radiology/profile" -ForegroundColor Cyan

Write-Host ""
Write-Host "📊 EXPECTED TERMINAL OUTPUT:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 (Eye Clinic):" -ForegroundColor Cyan
Write-Host "  ╔════════════════════════════════════════════════════════════════╗" -ForegroundColor White
Write-Host "  ║ [PID] PATIENT IDENTIFICATION SEGMENT - Outgoing" -ForegroundColor White
Write-Host "  ║ Direction: → OUT (Eye Clinic → Radiology Center)" -ForegroundColor White
Write-Host "  ╚════════════════════════════════════════════════════════════════╝" -ForegroundColor White

Write-Host ""
Write-Host "Terminal 2 (Radiology):" -ForegroundColor Magenta
Write-Host "  ╔════════════════════════════════════════════════════════════════╗" -ForegroundColor White
Write-Host "  ║ INCOMING FHIR BUNDLE - 1 Entries" -ForegroundColor White
Write-Host "  ║ From: Eye Clinic (5201) → Radiology Center (5301)" -ForegroundColor White
Write-Host "  ║ Timestamp: 2026-05-06 14:30:40.123" -ForegroundColor White
Write-Host "  ║ [PID] Patient Identification Segment:" -ForegroundColor White
Write-Host "  ╚════════════════════════════════════════════════════════════════╝" -ForegroundColor White

Write-Host ""
Write-Host "Terminal 3 (Frontend - Browser DevTools):" -ForegroundColor Green
Write-Host "  %c→ SENDING FHIR BUNDLE TO RADIOLOGY BACKEND" -ForegroundColor White
Write-Host "  %c✓ FHIR bundle delivered to Radiology backend" -ForegroundColor White

Write-Host ""
Write-Host "✨ All terminals should show FHIR segment boxes!" -ForegroundColor Green
