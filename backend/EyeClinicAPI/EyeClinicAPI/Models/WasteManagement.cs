using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EyeClinicAPI.Models
{
    [Table("WasteManagement")]
    public class WasteManagement
    {
        [Key]
        public int WasteId { get; set; }

        [Required]
        [StringLength(100)]
        public string WasteType { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal? Quantity { get; set; }

        [StringLength(50)]
        public string? Unit { get; set; }

        public DateTime? GeneratedDate { get; set; }

        public DateTime? DisposalDate { get; set; }

        [StringLength(200)]
        public string? DisposalMethod { get; set; }

        [StringLength(200)]
        public string? DisposalCompany { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? Cost { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        [StringLength(200)]
        public string? CollectedBy { get; set; }

        [StringLength(100)]
        public string? CertificateNumber { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}
