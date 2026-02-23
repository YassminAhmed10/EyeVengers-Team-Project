using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EyeClinicAPI.Models
{
    [Table("MedicalSupplies")]
    public class MedicalSupplies
    {
        [Key]
        public int SupplyId { get; set; }

        [Required]
        [StringLength(200)]
        public string SupplyName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Unit { get; set; }

        [Required]
        public int CurrentQuantity { get; set; }

        [Required]
        public int ReorderLevel { get; set; }

        public int? MaxStockLevel { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? UnitPrice { get; set; }

        [StringLength(200)]
        public string? Supplier { get; set; }

        [StringLength(100)]
        public string? SupplierContact { get; set; }

        public DateTime? LastRestockDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        [StringLength(100)]
        public string? BatchNumber { get; set; }

        [StringLength(100)]
        public string? StorageLocation { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}
