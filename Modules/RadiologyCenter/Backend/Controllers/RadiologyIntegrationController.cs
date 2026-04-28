using Microsoft.AspNetCore.Mvc;
using Hl7.Fhir.Model;
using EyeClinicAPI.Services;

namespace EyeClinicAPI.Controllers
{
    /// <summary>
    /// Radiology Integration Controller
    /// Demonstrates how clinic system communicates with Radiology Center via FHIR
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class RadiologyIntegrationController : ControllerBase
    {
        private readonly IRadiologyCenterFhirClient _radiologyClient;
        private readonly ILogger<RadiologyIntegrationController> _logger;

        public RadiologyIntegrationController(
            IRadiologyCenterFhirClient radiologyClient,
            ILogger<RadiologyIntegrationController> logger)
        {
            _radiologyClient = radiologyClient;
            _logger = logger;
        }

        /// <summary>
        /// Send scan order to Radiology Center
        /// Example: POST /api/radiologyintegration/send-scan-order
        /// </summary>
        [HttpPost("send-scan-order")]
        public async Task<IActionResult> SendScanOrder([FromBody] ScanOrderRequest request)
        {
            try
            {
                _logger.LogInformation($"Sending scan order for patient {request.PatientId}");

                // Create FHIR ServiceRequest (scan order)
                var serviceRequest = new ServiceRequest
                {
                    Identifier = new List<Identifier>
                    {
                        new Identifier
                        {
                            System = "http://radiology.example.com/order",
                            Value = request.OrderNumber ?? $"CLINIC-ORD-{DateTime.UtcNow.Ticks}"
                        }
                    },
                    Status = RequestStatus.Active,
                    Intent = RequestIntent.Order,
                    Code = new CodeableConcept
                    {
                        Coding = new List<Coding>
                        {
                            new Coding
                            {
                                System = "http://loinc.org",
                                Code = MapScanTypeToLoinc(request.ScanType),
                                Display = request.ScanType
                            }
                        },
                        Text = request.ScanType
                    },
                    Subject = new ResourceReference($"Patient/{request.PatientId}"),
                    Priority = MapPriority(request.Priority),
                    AuthoredOn = DateTime.UtcNow.ToString("O")
                };

                // Add requester (clinic doctor)
                if (!string.IsNullOrEmpty(request.ReferringDoctorName))
                {
                    serviceRequest.Requester = new ResourceReference
                    {
                        Display = request.ReferringDoctorName
                    };
                }

                // Add body site
                if (!string.IsNullOrEmpty(request.BodyPart))
                {
                    serviceRequest.BodySite = new List<CodeableConcept>
                    {
                        new CodeableConcept { Text = request.BodyPart }
                    };
                }

                // Add clinical indication
                if (!string.IsNullOrEmpty(request.ClinicalIndication))
                {
                    serviceRequest.ReasonCode = new List<CodeableConcept>
                    {
                        new CodeableConcept { Text = request.ClinicalIndication }
                    };
                }

                // Send to Radiology Center
                var result = await _radiologyClient.CreateScanOrderAsync(serviceRequest);

                _logger.LogInformation($"Successfully sent scan order with ID: {result.Id}");

                return Ok(new
                {
                    success = true,
                    orderId = result.Id,
                    message = "Scan order sent successfully to Radiology Center",
                    radiologyOrderId = result.Identifier?.FirstOrDefault()?.Value
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending scan order");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get radiology results for patient
        /// Example: GET /api/radiologyintegration/get-results?patientId=1
        /// </summary>
        [HttpGet("get-results")]
        public async Task<IActionResult> GetRadiologyResults([FromQuery] int patientId)
        {
            try
            {
                _logger.LogInformation($"Retrieving radiology results for patient {patientId}");

                // Get all diagnostic reports (radiology findings)
                var reportsBundle = await _radiologyClient.GetPatientDiagnosticReportsAsync(patientId);

                if (reportsBundle?.Entry == null || reportsBundle.Entry.Count == 0)
                {
                    return Ok(new
                    {
                        patientId = patientId,
                        hasResults = false,
                        message = "No radiology results found for this patient"
                    });
                }

                // Extract report details
                var reports = new List<object>();
                foreach (var entry in reportsBundle.Entry)
                {
                    if (entry.Resource is DiagnosticReport report)
                    {
                        reports.Add(new
                        {
                            reportId = report.Id,
                            status = report.Status?.ToString(),
                            issued = report.Issued,
                            conclusion = report.Conclusion,
                            radiologist = report.Performer?.FirstOrDefault()?.Display
                        });
                    }
                }

                return Ok(new
                {
                    patientId = patientId,
                    hasResults = true,
                    reportCount = reports.Count,
                    reports = reports
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving radiology results");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get scan orders status for patient
        /// Example: GET /api/radiologyintegration/scan-orders?patientId=1
        /// </summary>
        [HttpGet("scan-orders")]
        public async Task<IActionResult> GetScanOrders([FromQuery] int patientId)
        {
            try
            {
                _logger.LogInformation($"Retrieving scan orders for patient {patientId}");

                // Get all service requests (scan orders)
                var ordersBundle = await _radiologyClient.GetPatientScanOrdersAsync(patientId);

                if (ordersBundle?.Entry == null || ordersBundle.Entry.Count == 0)
                {
                    return Ok(new
                    {
                        patientId = patientId,
                        ordersCount = 0,
                        orders = new List<object>()
                    });
                }

                // Extract order details
                var orders = new List<object>();
                foreach (var entry in ordersBundle.Entry)
                {
                    if (entry.Resource is ServiceRequest order)
                    {
                        orders.Add(new
                        {
                            orderId = order.Id,
                            orderNumber = order.Identifier?.FirstOrDefault()?.Value,
                            status = order.Status?.ToString(),
                            scanType = order.Code?.Text,
                            priority = order.Priority?.ToString(),
                            orderedOn = order.AuthoredOn,
                            createdDate = order.Meta?.LastUpdated
                        });
                    }
                }

                return Ok(new
                {
                    patientId = patientId,
                    ordersCount = orders.Count,
                    orders = orders
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving scan orders");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get specific diagnostic report details
        /// Example: GET /api/radiologyintegration/report-details?reportId=1
        /// </summary>
        [HttpGet("report-details")]
        public async Task<IActionResult> GetReportDetails([FromQuery] int reportId)
        {
            try
            {
                _logger.LogInformation($"Retrieving report details for report {reportId}");

                var report = await _radiologyClient.GetDiagnosticReportAsync(reportId);

                if (report == null)
                {
                    return NotFound(new { error = "Report not found" });
                }

                return Ok(new
                {
                    reportId = report.Id,
                    status = report.Status?.ToString(),
                    issued = report.Issued,
                    conclusion = report.Conclusion,
                    findings = report.Text?.Div,
                    radiologist = report.Performer?.FirstOrDefault()?.Display,
                    patientId = report.Subject?.Reference?.Split('/').LastOrDefault(),
                    basedOnServiceRequest = report.BasedOn?.FirstOrDefault()?.Reference
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report details");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ========== HELPER METHODS ==========

        private string MapScanTypeToLoinc(string scanType)
        {
            return scanType?.ToUpperInvariant() switch
            {
                "CT" => "71558-2",
                "MRI" => "71555-8",
                "XRAY" or "X-RAY" => "71020-1",
                "ULTRASOUND" or "US" => "71526-4",
                _ => "71558-2" // Default to CT
            };
        }

        private RequestPriority? MapPriority(string priority)
        {
            return priority?.ToLowerInvariant() switch
            {
                "urgent" => RequestPriority.Urgent,
                "asap" => RequestPriority.Asap,
                "stat" => RequestPriority.Asap,
                _ => RequestPriority.Routine
            };
        }
    }

    /// <summary>
    /// Scan order request model
    /// </summary>
    public class ScanOrderRequest
    {
        public int PatientId { get; set; }
        public string ScanType { get; set; } // CT, MRI, XRAY, ULTRASOUND
        public string Priority { get; set; } = "Routine"; // Routine, Urgent, Stat
        public string BodyPart { get; set; }
        public string ClinicalIndication { get; set; }
        public string ReferringDoctorName { get; set; }
        public string OrderNumber { get; set; }
    }
}
