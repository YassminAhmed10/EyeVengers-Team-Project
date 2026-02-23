namespace EyeClinicAPI.DTOs.EMRd.Prescription
{
    public class PrescriptionDto
    {
        public int Id { get; set; }
        public int MedicalRecordId { get; set; }
        public string Notes { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<PrescriptionItemDto> Items { get; set; } = new();
    }
}