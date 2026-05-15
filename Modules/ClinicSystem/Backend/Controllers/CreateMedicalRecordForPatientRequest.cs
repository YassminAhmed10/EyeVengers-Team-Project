using System.Text.Json.Serialization;

namespace EyeClinicAPI.Modules.ClinicSystem.Controllers
{
    /// <summary>
    /// Response model for creating a medical record
    /// </summary>
    public class CreateMedicalRecordForPatientResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }
        
        [JsonPropertyName("recordId")]
        public int? RecordId { get; set; }
        
        [JsonPropertyName("patientIdentifier")]
        public string? PatientIdentifier { get; set; }
        
        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }
}