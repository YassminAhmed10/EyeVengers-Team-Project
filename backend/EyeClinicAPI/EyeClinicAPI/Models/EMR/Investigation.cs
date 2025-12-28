using System.ComponentModel.DataAnnotations;

namespace EyeClinicAPI.Models.EMR
{
    public class Investigation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MedicalRecordId { get; set; }

        public string? TestName { get; set; }
        public string? Result { get; set; }
        public string? SelectedInvestigations { get; set; }
        public string? Notes { get; set; }
        public DateTime TestDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual MedicalRecord? MedicalRecord { get; set; }
    }
}