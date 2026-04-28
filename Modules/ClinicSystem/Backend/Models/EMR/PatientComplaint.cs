using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable enable
namespace EyeClinicAPI.Models.EMR
{
    public class PatientComplaint
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MedicalRecordId { get; set; }

        [ForeignKey("MedicalRecordId")]
        public virtual MedicalRecord? MedicalRecord { get; set; }

        public string Complaint { get; set; } = string.Empty;
        public string? Duration { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsArchived { get; set; }

        public string? OriginalText { get; set; }
        public string? TranslatedText { get; set; }
        public string? PreviousText { get; set; }
    }
}

