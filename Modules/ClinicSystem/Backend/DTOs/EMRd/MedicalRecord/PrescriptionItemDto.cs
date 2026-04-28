namespace EyeClinicAPI.DTOs.MedicalRecord
{
    public class PrescriptionItemDto
    {
        public int Id { get; set; }
        public string Medication { get; set; } = string.Empty;
        public string Drug { get; set; } = string.Empty;
        public string Form { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Dose { get; set; } = string.Empty;
        public string CustomDose { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string CustomFrequency { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }
}
