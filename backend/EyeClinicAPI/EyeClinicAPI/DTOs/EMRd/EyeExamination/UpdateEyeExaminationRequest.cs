namespace EyeClinicAPI.DTOs.EMRd.EyeExamination
{
    public class UpdateEyeExaminationRequest
    {
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
        public string? FundusObservation { get; set; }
        public string? OtherNotes { get; set; }
    }
}