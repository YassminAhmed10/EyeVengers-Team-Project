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
        
        [Column("PatientId")]
        public int PatientId { get; set; }
        
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
        
        // Navigation properties
        [ForeignKey("PatientId")]
        public virtual EMR.Patient? Patient { get; set; }
        
        [ForeignKey("DoctorId")]
        public virtual Doctor? Doctor { get; set; }
        
        [ForeignKey("MedicalRecordId")]
        public virtual EMR.MedicalRecord? MedicalRecord { get; set; }
    }
}