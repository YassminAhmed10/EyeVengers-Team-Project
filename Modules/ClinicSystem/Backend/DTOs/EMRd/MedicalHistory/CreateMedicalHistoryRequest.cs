namespace EyeClinicAPI.DTOs.MedicalHistory
{
    public class CreateMedicalHistoryRequest
    {
        public int MedicalRecordId { get; set; }
        public string PreviousEye { get; set; } = "";
        public string FamilyHistory { get; set; } = "";
        public string Allergies { get; set; } = "";
        public string EyeSurgeries { get; set; } = "";
        public string VisionSymptoms { get; set; } = "";
        public string ChronicDiseases { get; set; } = "";
        public string CurrentMedications { get; set; } = "";
        public string FamilyEyeDiseases { get; set; } = "";
    }
}
