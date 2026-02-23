namespace EyeClinicAPI.Models.Clinic
{
    public class Sanitization
    {
        public int Id { get; set; }
        public required string Area { get; set; }
        public required string Frequency { get; set; }
        public DateTime LastCleaned { get; set; }
        public DateTime NextCleaning { get; set; }
        public required string Status { get; set; }
        public required string CleanedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
