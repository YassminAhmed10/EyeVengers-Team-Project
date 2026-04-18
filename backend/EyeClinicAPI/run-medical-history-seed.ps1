# ========================================
# 🏥 Run Medical History Records Seeding Script
# ========================================
# This script adds multiple medical records for the same patient (Reem Saeed Mahmoud)
# to test the historical data dropdown in the EMR page
# ========================================

Write-Host "🏥 Starting Medical History Records Seeding..." -ForegroundColor Cyan
Write-Host ""

# SQL Server connection settings
$serverName = "localhost"
$databaseName = "EyeClinicDB"
$sqlFile = "seed-medical-history-records.sql"

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Error: SQL file not found: $sqlFile" -ForegroundColor Red
    Write-Host "Make sure you're running this script from the EyeClinicAPI directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "📄 SQL File: $sqlFile" -ForegroundColor Green
Write-Host "🗄️  Database: $databaseName on $serverName" -ForegroundColor Green
Write-Host ""

# Execute SQL script
try {
    Write-Host "⏳ Executing SQL script..." -ForegroundColor Yellow
    
    # Use sqlcmd to execute the SQL file
    $output = sqlcmd -S $serverName -d $databaseName -E -i $sqlFile -b
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SUCCESS! Medical history records added successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Summary:" -ForegroundColor Cyan
        Write-Host "  • Patient: Reem Saeed Mahmoud (P-020)" -ForegroundColor White
        Write-Host "  • Visit 1: Conjunctivitis (Nov 15, 2025)" -ForegroundColor White
        Write-Host "  • Visit 2: Myopia (Dec 28, 2025)" -ForegroundColor White
        Write-Host "  • Visit 3: Dry Eye Syndrome (Jan 25, 2026)" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 Now you can test the EMR page with patient P-020 to see multiple visits!" -ForegroundColor Green
        Write-Host ""
        
        # Display the SQL output
        Write-Host "📋 Database Output:" -ForegroundColor Cyan
        $output | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
    else {
        Write-Host ""
        Write-Host "❌ Error executing SQL script!" -ForegroundColor Red
        Write-Host "Output:" -ForegroundColor Yellow
        $output | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Exception occurred: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ Script completed!" -ForegroundColor Cyan
Write-Host ""
