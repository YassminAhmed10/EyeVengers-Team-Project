namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class MedicalRecordDto
    {
        public int PatientId { get; set; }
        public DateTime VisitDate { get; set; }  // ADD THIS LINE
        public List<MedicalRecordComplaintDto> Complaints { get; set; } = new();
        public List<MedicalRecordHistoryDto> Histories { get; set; } = new();
        public List<MedicalRecordInvestigationDto> Investigations { get; set; } = new();
        public List<MedicalRecordEyeExaminationDto> EyeExaminations { get; set; } = new();
        public List<MedicalRecordOperationsDto> Operations { get; set; } = new();
        public List<MedicalTestFileDto> MedicalTestFiles { get; set; } = new();
        public List<MedicalRecordPrescriptionDto> Prescriptions { get; set; } = new();
        public List<MedicalRecordDiagnosisDto> Diagnoses { get; set; } = new();
    }
}