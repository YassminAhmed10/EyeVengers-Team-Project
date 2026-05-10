using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RadiologyCenterAPI.Models
{
    public class Patient
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Identifier { get; set; } = "";
        
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Gender { get; set; } = "";
        public DateTime? BirthDate { get; set; }
        public string Phone { get; set; } = "";
        public string Email { get; set; } = "";
        public string Address { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }

    public class RadiologyService
    {
        [Key]
        public int Id { get; set; }
        public string Code { get; set; } = "";
        public string Display { get; set; } = "";
        public string Modality { get; set; } = "";
        public int DurationMin { get; set; } = 30;
        public decimal Price { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        
        public virtual ICollection<Slot> Slots { get; set; } = new List<Slot>();
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }

    public class Slot
    {
        [Key]
        public int Id { get; set; }
        public int RadiologyServiceId { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Status { get; set; } = "free";
        public int? AppointmentId { get; set; }
        
        [ForeignKey("RadiologyServiceId")]
        public virtual RadiologyService? RadiologyService { get; set; }
        
        [ForeignKey("AppointmentId")]
        public virtual Appointment? Appointment { get; set; }
    }

    public class Appointment
    {
        [Key]
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int SlotId { get; set; }
        public int RadiologyServiceId { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected, Completed
        public string InvestigationStatus { get; set; } = "Upcoming"; // Upcoming, In Progress, Done
        public string? PractitionerRef { get; set; }
        public string Priority { get; set; } = "Routine";
        public string? Notes { get; set; }
        public string? AdminNotes { get; set; }
        public string? ConfirmationId { get; set; }
        public string? Hl7MessageId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        
        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; }
        
        [ForeignKey("SlotId")]
        public virtual Slot? Slot { get; set; }
        
        [ForeignKey("RadiologyServiceId")]
        public virtual RadiologyService? RadiologyService { get; set; }

        public virtual ICollection<RadiologyResult> Results { get; set; } = new List<RadiologyResult>();
    }

    public class RadiologyResult
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int AppointmentId { get; set; }
        
        public string ReportTitle { get; set; } = "";
        public string ReportText { get; set; } = "";
        public string Findings { get; set; } = "";
        public string Conclusion { get; set; } = "";
        
        // Image storage
        public string? ImageFileName { get; set; }
        public string? ImagePath { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImageMimeType { get; set; }
        public long? ImageFileSize { get; set; }
        
        // PDF Report
        public string? ReportFileName { get; set; }
        public string? ReportPath { get; set; }
        public string? ReportUrl { get; set; }
        public long? ReportFileSize { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        [ForeignKey("AppointmentId")]
        public virtual Appointment? Appointment { get; set; }
    }

    public class RadiologyReport
    {
        [Key]
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public string ReportText { get; set; } = "";
        public string Findings { get; set; } = "";
        public string Conclusion { get; set; } = "";
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("AppointmentId")]
        public virtual Appointment? Appointment { get; set; }
    }

    public class Notification
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int PatientId { get; set; }
        
        public string Title { get; set; } = "";
        public string Message { get; set; } = "";
        public string Type { get; set; } = ""; // appointment_accepted, appointment_rejected, status_update, result_uploaded
        public int? AppointmentId { get; set; }
        public int? ResultId { get; set; }
        
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
        
        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; }
        
        [ForeignKey("AppointmentId")]
        public virtual Appointment? Appointment { get; set; }
        
        [ForeignKey("ResultId")]
        public virtual RadiologyResult? Result { get; set; }
    }


    public class AuditLog
    {
        public int Id { get; set; }
        public string Action { get; set; } = "";
        public string? PatientIdentifier { get; set; }
        public int? AppointmentId { get; set; }
        public string? Hl7MessageId { get; set; }
        public long DurationMs { get; set; }
        public string? UserId { get; set; }
        public string? IpAddress { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? Details { get; set; }
    }

    public class PatientStats
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int PatientId { get; set; }
        
        public int ScansCount { get; set; } = 0;
        public int AppointmentsCount { get; set; } = 0;
        public int ReportsCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; }
    }
}