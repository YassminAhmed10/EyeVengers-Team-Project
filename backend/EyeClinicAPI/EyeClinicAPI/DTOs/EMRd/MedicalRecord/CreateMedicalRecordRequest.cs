// DTOs/EMRd/MedicalRecord/CreateMedicalRecordRequest.cs
namespace EyeClinicAPI.DTOs.EMRd.MedicalRecord
{
    public class CreateMedicalRecordRequest
    {
        public string PatientIdentifier { get; set; } = string.Empty;
    }
}