namespace EyeClinicAPI.DTOs.EMRd.TestImages
{
    public class UploadMedicalTestFileDto
    {
        public int MedicalRecordId { get; set; }
        public IFormFile File { get; set; } = null!;
    }
}