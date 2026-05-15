using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadiologyCenterAPI.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int SlotId { get; set; }
        public int RadiologyServiceId { get; set; }
        public string Status { get; set; } = "Pending";
        public string InvestigationStatus { get; set; } = "Upcoming";
        public string? PractitionerRef { get; set; }
        public string Priority { get; set; } = "Routine";
        public string? Notes { get; set; }
        public string? AdminNotes { get; set; }
        public string? ConfirmationId { get; set; }
        public string? Hl7MessageId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        
        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; }
        
        [ForeignKey("SlotId")]
        public virtual Slot? Slot { get; set; }
        
        [ForeignKey("RadiologyServiceId")]
        public virtual RadiologyService? RadiologyService { get; set; }

        public virtual ICollection<RadiologyResult> Results { get; set; } = new List<RadiologyResult>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}