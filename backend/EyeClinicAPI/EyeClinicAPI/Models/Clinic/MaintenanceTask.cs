namespace EyeClinicAPI.Models.Clinic
{
    public class MaintenanceTask
    {
        public int Id { get; set; }
        public required string Task { get; set; }
        public required string Category { get; set; }
        public DateTime DueDate { get; set; }
        public required string Status { get; set; }
        public required string AssignedTo { get; set; }
        public required string Priority { get; set; }
        public DateTime? CompletedDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
