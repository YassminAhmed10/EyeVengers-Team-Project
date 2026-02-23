namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class MedicalTestFileDto
    {
        public int Id { get; set; }
        public int MedicalRecordId { get; set; }
        public string FileName { get; set; } = "";
        public string FilePath { get; set; } = "";
        public string FileUrl { get; set; } = "";
        public string FileType { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }
}