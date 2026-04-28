#nullable enable
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using EyeClinicAPI.Models.EMR;

namespace EyeClinicAPI.Models.EMR
{
    public class MedicalRecord
    {
        [Key]
        public int Id { get; set; }
        public int? PatientId { get; set; }
        [StringLength(100)]
        public string? PatientIdentifier { get; set; }
        public DateTime VisitDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public virtual Patient? Patient { get; set; }
        public virtual ICollection<PatientComplaint> PatientComplaints { get; set; } = new List<PatientComplaint>();
        public virtual ICollection<MedicalHistory> MedicalHistories { get; set; } = new List<MedicalHistory>();
        public virtual ICollection<PatientComplaint> Complaints { get; set; } = new List<PatientComplaint>();
        public virtual ICollection<MedicalHistory> Histories { get; set; } = new List<MedicalHistory>();
        public virtual ICollection<Investigation> Investigations { get; set; } = new List<Investigation>();
        public virtual ICollection<EyeExamination> EyeExaminations { get; set; } = new List<EyeExamination>();
        public virtual ICollection<Operation> Operations { get; set; } = new List<Operation>();
        public virtual ICollection<MedicalTestFile> MedicalTestFiles { get; set; } = new List<MedicalTestFile>();
        public virtual ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
        public virtual ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();
    }
}
