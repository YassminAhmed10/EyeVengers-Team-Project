namespace EyeClinicAPI.DTOs.EMRd.Complaints
{
    public class CreatePatientComplaintRequest
    {
        public int MedicalRecordId { get; set; }
        public string OriginalText { get; set; } = "";
        // TranslatedText can be generated/processed later
        public string? TranslatedText { get; set; }
    }
}