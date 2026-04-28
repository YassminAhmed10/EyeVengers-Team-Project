#nullable disable
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs;
using EyeClinicAPI.DTOs;
using EyeClinicAPI.Models;
using EyeClinicAPI.Services;
using PatientModel = EyeClinicAPI.Models.EMR.Patient;

namespace EyeClinicAPI.Modules.ClinicSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;
        private readonly ILogger<AuthController> _logger;
        private readonly IEmailService _emailService;

        public AuthController(EyeClinicDbContext context, ILogger<AuthController> logger, IEmailService emailService)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
        }

        [HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    try
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        // Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            _logger.LogWarning("Login failed: User not found for email {Email}", request.Email);
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // Verify password with backward compatibility
        bool passwordValid;
        if (!string.IsNullOrWhiteSpace(user.PasswordHash) && user.PasswordHash.StartsWith("$2"))
        {
            passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        else
        {
            passwordValid = user.PasswordHash == request.Password;
        }

        if (!passwordValid)
        {
            _logger.LogWarning("Login failed: Invalid password for email {Email}", request.Email);
            return Unauthorized(new { message = "Invalid email or password" });
        }

        _logger.LogInformation("Login successful for email: {Email}, Role: {Role}", request.Email, user.Role);

        // Get patient info if role is Patient
        object? patientInfo = null;
        if (user.Role == "Patient")
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Email == user.Email);
            
            if (patient != null)
            {
                patientInfo = new
                {
                    id = patient.Id,
                    firstName = patient.FirstName,
                    lastName = patient.LastName,
                    fullName = $"{patient.FirstName} {patient.LastName}".Trim(),
                    phone = patient.Phone,
                    dateOfBirth = patient.DateOfBirth,
                    gender = patient.Gender,
                    address = patient.Address,
                    email = patient.Email
                };
                _logger.LogInformation("Patient data found for email: {Email}, DOB: {DOB}", user.Email, patient.DateOfBirth);
            }
            else
            {
                _logger.LogWarning("No patient record found for email: {Email}", user.Email);
            }
        }

        // Send login notification email
        _ = _emailService.SendLoginEmailAsync(user.Email, user.Username);

        // Return user info with patient data
        return Ok(new
        {
            user = new
            {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role
            },
            patient = patientInfo,
            token = "mock-jwt-token"
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
        return StatusCode(500, new { message = "An error occurred during login" });
    }
}
        [HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterRequest request)
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Role))
        {
            return BadRequest(new { message = "All fields are required" });
        }

        var normalizedEmail = request.Email.Trim();

        // Check if user already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (existingUser != null)
        {
            return BadRequest(new { message = "User with this email already exists" });
        }

        // Create User
        var newUser = new User
        {
            Username = request.Username.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        int? patientId = null;

        // If role is Patient, create a Patient record
        if (request.Role.Trim().Equals("Patient", StringComparison.OrdinalIgnoreCase))
        {
            // Split name if firstName/lastName not provided
            string firstName = request.FirstName ?? "";
            string lastName = request.LastName ?? "";
            
            if (string.IsNullOrWhiteSpace(firstName) && !string.IsNullOrWhiteSpace(request.Username))
            {
                var nameParts = request.Username.Trim().Split(' ');
                firstName = nameParts.Length > 0 ? nameParts[0] : "";
                lastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "";
            }
            
            var newPatient = new PatientModel
            {
                FirstName = firstName,
                LastName = lastName,
                DateOfBirth = request.DateOfBirth ?? DateTime.Now.AddYears(-30),
                Gender = request.Gender ?? "Not Specified",
                Phone = request.Phone ?? "",
                Email = normalizedEmail,
                Address = request.Address ?? "",
                NationalId = request.NationalId ?? "",
                InsuranceCompany = request.InsuranceCompany ?? "",
                InsuranceId = request.InsuranceId ?? "",
                EmergencyContactName = request.EmergencyContactName ?? "",
                EmergencyContactPhone = request.EmergencyContactPhone ?? "",
                CreatedAt = DateTime.UtcNow
            };
            
            _context.Patients.Add(newPatient);
            await _context.SaveChangesAsync();
            patientId = newPatient.Id;
            
            _logger.LogInformation("Patient record created with ID: {PatientId} for user: {Email}", patientId, normalizedEmail);
        }

        _logger.LogInformation("User registered successfully: {Email}", newUser.Email);

        // Send welcome email
        _ = _emailService.SendWelcomeEmailAsync(newUser.Email, newUser.Username);

        return Ok(new
        {
            user = new
            {
                id = newUser.Id,
                username = newUser.Username,
                email = newUser.Email,
                role = newUser.Role,
                patientId = patientId
            },
            message = "Registration successful"
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
        return StatusCode(500, new { message = "An error occurred during registration" });
    }

}
    }
}   




