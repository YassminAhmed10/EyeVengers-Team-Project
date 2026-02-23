// JavaScript source code
// DTOs/EMRd/MedicalRecord/CreateMedicalRecordFromAppointmentRequest.cs
using System;

namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class CreateMedicalRecordFromAppointmentRequest
    {
        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public DateTime? AppointmentDate { get; set; }
    }
}