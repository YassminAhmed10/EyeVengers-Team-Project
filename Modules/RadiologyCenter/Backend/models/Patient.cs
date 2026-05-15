using System.ComponentModel.DataAnnotations;

namespace RadiologyCenterAPI.Models
{
    public class Patient
    {
        [Key]
        public int Id { get; set; }
        public string Identifier { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Gender { get; set; } = "";
        public DateTime? BirthDate { get; set; }
        public string Address { get; set; } = "";
        public string NationalId { get; set; } = "";
        public string InsuranceCompany { get; set; } = "";
        public string InsuranceId { get; set; } = "";
        public string InsurancePolicyNumber { get; set; } = "";
        public string EmergencyContactName { get; set; } = "";
        public string EmergencyContactPhone { get; set; } = "";
        public string EmergencyContactRelation { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}