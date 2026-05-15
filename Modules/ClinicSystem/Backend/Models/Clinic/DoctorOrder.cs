using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EyeClinicAPI.Models.Clinic
{
    [Table("DoctorOrders")]
    public class DoctorOrder
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        // PatientIdentifier (P-XXXXXX) — THE primary patient ID
        [Column("PatientId")]
        [MaxLength(50)]
        public string PatientId { get; set; } = "";

        [Column("MedicalRecordId")]
        public int MedicalRecordId { get; set; }

        [Column("DoctorId")]
        public int DoctorId { get; set; }

        [Column("OrderType")]
        [MaxLength(50)]
        public string OrderType { get; set; } = "";

        [Column("DataJson")]
        public string DataJson { get; set; } = "";

        [Column("Status")]
        [MaxLength(50)]
        public string Status { get; set; } = "PendingPatientApproval";

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }

        [Column("RespondedAt")]
        public DateTime? RespondedAt { get; set; }

        [Column("RejectionReason")]
        [MaxLength(500)]
        public string? RejectionReason { get; set; }

        [Column("AppointmentDate")]
        public DateTime? AppointmentDate { get; set; }

        [Column("AppointmentTime")]
        [MaxLength(10)]
        public string? AppointmentTime { get; set; }

        [Column("ExternalSystemConfirmationId")]
        [MaxLength(100)]
        public string? ExternalSystemConfirmationId { get; set; }

        // ===== ADDITIONAL FIELDS FOR COMPLETE WORKFLOW =====

        /// <summary>
        /// When the patient accepted the order
        /// </summary>
        [Column("AcceptedAt")]
        public DateTime? AcceptedAt { get; set; }

        /// <summary>
        /// When the appointment was booked in radiology system
        /// </summary>
        [Column("BookedAt")]
        public DateTime? BookedAt { get; set; }

        /// <summary>
        /// When the investigation started
        /// </summary>
        [Column("InProgressAt")]
        public DateTime? InProgressAt { get; set; }

        /// <summary>
        /// When the investigation was completed
        /// </summary>
        [Column("CompletedAt")]
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// Last update timestamp
        /// </summary>
        [Column("UpdatedAt")]
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Radiology system appointment ID
        /// </summary>
        [Column("RadiologyAppointmentId")]
        [MaxLength(100)]
        public string? RadiologyAppointmentId { get; set; }

        /// <summary>
        /// Current status in radiology system (Confirmed, InProgress, Completed)
        /// </summary>
        [Column("RadiologyStatus")]
        [MaxLength(50)]
        public string? RadiologyStatus { get; set; }

        /// <summary>
        /// Doctor notes/recommendations
        /// </summary>
        [Column("DoctorNotes")]
        [MaxLength(2000)]
        public string? DoctorNotes { get; set; }

        /// <summary>
        /// Priority level (Routine, Urgent, Stat)
        /// </summary>
        [Column("Priority")]
        [MaxLength(20)]
        public string Priority { get; set; } = "Routine";

        /// <summary>
        /// Test code for HL7/FHIR mapping
        /// </summary>
        [Column("TestCode")]
        [MaxLength(50)]
        public string? TestCode { get; set; }

        /// <summary>
        /// Test name for display
        /// </summary>
        [Column("TestName")]
        [MaxLength(200)]
        public string? TestName { get; set; }

        /// <summary>
        /// HL7 message ID for tracking
        /// </summary>
        [Column("Hl7MessageId")]
        [MaxLength(100)]
        public string? Hl7MessageId { get; set; }

        /// <summary>
        /// FHIR Bundle ID for reference
        /// </summary>
        [Column("FhirBundleId")]
        [MaxLength(100)]
        public string? FhirBundleId { get; set; }

        // ===== NAVIGATION PROPERTIES =====

        [ForeignKey("DoctorId")]
        public virtual Doctor? Doctor { get; set; }

        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; }

        [ForeignKey("MedicalRecordId")]
        public virtual MedicalRecord? MedicalRecord { get; set; }
    }

    // Optional: Add a ViewModel for order status updates
    public class OrderStatusUpdateDto
    {
        public int OrderId { get; set; }
        public string Status { get; set; } = "";
        public string? RadiologyAppointmentId { get; set; }
        public DateTime? AppointmentDate { get; set; }
        public string? AppointmentTime { get; set; }
        public string? RadiologyBookingRef { get; set; }
        public string? Notes { get; set; }
    }

    // Optional: Add a ViewModel for radiology confirmation
    public class RadiologyConfirmationDto
    {
        public int OrderId { get; set; }
        public string RadiologyAppointmentId { get; set; } = "";
        public string BookingReference { get; set; } = "";
        public string AppointmentDate { get; set; } = "";
        public string AppointmentTime { get; set; } = "";
        public string Status { get; set; } = "Confirmed";
        public string? RadiologyNotes { get; set; }
    }

    // Optional: Add a ViewModel for order response
    public class OrderResponseViewModel
    {
        public int Id { get; set; }
        public string PatientId { get; set; } = "";
        public int MedicalRecordId { get; set; }
        public int DoctorId { get; set; }
        public string? DoctorName { get; set; }
        public string OrderType { get; set; } = "";
        public object? Data { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? BookedAt { get; set; }
        public DateTime? InProgressAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime? AppointmentDate { get; set; }
        public string? AppointmentTime { get; set; }
        public string? ExternalSystemConfirmationId { get; set; }
        public string? RadiologyAppointmentId { get; set; }
        public string? RadiologyStatus { get; set; }
        public string? Priority { get; set; }
        public string? TestName { get; set; }
    }
}