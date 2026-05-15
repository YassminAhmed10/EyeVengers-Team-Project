using RadiologyCenterAPI.Models;

namespace RadiologyCenterAPI.DTOs
{
    public class FhirBundleDto
    {
        public string ResourceType { get; set; } = "Bundle";
        public string Type { get; set; } = "transaction";
        public List<BundleEntryDto> Entry { get; set; } = new();
    }

    public class BundleEntryDto
    {
        public string FullUrl { get; set; } = "";
        public Dictionary<string, object> Resource { get; set; } = new();
    }

    public class PatientInfo
    {
        public string Identifier { get; set; } = "";
        public string IdentifierSystem { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Gender { get; set; } = "";
        public DateTime? BirthDate { get; set; }
        public string Phone { get; set; } = "";
        public string Email { get; set; } = "";
        public string Address { get; set; } = "";
        
        // ═════════════════════════════════════════════════════════════════
        // EMR INTEGRATION FIELDS — From ClinicSystem via FHIR
        // ═════════════════════════════════════════════════════════════════
        public string NationalId { get; set; } = "";
        public string InsuranceCompany { get; set; } = "";
        public string InsuranceId { get; set; } = "";
        public string InsurancePolicyNumber { get; set; } = "";
        public string EmergencyContactName { get; set; } = "";
        public string EmergencyContactPhone { get; set; } = "";
        public string EmergencyContactRelation { get; set; } = "";
    }

    public class ServiceRequestInfo
    {
        public string Code { get; set; } = "";
        public string CodeSystem { get; set; } = "";
        public string Display { get; set; } = "";
        public string Priority { get; set; } = "routine";
        public string PractitionerRef { get; set; } = "";
        public string Notes { get; set; } = "";
        public string Status { get; set; } = "active";
    }

    public class AppointmentInfo
    {
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string ServiceType { get; set; } = "";
        public string ServiceCode { get; set; } = "";
        public string Status { get; set; } = "pending";
    }

    public class ParsedBookingRequest
    {
        public PatientInfo Patient { get; set; } = new();
        public ServiceRequestInfo ServiceRequest { get; set; } = new();
        public AppointmentInfo Appointment { get; set; } = new();
    }

    public class BookingResult
    {
        public int AppointmentId { get; set; }
        public string ConfirmationId { get; set; } = "";
        public string Hl7MessageId { get; set; } = "";
        public Appointment? Appointment { get; set; }
    }

    public class RadiologyServiceDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = "";
        public string Display { get; set; } = "";
        public string Modality { get; set; } = "";
        public int DurationMin { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
    }

    public class SlotDto
    {
        public int Id { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Status { get; set; } = "";
    }

    public class AppointmentDto
    {
        public int Id { get; set; }
        public string PatientIdentifier { get; set; } = "";
        public string PatientName { get; set; } = "";
        public string ServiceName { get; set; } = "";
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Status { get; set; } = "";
        public string ConfirmationId { get; set; } = "";
    }


    public class AuditLogEntry
    {
        public string Action { get; set; } = "";
        public string? PatientIdentifier { get; set; }
        public int? AppointmentId { get; set; }
        public string? Hl7MessageId { get; set; }
        public long DurationMs { get; set; }
        public string? Details { get; set; }
    }
}