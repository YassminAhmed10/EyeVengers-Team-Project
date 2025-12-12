using Microsoft.AspNetCore.Mvc;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EyeClinicAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public SeedController(EyeClinicDbContext context)
        {
            _context = context;
        }

        [HttpPost("users")]
        public async Task<IActionResult> SeedUsers()
        {
            // Check if users already exist
            if (await _context.Users.AnyAsync())
            {
                return BadRequest(new { message = "Users already exist. Clear database first or use different emails." });
            }

            var users = new List<User>
            {
                new User
                {
                    Username = "Dr. Mohab",
                    Email = "mohab@eyeclinic.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("mohab123"),
                    Role = "Doctor",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Username = "Receptionist Sarah",
                    Email = "sarah@eyeclinic.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("sarah123"),
                    Role = "Receptionist",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Username = "Patient John",
                    Email = "john@eyeclinic.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("john123"),
                    Role = "Patient",
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.Users.AddRange(users);
            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                message = "Test users seeded successfully",
                users = users.Select(u => new { u.Username, u.Email, u.Role })
            });
        }

        [HttpDelete("users")]
        public async Task<IActionResult> ClearUsers()
        {
            var users = await _context.Users.ToListAsync();
            _context.Users.RemoveRange(users);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Deleted {users.Count} users" });
        }
    }
}
