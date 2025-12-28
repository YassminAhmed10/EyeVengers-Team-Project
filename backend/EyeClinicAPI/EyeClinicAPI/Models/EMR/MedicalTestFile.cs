using System.ComponentModel.DataAnnotations;

namespace EyeClinicAPI.Models.EMR
{
    public class MedicalTestFile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MedicalRecordId { get; set; }

        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public string? FileUrl { get; set; }
        public string? FileType { get; set; }
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual MedicalRecord? MedicalRecord { get; set; }
    }
}