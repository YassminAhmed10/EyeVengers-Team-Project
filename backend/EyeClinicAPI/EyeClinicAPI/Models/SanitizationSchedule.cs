using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EyeClinicAPI.Models
{
    [Table("SanitizationSchedule")]
    public class SanitizationSchedule
    {
        [Key]
        public int SanitizationId { get; set; }

        [Required]
        [StringLength(200)]
        public string AreaName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? AreaType { get; set; }

        [Required]
        [StringLength(50)]
        public string CleaningFrequency { get; set; } = string.Empty;

        public DateTime? LastCleanedDate { get; set; }

        [StringLength(200)]
        public string? LastCleanedBy { get; set; }

        public DateTime? NextScheduledCleaning { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        [StringLength(200)]
        public string? CleaningMethod { get; set; }

        public string? ProductsUsed { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}
