using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;
using System.Linq;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class AdminAuthController : ControllerBase
    {
        private readonly RadiologyDbContext _db;
        private readonly ILogger<AdminAuthController> _logger;

        public AdminAuthController(RadiologyDbContext db, ILogger<AdminAuthController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpPost("login")]
        public ActionResult<object> Login([FromBody] LoginRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            {
                return BadRequest(new { error = "Email and password are required" });
            }

            var admin = _db.AdminUsers.FirstOrDefault(a => a.Email == req.Email);
            if (admin == null || admin.Password != req.Password)
            {
                return Unauthorized(new { error = "Invalid credentials" });
            }

            // Simple response for development — in production return a JWT or proper token
            return Ok(new { success = true, email = admin.Email, role = admin.Role });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }
}
