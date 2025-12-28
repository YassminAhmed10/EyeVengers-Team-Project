namespace EyeClinicAPI.DTOs.EMRd.Operations
{
    public class CreateOperationRequest
    {
        public int MedicalRecordId { get; set; }
        public string Name { get; set; } = "";
        public DateTime Date { get; set; }
        public string Eye { get; set; } = "";
        public string Surgeon { get; set; } = "";
        public string Diagnosis { get; set; } = "";
        public string PreMedications { get; set; } = "";
        public string SpecialInstructions { get; set; } = "";
        public string PostMedications { get; set; } = "";
        public string FollowUp { get; set; } = "";
        public string Complications { get; set; } = "";
        public string Status { get; set; } = "";
        public string Anesthesia { get; set; } = "";
        public string Duration { get; set; } = "";
    }
}