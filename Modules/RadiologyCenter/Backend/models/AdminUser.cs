using System.ComponentModel.DataAnnotations;

namespace RadiologyCenterAPI.Models
{
    public class AdminUser
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        public string Role { get; set; } = "admin";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}