using System.ComponentModel.DataAnnotations;

namespace RadiologyCenterAPI.Models
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }
        
        public string Action { get; set; } = "";
        public string? PatientIdentifier { get; set; }
        public int? AppointmentId { get; set; }
        public string? Hl7MessageId { get; set; }
        public long DurationMs { get; set; }
        public string? UserId { get; set; }
        public string? IpAddress { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? Details { get; set; }
    }
}