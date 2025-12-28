using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EyeClinicAPI.Models
{
    public class Doctor
    {
        [Key]
        public int DoctorId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Specialization { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required]
        public string Gender { get; set; } = string.Empty;

        public int YearsOfExperience { get; set; }

        [MaxLength(500)]
        public string? Qualifications { get; set; }

        [MaxLength(200)]
        public string? ClinicAddress { get; set; }

        [MaxLength(20)]
        public string? EmergencyContact { get; set; }

        public bool IsAvailable { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Appointment>? Appointments { get; set; }
        public virtual ICollection<DoctorSchedule>? Schedules { get; set; }
    }
}