using System;
using System.Collections.Generic;

namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class MedicalRecordPrescriptionDto
    {
        public int Id { get; set; }
        public string Instructions { get; set; } = "";
        public DateTime PrescriptionDate { get; set; }
        public string Notes { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<PrescriptionItemDto> Items { get; set; } = new();
    }
}