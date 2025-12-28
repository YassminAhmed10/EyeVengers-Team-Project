// DTOs/EMRd/MedicalRecord/MedicalRecordHistoryDto.cs
using System;

namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class MedicalRecordHistoryDto
    {
        public int Id { get; set; }
        public string PastMedicalHistory { get; set; } = string.Empty;
        public string FamilyHistory { get; set; } = string.Empty;
        public string Allergies { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}