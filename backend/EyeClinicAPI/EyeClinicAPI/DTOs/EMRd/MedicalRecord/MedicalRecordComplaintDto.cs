// DTOs/EMRd/MedicalRecord/MedicalRecordComplaintDto.cs
using System;

namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class MedicalRecordComplaintDto
    {
        public int Id { get; set; }
        public string Complaint { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}