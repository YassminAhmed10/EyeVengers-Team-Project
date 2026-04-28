# Add test users (Doctor, Receptionist, Patient)
Write-Host "=== Adding Test Users ===" -ForegroundColor Cyan

$apiUrl = "http://localhost:5201/api/Auth"

# Test users data
$users = @(
    @{
        username = "Dr. Mohab"
        email = "mohab@eyeclinic.com"
        password = "mohab123"
        role = "Doctor"
    },
    @{
        username = "Receptionist Sarah"
        email = "sarah@eyeclinic.com"
        password = "sarah123"
        role = "Receptionist"
    },
    @{
        username = "Patient John"
        email = "john@eyeclinic.com"
        password = "john123"
        role = "Patient"
    }
)

foreach ($user in $users) {
    Write-Host "`nAdding user: $($user.username) ($($user.role))..." -ForegroundColor Yellow
    
    # For Patient, use register endpoint
    if ($user.role -eq "Patient") {
        $endpoint = "$apiUrl/register"
        $body = @{
            username = $user.username
            email = $user.email
            password = $user.password
            role = $user.role
        } | ConvertTo-Json
    } else {
        # For Doctor and Receptionist, we need to add them directly to the database
        # since the register endpoint only allows Patients
        Write-Host "Note: Doctor and Receptionist accounts need to be added directly to the database." -ForegroundColor Yellow
        continue
    }
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $body -ContentType "application/json"
        Write-Host "✓ Successfully added: $($user.username)" -ForegroundColor Green
    } catch {
        $errorMessage = $_.ErrorDetails.Message
        if ($errorMessage) {
            $error = $errorMessage | ConvertFrom-Json
            Write-Host "✗ Error: $($error.message)" -ForegroundColor Red
        } else {
            Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Adding Doctor and Receptionist users directly ===" -ForegroundColor Cyan
Write-Host "Since the API only allows Patient registration, we need to insert Doctor and Receptionist users directly." -ForegroundColor Yellow
Write-Host "`nYou can run this SQL script or use Entity Framework to add them:" -ForegroundColor White

# Generate hashed passwords using BCrypt (this is just for display - actual hashing happens in C#)
Write-Host @"

-- Run this in SQL Server Management Studio or via dotnet ef:

-- Hash for 'mohab123': You'll need to generate this in C# using BCrypt.Net.BCrypt.HashPassword("mohab123")
-- Hash for 'sarah123': You'll need to generate this in C# using BCrypt.Net.BCrypt.HashPassword("sarah123")

-- Or use the C# script approach below

"@ -ForegroundColor Gray

Write-Host "`n=== Recommended: Create a seeding endpoint ===" -ForegroundColor Cyan
Write-Host "Add an endpoint to seed test users with proper password hashing." -ForegroundColor Yellow
