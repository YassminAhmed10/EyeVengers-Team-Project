using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EyeClinicAPI.Models.Clinic
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        public int Id { get; set; }
        
        public int PatientId { get; set; }
        
        [MaxLength(200)]
        public string Title { get; set; } = "";
        
        [MaxLength(500)]
        public string Message { get; set; } = "";
        
        [MaxLength(50)]
        public string Type { get; set; } = "";
        
        public bool IsRead { get; set; }
        
        public int? RelatedId { get; set; }
        
        public DateTime CreatedAt { get; set; }
    }
}

