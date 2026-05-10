using System;

namespace RadiologyCenterAPI.Models
{
    public class AdminUser
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        // NOTE: For development convenience we store the password plainly here.
        // In production, replace with a secure hashing mechanism (e.g., BCrypt).
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "admin";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
