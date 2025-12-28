namespace EyeClinicAPI.DTOs.EMRd.Prescription
{
    public class CreatePrescriptionRequest
    {
        public int MedicalRecordId { get; set; }
        public string Notes { get; set; } = "";
        public List<PrescriptionItemDto> Items { get; set; } = new();
    }
}