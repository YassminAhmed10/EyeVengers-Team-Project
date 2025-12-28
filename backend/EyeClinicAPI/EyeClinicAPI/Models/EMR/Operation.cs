using System.ComponentModel.DataAnnotations;

namespace EyeClinicAPI.Models.EMR
{
    public class Operation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MedicalRecordId { get; set; }

        public string Name { get; set; } = "";
        public string OperationName { get; set; } = "";
        public DateTime Date { get; set; }
        public string Eye { get; set; } = "";
        public string Surgeon { get; set; } = "";
        public string Diagnosis { get; set; } = "";
        public string PreMedications { get; set; } = "";
        public string SpecialInstructions { get; set; } = "";
        public string PostMedications { get; set; } = "";
        public string FollowUp { get; set; } = "";
        public string Complications { get; set; } = "";
        public string Status { get; set; } = "";
        public string Anesthesia { get; set; } = "";
        public string Duration { get; set; } = "";
        public string Notes { get; set; } = "";
        public bool IsArchived { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual MedicalRecord? MedicalRecord { get; set; }
    }
}