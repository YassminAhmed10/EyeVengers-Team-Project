namespace EyeClinicAPI.Models.Clinic
{
    public class Sanitization
    {
        public int Id { get; set; }
        public string Area { get; set; }
        public string Frequency { get; set; }
        public DateTime LastCleaned { get; set; }
        public DateTime NextCleaning { get; set; }
        public string Status { get; set; }
        public string CleanedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
