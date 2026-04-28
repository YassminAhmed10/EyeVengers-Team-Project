// Run this with: dotnet script add-users.csx
#r "nuget: BCrypt.Net-Next, 4.0.3"
#r "nuget: Microsoft.Data.SqlClient, 5.1.2"

using BCrypt.Net;
using Microsoft.Data.SqlClient;
using System;

var connectionString = "Server=(localdb)\\mssqllocaldb;Database=EyeClinicDB;Trusted_Connection=True;MultipleActiveResultSets=true";

var users = new[]
{
    new { Username = "Dr. Mohab", Email = "mohab@eyeclinic.com", Password = "mohab123", Role = "Doctor" },
    new { Username = "Receptionist Sarah", Email = "sarah@eyeclinic.com", Password = "sarah123", Role = "Receptionist" },
    new { Username = "Patient John", Email = "john@eyeclinic.com", Password = "john123", Role = "Patient" }
};

try
{
    using (var connection = new SqlConnection(connectionString))
    {
        connection.Open();
        Console.WriteLine("Connected to database successfully!");

        foreach (var user in users)
        {
            var passwordHash = BCrypt.HashPassword(user.Password);
            
            var sql = @"
                IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
                BEGIN
                    INSERT INTO Users (Username, Email, PasswordHash, Role, CreatedAt)
                    VALUES (@Username, @Email, @PasswordHash, @Role, @CreatedAt)
                    PRINT 'Added user: ' + @Username
                END
                ELSE
                BEGIN
                    PRINT 'User already exists: ' + @Email
                END";

            using (var command = new SqlCommand(sql, connection))
            {
                command.Parameters.AddWithValue("@Username", user.Username);
                command.Parameters.AddWithValue("@Email", user.Email);
                command.Parameters.AddWithValue("@PasswordHash", passwordHash);
                command.Parameters.AddWithValue("@Role", user.Role);
                command.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);
                
                command.ExecuteNonQuery();
                Console.WriteLine($"✓ Processed: {user.Username} ({user.Email})");
            }
        }

        Console.WriteLine("\n=== Test Users Created ===");
        Console.WriteLine("mohab@eyeclinic.com / mohab123 (Doctor)");
        Console.WriteLine("sarah@eyeclinic.com / sarah123 (Receptionist)");
        Console.WriteLine("john@eyeclinic.com / john123 (Patient)");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}
