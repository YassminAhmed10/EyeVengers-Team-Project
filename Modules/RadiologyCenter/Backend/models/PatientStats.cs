using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadiologyCenterAPI.Models
{
    public class PatientStats
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int PatientId { get; set; }
        
        public int ScansCount { get; set; } = 0;
        public int AppointmentsCount { get; set; } = 0;
        public int ReportsCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; }
    }
}