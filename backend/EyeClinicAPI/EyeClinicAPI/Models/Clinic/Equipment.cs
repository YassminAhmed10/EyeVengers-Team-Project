namespace EyeClinicAPI.Models.Clinic
{
    public class Equipment
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Type { get; set; }
        public required string Status { get; set; }
        public DateTime LastMaintenance { get; set; }
        public DateTime NextMaintenance { get; set; }
        public required string Location { get; set; }
        public required string SerialNumber { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
