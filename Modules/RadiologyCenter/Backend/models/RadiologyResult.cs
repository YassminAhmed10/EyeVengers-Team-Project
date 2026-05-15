using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadiologyCenterAPI.Models
{
    public class RadiologyResult
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int AppointmentId { get; set; }
        
        public string ReportTitle { get; set; } = "";
        public string ReportText { get; set; } = "";
        public string Findings { get; set; } = "";
        public string Conclusion { get; set; } = "";
        
        public string? ImageFileName { get; set; }
        public string? ImagePath { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImageMimeType { get; set; }
        public long? ImageFileSize { get; set; }
        
        public string? ReportFileName { get; set; }
        public string? ReportPath { get; set; }
        public string? ReportUrl { get; set; }
        public long? ReportFileSize { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        [ForeignKey("AppointmentId")]
        public virtual Appointment? Appointment { get; set; }
    }
}