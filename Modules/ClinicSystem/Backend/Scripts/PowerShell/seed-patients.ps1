# PowerShell Script to seed Egyptian patients data
# Script to add Egyptian patient data

Write-Host '=== Seeding Egyptian Patients Data ===' -ForegroundColor Cyan
Write-Host ''

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptPath 'seed-egyptian-patients.sql'

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host 'Error: SQL file not found' -ForegroundColor Red
    Write-Host $sqlFile -ForegroundColor Red
    exit 1
}

# Connection string options
Write-Host 'Choose database connection method:' -ForegroundColor Yellow
Write-Host '1. SQL Server (Local Windows Authentication)'
Write-Host '2. SQL Server (Username & Password)'
Write-Host '3. Manual execution instructions'
Write-Host ''
$choice = Read-Host 'Enter choice (1-3)'

switch ($choice) {
    '1' {
        # Windows Authentication
        $serverInstance = Read-Host 'Enter server name (default: localhost)'
        if ([string]::IsNullOrWhiteSpace($serverInstance)) {
            $serverInstance = 'localhost'
        }
        
        Write-Host "`nExecuting SQL Script..." -ForegroundColor Yellow
        
        try {
            # Using sqlcmd (requires SQL Server Command Line Utilities)
            $output = sqlcmd -S $serverInstance -E -i $sqlFile 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`nData seeded successfully!" -ForegroundColor Green
                Write-Host "`nResults:" -ForegroundColor Cyan
                Write-Host $output
            } else {
                Write-Host "`nError occurred during execution" -ForegroundColor Red
                Write-Host $output -ForegroundColor Red
            }
        } catch {
            Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "`nMake sure SQL Server Command Line Utilities are installed" -ForegroundColor Yellow
            Write-Host 'Download from: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility' -ForegroundColor Cyan
        }
    }
    
    '2' {
        # SQL Authentication
        $serverInstance = Read-Host 'Enter server name'
        $username = Read-Host 'Username'
        $password = Read-Host 'Password' -AsSecureString
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
        )
        
        Write-Host "`nExecuting SQL Script..." -ForegroundColor Yellow
        
        try {
            $output = sqlcmd -S $serverInstance -U $username -P $plainPassword -i $sqlFile 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`nData seeded successfully!" -ForegroundColor Green
                Write-Host "`nResults:" -ForegroundColor Cyan
                Write-Host $output
            } else {
                Write-Host "`nError occurred during execution" -ForegroundColor Red
                Write-Host $output -ForegroundColor Red
            }
        } catch {
            Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    '3' {
        # Manual execution instructions
        Write-Host "`nManual Execution Options:" -ForegroundColor Cyan
        Write-Host '1. SQL Server Management Studio (SSMS)'
        Write-Host '2. Azure Data Studio'
        Write-Host '3. Visual Studio SQL Server Object Explorer'
        Write-Host '4. sqlcmd command line tool'
        Write-Host "`nSQL file location:" -ForegroundColor Yellow
        Write-Host $sqlFile -ForegroundColor Green
    }
    
    default {
        Write-Host "`nInvalid choice" -ForegroundColor Red
    }
}

Write-Host "`n=== Execution Completed ===" -ForegroundColor Cyan
Write-Host ''
Write-Host 'Note: If you are using SQL Server Management Studio:' -ForegroundColor Yellow
Write-Host '1. Open SSMS and connect to your server'
Write-Host '2. Open seed-egyptian-patients.sql file'
Write-Host '3. Press F5 or Execute to run the script'

