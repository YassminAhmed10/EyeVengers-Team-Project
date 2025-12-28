namespace EyeClinicAPI.DTOs.EMRd.MedicalHistory
{
    public class CreateMedicalHistoryRequest
    {
        public int MedicalRecordId { get; set; }
        public string PreviousEye { get; set; } = "";
        public string FamilyHistory { get; set; } = "";
        public string Allergies { get; set; } = "";
    }
}