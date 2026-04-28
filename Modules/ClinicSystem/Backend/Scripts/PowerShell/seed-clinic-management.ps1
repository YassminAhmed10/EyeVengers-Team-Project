# PowerShell Script to Seed Clinic Management Data
# Run this script from backend/EyeClinicAPI directory

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Seeding Clinic Management Database..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$sqlFile = "seed-clinic-management.sql"
$server = "(localdb)\mssqllocaldb"
$database = "EyeClinicDB"

if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: $sqlFile not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`nExecuting SQL script: $sqlFile" -ForegroundColor Yellow
Write-Host "Server: $server" -ForegroundColor Yellow
Write-Host "Database: $database" -ForegroundColor Yellow

try {
    sqlcmd -S $server -d $database -i $sqlFile -b
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n============================================" -ForegroundColor Green
        Write-Host "SUCCESS! Clinic Management data seeded!" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "`nTables created and populated:" -ForegroundColor Cyan
        Write-Host "  [+] Equipment (15 items)" -ForegroundColor Green
        Write-Host "  [+] MedicalSupplies (20 items)" -ForegroundColor Green
        Write-Host "  [+] SanitizationSchedule (12 areas)" -ForegroundColor Green
        Write-Host "  [+] MaintenanceTasks (15 tasks)" -ForegroundColor Green
        Write-Host "  [+] WasteManagement (10 records)" -ForegroundColor Green
        Write-Host "`nYou can now use the Clinic Management system!" -ForegroundColor Cyan
    } else {
        Write-Host "`nError: SQL script execution failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`nError executing SQL script: $_" -ForegroundColor Red
    exit 1
}
