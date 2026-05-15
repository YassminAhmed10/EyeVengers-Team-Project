using System.ComponentModel.DataAnnotations;

namespace RadiologyCenterAPI.Models
{
    public class RadiologyService
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Code { get; set; } = "";
        
        [Required]
        public string Display { get; set; } = "";
        
        public string Modality { get; set; } = "";
        public int DurationMin { get; set; } = 30;
        public decimal Price { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        
        public virtual ICollection<Slot> Slots { get; set; } = new List<Slot>();
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}