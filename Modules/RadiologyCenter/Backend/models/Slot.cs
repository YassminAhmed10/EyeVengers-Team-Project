using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadiologyCenterAPI.Models
{
    public class Slot
    {
        [Key]
        public int Id { get; set; }
        
        public int RadiologyServiceId { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Status { get; set; } = "free";
        public int? AppointmentId { get; set; }
        
        [ForeignKey("RadiologyServiceId")]
        public virtual RadiologyService? RadiologyService { get; set; }
        
        [ForeignKey("AppointmentId")]
        public virtual Appointment? Appointment { get; set; }
    }
}