# ?????? ?????? Doctor ??????
Write-Host "=== ????? Doctor ?????? ===" -ForegroundColor Cyan

$apiUrl = "https://localhost:7071/api/Doctors"

# Doctor test data
$doctor = @{
    fullName = "Dr. Ahmed Ali"
    specialization = "Ophthalmologist"
    phoneNumber = "0123456789"
    email = "ahmed@eyeclinic.com"
} | ConvertTo-Json

Write-Host "`n???? ????? Doctor..." -ForegroundColor Yellow
Write-Host "URL: $apiUrl" -ForegroundColor Gray

try {
    # ????? SSL certificate errors ???????
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
    
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $doctor -ContentType "application/json"
    
    Write-Host "`n? ?? ????? Doctor ?????!" -ForegroundColor Green
    Write-Host "Doctor ID: $($response.doctorId)" -ForegroundColor Cyan
    Write-Host "Name: $($response.fullName)" -ForegroundColor Cyan
    Write-Host "Specialization: $($response.specialization)" -ForegroundColor Cyan
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 0) {
        Write-Host "`n? ???: ?? ???? ??????? ???? API" -ForegroundColor Red
        Write-Host "???? ?? ????? API ????? ??????:" -ForegroundColor Yellow
        Write-Host "  cd EyeClinicAPI" -ForegroundColor Gray
        Write-Host "  dotnet run --launch-profile https" -ForegroundColor Gray
    } else {
        Write-Host "`n?? ???: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host "`n????? ?????? ?? ??? Doctors ???:" -ForegroundColor White
Write-Host "https://localhost:7071/swagger" -ForegroundColor Cyan
