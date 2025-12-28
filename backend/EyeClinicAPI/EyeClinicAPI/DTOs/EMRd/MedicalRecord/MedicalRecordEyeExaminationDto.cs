namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class MedicalRecordEyeExaminationDto
    {
        public int Id { get; set; }
        public int MedicalRecordId { get; set; }
        public string? VisualAcuity { get; set; }
        public string? IntraocularPressure { get; set; }
        public string? RightEye { get; set; }
        public string? LeftEye { get; set; }
        public string? EyePressure { get; set; }
        public string? PupilReaction { get; set; }
        public string? PupilReactionOther { get; set; }
        public string? EyeAlignment { get; set; }
        public string? EyeAlignmentOther { get; set; }
        public string? EyeMovements { get; set; }
        public string? EyeMovementsOther { get; set; }
        public string? AnteriorSegment { get; set; }
        public string? PosteriorSegment { get; set; }
        public string? FundusObservation { get; set; }
        public string? OtherNotes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}