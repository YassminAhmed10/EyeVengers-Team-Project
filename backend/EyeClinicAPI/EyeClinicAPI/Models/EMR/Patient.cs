// Models/EMR/Patient.cs
namespace EyeClinicAPI.Models.EMR
{
    public class Patient
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public required string Gender { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public required string Address { get; set; }
        public required string NationalId { get; set; }
        public required string InsuranceCompany { get; set; }
        public required string InsuranceId { get; set; }
        public required string EmergencyContactName { get; set; }
        public required string EmergencyContactPhone { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    }
}