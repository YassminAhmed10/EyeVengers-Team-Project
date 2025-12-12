# Seed test users into the database
Write-Host "=== Seeding Test Users ===" -ForegroundColor Cyan

$apiUrl = "http://localhost:5201/api/Seed/users"

Write-Host "`nAttempting to seed test users..." -ForegroundColor Yellow
Write-Host "URL: $apiUrl" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -ContentType "application/json"
    
    Write-Host "`n✓ Successfully seeded test users!" -ForegroundColor Green
    Write-Host "`nCreated users:" -ForegroundColor Cyan
    foreach ($user in $response.users) {
        Write-Host "  - $($user.username) [$($user.email)] - Role: $($user.role)" -ForegroundColor White
    }
    
    Write-Host "`n=== Login Credentials ===" -ForegroundColor Cyan
    Write-Host "Doctor:" -ForegroundColor Yellow
    Write-Host "  Email: mohab@eyeclinic.com" -ForegroundColor White
    Write-Host "  Password: mohab123" -ForegroundColor White
    
    Write-Host "`nReceptionist:" -ForegroundColor Yellow
    Write-Host "  Email: sarah@eyeclinic.com" -ForegroundColor White
    Write-Host "  Password: sarah123" -ForegroundColor White
    
    Write-Host "`nPatient:" -ForegroundColor Yellow
    Write-Host "  Email: john@eyeclinic.com" -ForegroundColor White
    Write-Host "  Password: john123" -ForegroundColor White
    
} catch {
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $_.ErrorDetails.Message
        
        if ($errorBody) {
            $error = $errorBody | ConvertFrom-Json
            Write-Host "`n✗ Error: $($error.message)" -ForegroundColor Red
        } else {
            Write-Host "`n✗ HTTP Error $statusCode" -ForegroundColor Red
        }
    } else {
        Write-Host "`n✗ Error: Cannot connect to API" -ForegroundColor Red
        Write-Host "Make sure the API is running on http://localhost:5201" -ForegroundColor Yellow
    }
    
    $errorMsg = $_.Exception.Message
    Write-Host "`nFailed to seed users. Error: $errorMsg" -ForegroundColor Red
}
