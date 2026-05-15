using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadiologyCenterAPI.Models
{
    public class RadiologyReport
    {
        [Key]
        public int Id { get; set; }
        
        public int AppointmentId { get; set; }
        public string ReportText { get; set; } = "";
        public string Findings { get; set; } = "";
        public string Conclusion { get; set; } = "";
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("AppointmentId")]
        public virtual Appointment? Appointment { get; set; }
    }
}