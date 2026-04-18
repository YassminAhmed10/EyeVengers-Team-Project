using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs;
using EyeClinicAPI.Models;
using EyeClinicAPI.Services;

namespace EyeClinicAPI.Controllers
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

                // Verify password with backward compatibility:
                // - If DB value looks like BCrypt hash, verify with BCrypt.
                // - Otherwise fallback to legacy plain-text comparison.
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

                // Send login notification email (don't wait for it)
                _ = _emailService.SendLoginEmailAsync(user.Email, user.Username);

                // Return user info (excluding password)
                return Ok(new
                {
                    user = new
                    {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email,
                        role = user.Role
                    },
                    token = "mock-jwt-token" // In production, generate actual JWT
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

                _logger.LogInformation("User registered successfully: {Email}", newUser.Email);

                // Send welcome email (don't wait for it)
                _ = _emailService.SendWelcomeEmailAsync(newUser.Email, newUser.Username);

                return Ok(new
                {
                    user = new
                    {
                        id = newUser.Id,
                        username = newUser.Username,
                        email = newUser.Email,
                        role = newUser.Role
                    }
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
