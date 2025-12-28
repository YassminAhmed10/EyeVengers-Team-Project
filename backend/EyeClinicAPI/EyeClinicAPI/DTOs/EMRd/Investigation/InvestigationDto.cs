namespace EyeClinicAPI.DTOs.EMRd.Investigation
{
    public class InvestigationDto
    {
        public int Id { get; set; }
        public int MedicalRecordId { get; set; }
        public string SelectedInvestigations { get; set; } = "";
        public string Notes { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}