namespace EyeClinicAPI.Models.Clinic
{
    public class Equipment
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public DateTime LastMaintenance { get; set; }
        public DateTime NextMaintenance { get; set; }
        public string Location { get; set; }
        public string SerialNumber { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
