namespace EyeClinicAPI.DTOs.Complaints
{
    public class UpdatePatientComplaintRequest
    {
        public string OriginalText { get; set; } = "";
        public string TranslatedText { get; set; } = "";
    }
}
