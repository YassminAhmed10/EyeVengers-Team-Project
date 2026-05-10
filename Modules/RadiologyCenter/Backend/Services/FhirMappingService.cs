using System.Text.Json;
using RadiologyCenterAPI.DTOs;
using RadiologyCenterAPI.Models;
using Microsoft.Extensions.Logging;

namespace RadiologyCenterAPI.Services
{
    public interface IFhirMappingService
    {
        ParsedBookingRequest BundleToInternal(FhirBundleDto bundle);
        string? Validate(ParsedBookingRequest parsed);
        object ServiceToFhir(RadiologyService service);
        object SlotToFhir(Slot slot);
        object AppointmentToFhir(Appointment appointment);
        object PatientToFhir(Patient patient);
        object DiagnosticReportToFhir(object report);
    }

    public class FhirMappingService : IFhirMappingService
    {
        private readonly ILogger<FhirMappingService> _logger;

        public FhirMappingService(ILogger<FhirMappingService> logger)
        {
            _logger = logger;
        }

        public ParsedBookingRequest BundleToInternal(FhirBundleDto bundle)
        {
            // ═════════════════════════════════════════════════════════════════════════════
            // FHIR BUNDLE RECEIVED — Eye Clinic → Radiology Center
            // ═════════════════════════════════════════════════════════════════════════════
            if (bundle?.Entry != null && bundle.Entry.Count > 0)
            {
                _logger.LogInformation("\n╔════════════════════════════════════════════════════════════════╗");
                _logger.LogInformation("║ FHIR BUNDLE RECEIVED - {Count} Entries", bundle.Entry.Count);
                _logger.LogInformation("║ Timestamp: {Time:yyyy-MM-dd HH:mm:ss.fff}", DateTime.Now);
                _logger.LogInformation("║ Direction: ← IN (Eye Clinic → Radiology Center)");
                _logger.LogInformation("╚════════════════════════════════════════════════════════════════╝\n");
            }

            var result = new ParsedBookingRequest();

            if (bundle?.Entry == null)
            {
                return result;
            }

            foreach (var entry in bundle.Entry)
            {
                if (entry.Resource == null) continue;
                
                if (!entry.Resource.TryGetValue("resourceType", out var typeObj)) continue;
                
                var resourceType = typeObj?.ToString();
                var json = JsonSerializer.Serialize(entry.Resource);

                switch (resourceType)
                {
                    case "Patient":
                        result.Patient = ParsePatient(json);
                        // Log PID segment
                        _logger.LogDebug("\\n[PID] Patient Identification Segment:\\n{PatientJson}", json);
                        break;
                    case "ServiceRequest":
                        result.ServiceRequest = ParseServiceRequest(json);
                        // Log Order Segment
                        _logger.LogDebug("\\n[OBR] Service Request Segment:\\n{RequestJson}", json);
                        break;
                    case "Appointment":
                        result.Appointment = ParseAppointment(json);
                        // Log Schedule Segment
                        _logger.LogDebug("\\n[SCH] Appointment Schedule Segment:\\n{AppointmentJson}", json);
                        break;
                }
            }

            return result;
        }

        private PatientInfo ParsePatient(string json)
        {
            var info = new PatientInfo();

            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (root.TryGetProperty("identifier", out var ids) && ids.GetArrayLength() > 0)
                {
                    var first = ids[0];
                    if (first.TryGetProperty("value", out var v))
                        info.Identifier = v.GetString() ?? "";
                }

                if (root.TryGetProperty("name", out var names) && names.GetArrayLength() > 0)
                {
                    var n = names[0];
                    if (n.TryGetProperty("family", out var fam)) 
                        info.LastName = fam.GetString() ?? "";
                    if (n.TryGetProperty("given", out var given) && given.GetArrayLength() > 0)
                        info.FirstName = given[0].GetString() ?? "";
                }

                if (root.TryGetProperty("gender", out var gender))
                    info.Gender = gender.GetString() ?? "";

                if (root.TryGetProperty("birthDate", out var bd) && DateTime.TryParse(bd.GetString(), out var bdDate))
                    info.BirthDate = bdDate;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error parsing patient JSON");
            }

            return info;
        }

        private ServiceRequestInfo ParseServiceRequest(string json)
        {
            var info = new ServiceRequestInfo();

            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (root.TryGetProperty("code", out var code) &&
                    code.TryGetProperty("coding", out var coding) && coding.GetArrayLength() > 0)
                {
                    var c = coding[0];
                    if (c.TryGetProperty("code", out var cc)) 
                        info.Code = cc.GetString() ?? "";
                    if (c.TryGetProperty("display", out var cd)) 
                        info.Display = cd.GetString() ?? "";
                }

                if (root.TryGetProperty("priority", out var p))
                    info.Priority = p.GetString() ?? "routine";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error parsing ServiceRequest JSON");
            }

            return info;
        }

        private AppointmentInfo ParseAppointment(string json)
        {
            var info = new AppointmentInfo();

            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (root.TryGetProperty("start", out var s) && DateTime.TryParse(s.GetString(), out var start))
                    info.Start = start;

                if (root.TryGetProperty("end", out var e) && DateTime.TryParse(e.GetString(), out var end))
                    info.End = end;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error parsing Appointment JSON");
            }

            return info;
        }

        public string? Validate(ParsedBookingRequest parsed)
        {
            if (parsed == null)
                return "Request is null";

            if (parsed.Patient == null)
                return "Patient information is required";

            if (string.IsNullOrWhiteSpace(parsed.Patient.Identifier))
                return "Patient.identifier is required";

            if (parsed.ServiceRequest == null)
                return "ServiceRequest information is required";

            if (string.IsNullOrWhiteSpace(parsed.ServiceRequest.Code))
                return "ServiceRequest.code is required";

            if (parsed.Appointment == null)
                return "Appointment information is required";

            if (parsed.Appointment.Start == default)
                return "Appointment.start is required";

            return null;
        }

        public object ServiceToFhir(RadiologyService s)
        {
            var result = new Dictionary<string, object>
            {
                ["resourceType"] = "HealthcareService",
                ["id"] = s.Id.ToString(),
                ["active"] = s.IsActive,
                ["name"] = s.Display
            };
            return result;
        }

        public object SlotToFhir(Slot s)
        {
            var result = new Dictionary<string, object>
            {
                ["resourceType"] = "Slot",
                ["id"] = s.Id.ToString(),
                ["status"] = s.Status,
                ["start"] = s.Start.ToString("o"),
                ["end"] = s.End.ToString("o")
            };
            return result;
        }

        public object AppointmentToFhir(Appointment a)
        {
            var participants = new object[]
            {
                new { actor = new { reference = $"Patient/{a.Patient?.Identifier ?? "unknown"}" }, status = "accepted" }
            };

            var result = new Dictionary<string, object>
            {
                ["resourceType"] = "Appointment",
                ["id"] = a.Id.ToString(),
                ["status"] = (a.Status?.ToLowerInvariant() == "confirmed") ? "booked" : (a.Status?.ToLowerInvariant() ?? "pending"),
                ["priority"] = a.Priority,
                ["participant"] = participants
            };

            if (a.Slot != null)
            {
                result["start"] = a.Slot.Start.ToString("o");
                result["end"] = a.Slot.End.ToString("o");
            }

            // Log SCH segment (Schedule/Appointment)
            var json = JsonSerializer.Serialize(result);
            _logger.LogInformation("\n╔════════════════════════════════════════════════════════════════╗");
            _logger.LogInformation("║ [SCH] APPOINTMENT/SCHEDULE SEGMENT - Outgoing");
            _logger.LogInformation("║ Direction: → OUT (Radiology Center → Eye Clinic)");
            _logger.LogInformation("║ Timestamp: {Time:yyyy-MM-dd HH:mm:ss.fff}", DateTime.Now);
            _logger.LogInformation("╠════════════════════════════════════════════════════════════════╣");
            _logger.LogInformation("║ {Json}", json);
            _logger.LogInformation("╚════════════════════════════════════════════════════════════════╝\n");

            return result;
        }

        public object PatientToFhir(Patient p)
        {
            var result = new Dictionary<string, object>
            {
                ["resourceType"] = "Patient",
                ["id"] = p.Identifier,
                ["name"] = new object[]
                {
                    new { family = p.LastName, given = new[] { p.FirstName } }
                }
            };

            // Log PID segment (Patient Identification)
            var json = JsonSerializer.Serialize(result);
            _logger.LogInformation("\n╔════════════════════════════════════════════════════════════════╗");
            _logger.LogInformation("║ [PID] PATIENT IDENTIFICATION SEGMENT - Outgoing");
            _logger.LogInformation("║ Direction: → OUT (Radiology Center → Eye Clinic)");
            _logger.LogInformation("║ Timestamp: {Time:yyyy-MM-dd HH:mm:ss.fff}", DateTime.Now);
            _logger.LogInformation("╠════════════════════════════════════════════════════════════════╣");
            _logger.LogInformation("║ Patient ID: {PatientId}", p.Identifier);
            _logger.LogInformation("║ Name: {Name}", $"{p.FirstName} {p.LastName}");
            _logger.LogInformation("║ {Json}", json);
            _logger.LogInformation("╚════════════════════════════════════════════════════════════════╝\n");

            return result;
        }

        public object DiagnosticReportToFhir(object report)
        {
            var result = new Dictionary<string, object>
            {
                ["resourceType"] = "DiagnosticReport",
                ["id"] = Guid.NewGuid().ToString(),
                ["status"] = "final",
                ["conclusion"] = "Radiology examination completed successfully"
            };
            return result;
        }
    }
}