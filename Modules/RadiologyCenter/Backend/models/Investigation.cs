// Models/Investigation.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadiologyCenterAPI.Models
{
    public class Investigation
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int AppointmentId { get; set; }
        
        public string InvestigationType { get; set; } = "";
        public string Status { get; set; } = "Active";
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public string? Notes { get; set; }
        public string? AdminNotes { get; set; }
        
        [ForeignKey("AppointmentId")]
        public virtual Appointment? Appointment { get; set; }
        
        public virtual ICollection<InvestigationFile> Files { get; set; } = new List<InvestigationFile>();
    }
    
    public class InvestigationFile
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int InvestigationId { get; set; }
        
        public string FileName { get; set; } = "";
        public string OriginalFileName { get; set; } = "";
        public string FileType { get; set; } = "";
        public string FilePath { get; set; } = "";
        public string FileUrl { get; set; } = "";
        public long FileSize { get; set; }
        public string? MimeType { get; set; }
        
        // FHIR Resource types
        public string FhirResourceType { get; set; } = ""; // DiagnosticReport, ImagingStudy, DocumentReference
        public string? FhirResourceId { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public int UploadedBy { get; set; } // Admin user ID
        
        [ForeignKey("InvestigationId")]
        public virtual Investigation? Investigation { get; set; }
    }
}