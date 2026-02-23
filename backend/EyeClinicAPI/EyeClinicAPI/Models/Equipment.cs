using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EyeClinicAPI.Models
{
    [Table("Equipment")]
    public class Equipment
    {
        [Key]
        public int EquipmentId { get; set; }

        [Required]
        [StringLength(200)]
        public string EquipmentName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string EquipmentType { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Manufacturer { get; set; }

        [StringLength(100)]
        public string? ModelNumber { get; set; }

        [StringLength(100)]
        public string? SerialNumber { get; set; }

        public DateTime? PurchaseDate { get; set; }

        public DateTime? WarrantyExpiryDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Working";

        [StringLength(100)]
        public string? Location { get; set; }

        public DateTime? LastMaintenanceDate { get; set; }

        public DateTime? NextMaintenanceDate { get; set; }

        public int? MaintenanceFrequencyDays { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation property
        public ICollection<MaintenanceTasks>? MaintenanceTasks { get; set; }
    }
}
