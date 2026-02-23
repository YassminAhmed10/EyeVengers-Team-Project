using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EyeClinicAPI.Models
{
    [Table("MaintenanceTasks")]
    public class MaintenanceTasks
    {
        [Key]
        public int TaskId { get; set; }

        public int? EquipmentId { get; set; }

        [Required]
        [StringLength(100)]
        public string TaskType { get; set; } = string.Empty;

        public string? TaskDescription { get; set; }

        [StringLength(50)]
        public string? Priority { get; set; }

        public DateTime? ScheduledDate { get; set; }

        public DateTime? CompletedDate { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        [StringLength(200)]
        public string? AssignedTo { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? EstimatedCost { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? ActualCost { get; set; }

        [StringLength(200)]
        public string? ServiceProvider { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation property
        [ForeignKey("EquipmentId")]
        public Equipment? Equipment { get; set; }
    }
}
