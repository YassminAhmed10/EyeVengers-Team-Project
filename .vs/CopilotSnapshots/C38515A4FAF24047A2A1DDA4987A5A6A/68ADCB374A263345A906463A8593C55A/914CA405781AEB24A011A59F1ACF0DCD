using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EyeClinicAPI.Models
{
    public enum PatientGender
    {
        Male = 0,
        Female = 1
    }

    public class Appointment
    {
        [Key]
        public int AppointmentId { get; set; }

        [Required]
        public int DoctorId { get; set; }

        [Required]
        [StringLength(100)]
        public string PatientName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string PatientId { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(100)]
    public string? Email { get; set; }

    [StringLength(200)]
    public string? Address { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }        [Required]
        public TimeSpan AppointmentTime { get; set; }

        public int DurationMinutes { get; set; } = 30;

        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Upcoming;

        public bool IsSurgery { get; set; } = false;

        [StringLength(500)]
        public string? Notes { get; set; }

        [StringLength(200)]
        public string? ReasonForVisit { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public PatientGender PatientGender { get; set; } = PatientGender.Male;

        public DateTime? PatientBirthDate { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation Property
        [ForeignKey("DoctorId")]
        public Doctor? Doctor { get; set; }

        // Calculated property for Age
        [NotMapped]
        public int? Age
        {
            get
            {
                if (!PatientBirthDate.HasValue) return null;
                var today = DateTime.Today;
                var age = today.Year - PatientBirthDate.Value.Year;
                if (PatientBirthDate.Value.Date > today.AddYears(-age)) age--;
                return age;
            }
        }
    }
}