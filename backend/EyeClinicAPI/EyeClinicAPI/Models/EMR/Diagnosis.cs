using System.ComponentModel.DataAnnotations;

namespace EyeClinicAPI.Models.EMR
{
    public class Diagnosis
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MedicalRecordId { get; set; }

        public string? DiagnosisText { get; set; }
        public string? DiagnosisName { get; set; }
        public string? ICD10Code { get; set; }
        public string? Status { get; set; }
        public string? Severity { get; set; }
        public string? Notes { get; set; }
        public DateTime CheckupDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual MedicalRecord? MedicalRecord { get; set; }
    }
}