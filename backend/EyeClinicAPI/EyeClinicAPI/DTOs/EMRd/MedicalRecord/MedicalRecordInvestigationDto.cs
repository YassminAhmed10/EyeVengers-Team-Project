// DTOs/EMRd/MedicalRecord/MedicalRecordInvestigationDto.cs
using System;

namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class MedicalRecordInvestigationDto
    {
        public int Id { get; set; }
        public string TestName { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
        public string SelectedInvestigations { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}