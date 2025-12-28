using System.ComponentModel.DataAnnotations;

namespace EyeClinicAPI.Models.EMR
{
    public class PrescriptionItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PrescriptionId { get; set; }

        public string? Medication { get; set; }
        public string? Drug { get; set; }
        public string? Form { get; set; }
        public string? Dose { get; set; }
        public string? CustomDose { get; set; }
        public string? Dosage { get; set; }
        public string? Frequency { get; set; }
        public string? CustomFrequency { get; set; }
        public string? Duration { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual Prescription? Prescription { get; set; }
    }
}