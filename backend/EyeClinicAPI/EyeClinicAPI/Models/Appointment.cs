using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EyeClinicAPI.Models
{
    public class Appointment
    {
        [Key]
        public int AppointmentId { get; set; }

        // Patient Basic Info
        [Required]
        [MaxLength(50)]
        public string PatientId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string PatientName { get; set; } = string.Empty;

        public PatientGender PatientGender { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        public DateTime? PatientBirthDate { get; set; }

        [MaxLength(3)]
        public string? Age { get; set; }

        [MaxLength(20)]
        public string? NationalId { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        // Appointment Details
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public int DurationMinutes { get; set; }
        public AppointmentStatus Status { get; set; }
        public bool IsSurgery { get; set; }
        
        [MaxLength(20)]
        public string AppointmentType { get; set; } = "offline"; // "online" or "offline"

        [MaxLength(200)]
        public string? ReasonForVisit { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        // Medical History
        [MaxLength(500)]
        public string? ChronicDiseases { get; set; }

        [MaxLength(500)]
        public string? CurrentMedications { get; set; }

        [MaxLength(500)]
        public string? OtherAllergies { get; set; }

        [MaxLength(500)]
        public string? VisionSymptoms { get; set; }

        [MaxLength(500)]
        public string? FamilyEyeDiseases { get; set; }

        [MaxLength(500)]
        public string? OtherFamilyDiseases { get; set; }

        [MaxLength(500)]
        public string? EyeAllergies { get; set; }

        [MaxLength(500)]
        public string? EyeSurgeries { get; set; }

        [MaxLength(500)]
        public string? OtherEyeSurgeries { get; set; }

        // Insurance Info
        [MaxLength(100)]
        public string? InsuranceCompany { get; set; }

        [MaxLength(50)]
        public string? InsuranceId { get; set; }

        [MaxLength(50)]
        public string? PolicyNumber { get; set; }

        [MaxLength(10)]
        public string? Coverage { get; set; }

        [MaxLength(50)]
        public string? CoverageType { get; set; }

        public DateTime? InsuranceExpiryDate { get; set; }

        [MaxLength(20)]
        public string? InsuranceContact { get; set; }

        // Payment Information
        [MaxLength(50)]
        public string? PaymentMethod { get; set; }

        [MaxLength(50)]
        public string? PaymentStatus { get; set; }

        public decimal? FinalPrice { get; set; }

        // Emergency Contact
        [MaxLength(100)]
        public string? EmergencyContactName { get; set; }

        [MaxLength(20)]
        public string? EmergencyContactPhone { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("DoctorId")]
        public virtual Doctor? Doctor { get; set; }
    }

    public enum PatientGender
    {
        Male = 0,
        Female = 1
    }
}