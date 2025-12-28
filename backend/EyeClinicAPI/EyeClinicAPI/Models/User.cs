using System;
using System.ComponentModel.DataAnnotations;

namespace EyeClinicAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string Role { get; set; } // Doctor, Receptionist, Admin, etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}