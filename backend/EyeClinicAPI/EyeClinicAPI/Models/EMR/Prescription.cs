using System.ComponentModel.DataAnnotations;

namespace EyeClinicAPI.Models.EMR
{
    public class Prescription
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MedicalRecordId { get; set; }

        public string? Instructions { get; set; }
        public string? Notes { get; set; }
        public DateTime PrescriptionDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual MedicalRecord? MedicalRecord { get; set; }
        public virtual ICollection<PrescriptionItem> Items { get; set; } = new List<PrescriptionItem>();
    }
}