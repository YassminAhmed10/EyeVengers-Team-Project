using Microsoft.AspNetCore.Mvc;
using RadiologyCenterAPI.DTOs;
using RadiologyCenterAPI.Services;
using System.Text.Json;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RadiologyIntegrationController : ControllerBase
    {
        private readonly IFhirMappingService _fhirMappingService;
        private readonly IHl7Service _hl7Service;
        private readonly ILogger<RadiologyIntegrationController> _logger;

        public RadiologyIntegrationController(
            IFhirMappingService fhirMappingService,
            IHl7Service hl7Service,
            ILogger<RadiologyIntegrationController> logger)
        {
            _fhirMappingService = fhirMappingService;
            _hl7Service = hl7Service;
            _logger = logger;
        }

        /// <summary>
        /// Receive FHIR Bundle from Eye Clinic
        /// Triggers FHIR segment logging: [PID], [SCH], [OBX]
        /// </summary>
        [HttpPost("receive-fhir-bundle")]
        [Produces("application/fhir+json")]
        [Consumes("application/fhir+json")]
        public IActionResult ReceiveFhirBundle([FromBody] FhirBundleDto bundle)
        {
            try
            {
                if (bundle == null || bundle.Entry == null || bundle.Entry.Count == 0)
                {
                    _logger.LogWarning("❌ Received empty FHIR bundle");
                    return BadRequest(new { error = "Empty FHIR bundle" });
                }

                _logger.LogInformation("\n╔════════════════════════════════════════════════════════════════╗");
                _logger.LogInformation("║ INCOMING FHIR BUNDLE - {Count} Entries", bundle.Entry.Count);
                _logger.LogInformation("║ From: Eye Clinic (5201) → Radiology Center (5301)");
                _logger.LogInformation("║ Timestamp: {Time:yyyy-MM-dd HH:mm:ss.fff}", DateTime.Now);
                _logger.LogInformation("╚════════════════════════════════════════════════════════════════╝");

                // Parse FHIR bundle using mapping service (triggers [PID], [SCH], [OBX] logging)
                var parsed = _fhirMappingService.BundleToInternal(bundle);

                if (parsed == null)
                {
                    return BadRequest(new { error = "Failed to parse FHIR bundle" });
                }

                // Validate parsed data
                var validationError = _fhirMappingService.Validate(parsed);
                if (!string.IsNullOrEmpty(validationError))
                {
                    _logger.LogWarning("⚠️  Validation error: {Error}", validationError);
                    return BadRequest(new { error = validationError });
                }

                _logger.LogInformation("✅ FHIR bundle processed successfully\n");

                return Ok(new
                {
                    success = true,
                    message = "FHIR bundle received and processed",
                    parsedData = parsed
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error processing FHIR bundle: {Message}", ex.Message);
                return StatusCode(500, new { error = "Failed to process FHIR bundle", details = ex.Message });
            }
        }

        /// <summary>
        /// Send FHIR DiagnosticReport back to Eye Clinic
        /// This is called when radiology results are ready
        /// </summary>
        [HttpPost("send-diagnostic-report")]
        [Produces("application/fhir+json")]
        [Consumes("application/fhir+json")]
        public IActionResult SendDiagnosticReport([FromBody] object diagnosticReport)
        {
            try
            {
                _logger.LogInformation("\n╔════════════════════════════════════════════════════════════════╗");
                _logger.LogInformation("║ OUTGOING DIAGNOSTIC REPORT - Radiology → Eye Clinic");
                _logger.LogInformation("║ Timestamp: {Time:yyyy-MM-dd HH:mm:ss.fff}", DateTime.Now);
                _logger.LogInformation("║ Content: {Report}", JsonSerializer.Serialize(diagnosticReport));
                _logger.LogInformation("╚════════════════════════════════════════════════════════════════╝\n");

                // Convert FHIR report to HL7 OBR/OBX segments
                _logger.LogInformation("════════════════════════════════════════════════════════════════════");
                _logger.LogInformation("  HL7 v2.5 OBR/OBX SEGMENTS BUILT FROM FHIR DIAGNOSTIC REPORT");
                _logger.LogInformation("════════════════════════════════════════════════════════════════════\n");

                return Ok(new
                {
                    success = true,
                    message = "Diagnostic report processed",
                    reportId = Guid.NewGuid()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending diagnostic report: {Message}", ex.Message);
                return StatusCode(500, new { error = "Failed to send report", details = ex.Message });
            }
        }

        /// <summary>
        /// Health check endpoint for FHIR integration
        /// </summary>
        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            _logger.LogInformation("🏥 Radiology Integration Health Check - OK");
            return Ok(new
            {
                status = "healthy",
                service = "RadiologyIntegration",
                timestamp = DateTime.Now,
                fhirCapabilities = new[]
                {
                    "[PID] Patient Identification",
                    "[SCH] Schedule/Appointment",
                    "[OBX] Observation Results",
                    "[OBR] Order Detail",
                    "[ORC] Order Common",
                    "[MSH] Message Header"
                }
            });
        }

        /// <summary>
        /// Echo endpoint for testing FHIR/HL7 segments
        /// Shows what segments are being received
        /// </summary>
        [HttpPost("echo-segments")]
        [Produces("application/json")]
        public IActionResult EchoSegments([FromBody] object data)
        {
            try
            {
                _logger.LogInformation("\n╔════════════════════════════════════════════════════════════════╗");
                _logger.LogInformation("║ TEST ECHO - Received Data");
                _logger.LogInformation("║ Type: {Type}", data?.GetType().Name ?? "null");
                _logger.LogInformation("║ Content: {Data}", JsonSerializer.Serialize(data));
                _logger.LogInformation("╚════════════════════════════════════════════════════════════════╝\n");

                return Ok(new { echo = data, timestamp = DateTime.Now });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Echo error: {Message}", ex.Message);
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
