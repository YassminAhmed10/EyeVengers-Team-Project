namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class MedicalRecordPatientDto
    {
        public int PatientId { get; set; }
        public string Name { get; set; } = "";
        public int? Age { get; set; }
        public string Gender { get; set; } = "";
        public string ContactNumber { get; set; } = "";
        public string Email { get; set; } = "";
        public string Address { get; set; } = "";
        public string InsuranceCompany { get; set; } = "";
        public DateTime? BirthDate { get; set; }
        public string NationalId { get; set; } = "";
        public string InsuranceId { get; set; } = "";
        public string PolicyNumber { get; set; } = "";
        public string Coverage { get; set; } = "";
        public string EmergencyContactName { get; set; } = "";
        public string EmergencyContactPhone { get; set; } = "";
    }
}
