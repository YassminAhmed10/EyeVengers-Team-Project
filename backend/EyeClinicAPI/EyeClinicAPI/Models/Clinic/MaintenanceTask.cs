namespace EyeClinicAPI.Models.Clinic
{
    public class MaintenanceTask
    {
        public int Id { get; set; }
        public string Task { get; set; }
        public string Category { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; }
        public string AssignedTo { get; set; }
        public string Priority { get; set; }
        public DateTime? CompletedDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
