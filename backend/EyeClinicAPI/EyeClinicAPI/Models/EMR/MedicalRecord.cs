// Models/EMR/MedicalRecords.cs
#nullable enable
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EyeClinicAPI.Models.EMR
{
    public class MedicalRecord
    {
        [Key]
        public int Id { get; set; }

        // ✅ مش Required تاني — لأن ممكن نستخدم PatientIdentifier بدله
        public int? PatientId { get; set; }

        [StringLength(100)]
        public string? PatientIdentifier { get; set; }

        public DateTime VisitDate { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public MedicalRecord()
        {
            Complaints = new List<PatientComplaint>();
            Histories = new List<MedicalHistory>();
            Investigations = new List<Investigation>();
            EyeExaminations = new List<EyeExamination>();
            Operations = new List<Operation>();
            MedicalTestFiles = new List<MedicalTestFile>();
            Prescriptions = new List<Prescription>();
            Diagnoses = new List<Diagnosis>();
        }

        public virtual ICollection<PatientComplaint> Complaints { get; set; }
        public virtual ICollection<MedicalHistory> Histories { get; set; }
        public virtual ICollection<Investigation> Investigations { get; set; }
        public virtual ICollection<EyeExamination> EyeExaminations { get; set; }
        public virtual ICollection<Operation> Operations { get; set; }
        public virtual ICollection<MedicalTestFile> MedicalTestFiles { get; set; }
        public virtual ICollection<Prescription> Prescriptions { get; set; }
        public virtual ICollection<Diagnosis> Diagnoses { get; set; }
    }
}