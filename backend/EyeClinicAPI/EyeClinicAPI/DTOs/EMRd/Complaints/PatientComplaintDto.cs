namespace EyeClinicAPI.DTOs.EMRd.Complaints
{
    public class PatientComplaintDto
    {
        public int Id { get; set; }
        public int MedicalRecordId { get; set; }
        public string OriginalText { get; set; } = "";
        public string? TranslatedText { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsArchived { get; set; }
        public string? PreviousText { get; set; }
    }
}