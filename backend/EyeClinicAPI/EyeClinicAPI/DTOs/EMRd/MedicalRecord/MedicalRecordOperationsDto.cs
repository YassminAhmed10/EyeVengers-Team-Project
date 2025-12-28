namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class MedicalRecordOperationsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string OperationName { get; set; } = "";
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
        public string Notes { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }
}