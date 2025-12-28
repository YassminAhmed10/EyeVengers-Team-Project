namespace EyeClinicAPI.DTOs.EMRd.Investigation
{
    public class CreateInvestigationRequest
    {
        public int MedicalRecordId { get; set; }
        public string SelectedInvestigations { get; set; } = "";
        public string Notes { get; set; } = "";
    }
}