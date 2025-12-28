namespace EyeClinicAPI.DTOs.EMRd.Prescription
{
    public class PrescriptionItemDto
    {
        public int Id { get; set; }  // ADD THIS LINE
        public string Drug { get; set; } = "";
        public string Form { get; set; } = "";
        public string Dose { get; set; } = "";
        public string? CustomDose { get; set; }
        public string Frequency { get; set; } = "";
        public string? CustomFrequency { get; set; }
        public string Notes { get; set; } = "";
    }
}