using System.ComponentModel.DataAnnotations;

namespace EyeClinicAPI.Models.EMR
{
    public class MedicalHistory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MedicalRecordId { get; set; }

        public string? PastMedicalHistory { get; set; }
        public string? FamilyHistory { get; set; }
        public string? Allergies { get; set; }
        public string? PreviousEye { get; set; }

        // Additional medical history fields
        public string? EyeSurgeries { get; set; }
        public string? VisionSymptoms { get; set; }
        public string? ChronicDiseases { get; set; }
        public string? CurrentMedications { get; set; }
        public string? FamilyEyeDiseases { get; set; }

        public bool IsArchived { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual MedicalRecord? MedicalRecord { get; set; }
    }
}