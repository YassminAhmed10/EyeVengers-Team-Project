namespace EyeClinicAPI.DTOs.EMRd.MedicalHistory
{
    public class UpdateMedicalHistoryRequest
    {
        public string PreviousEye { get; set; } = "";
        public string FamilyHistory { get; set; } = "";
        public string Allergies { get; set; } = "";
    }
}