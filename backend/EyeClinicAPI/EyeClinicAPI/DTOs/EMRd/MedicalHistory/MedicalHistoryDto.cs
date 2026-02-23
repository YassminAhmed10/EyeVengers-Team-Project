namespace EyeClinicAPI.DTOs.EMRd.MedicalHistory
{
    public class MedicalHistoryDto
    {
        public int Id { get; set; }
        public int MedicalRecordId { get; set; }
        public string PreviousEye { get; set; } = "";
        public string FamilyHistory { get; set; } = "";
        public string Allergies { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsArchived { get; set; }
    }
}