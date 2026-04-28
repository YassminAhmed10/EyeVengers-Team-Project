# Insert test users directly to SQL database
$connectionString = "Server=(localdb)\mssqllocaldb;Database=EyeClinicDB;Integrated Security=true;"

# BCrypt hashes for test passwords
$users = @(
    @{Username="Dr. Mohab"; Email="mohab@eyeclinic.com"; PasswordHash="`$2a`$11`$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"; Role="Doctor"},
    @{Username="Receptionist Sarah"; Email="sarah@eyeclinic.com"; PasswordHash="`$2a`$11`$Paslt0y/Mc6XpXGZmZA1W.s5xQkr.pARd3j8cUlfVRQpQpAu.xjmS"; Role="Receptionist"},
    @{Username="Patient John"; Email="john@eyeclinic.com"; PasswordHash="`$2a`$11`$K.lUcF5MNOM1KxN0Q/rg9.oRx2nEv.VcP5Bp3ekmPWTGLGv6Q2XAa"; Role="Patient"}
)

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    Write-Host "Connected to database" -ForegroundColor Green
    
    foreach ($user in $users) {
        $sql = "IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @Email) BEGIN INSERT INTO Users (Username, Email, PasswordHash, Role, CreatedAt) VALUES (@Username, @Email, @PasswordHash, @Role, @CreatedAt) SELECT 'Added' AS Result END ELSE BEGIN SELECT 'Exists' AS Result END"
        
        $command = $connection.CreateCommand()
        $command.CommandText = $sql
        $command.Parameters.AddWithValue("@Username", $user.Username) | Out-Null
        $command.Parameters.AddWithValue("@Email", $user.Email) | Out-Null
        $command.Parameters.AddWithValue("@PasswordHash", $user.PasswordHash) | Out-Null
        $command.Parameters.AddWithValue("@Role", $user.Role) | Out-Null
        $command.Parameters.AddWithValue("@CreatedAt", [DateTime]::UtcNow) | Out-Null
        
        $result = $command.ExecuteScalar()
        if ($result -eq "Added") {
            Write-Host "Added: $($user.Email)" -ForegroundColor Green
        } else {
            Write-Host "Exists: $($user.Email)" -ForegroundColor Yellow
        }
    }
    
    $connection.Close()
    Write-Host "`nLogin with: mohab@eyeclinic.com / mohab123" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
