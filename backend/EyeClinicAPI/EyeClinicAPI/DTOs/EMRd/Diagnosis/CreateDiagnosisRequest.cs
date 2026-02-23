namespace EyeClinicAPI.DTOs.EMRd.Diagnosis
{
    public class CreateDiagnosisRequest
    {
        public int MedicalRecordId { get; set; }
        public string DiagnosisName { get; set; } = "";
        public string Status { get; set; } = "";
        public string Severity { get; set; } = "";
        public string Notes { get; set; } = "";
        public DateTime? CheckupDate { get; set; }
    }
}
