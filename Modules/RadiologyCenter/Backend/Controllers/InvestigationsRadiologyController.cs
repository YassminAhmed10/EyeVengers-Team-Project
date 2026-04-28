using Microsoft.AspNetCore.Mvc;
using EyeClinicAPI.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace EyeClinicAPI.Controllers
{
    /// <summary>
    /// Investigations Radiology Request Controller
    /// Handles sending patient investigations from clinic EMR to Radiology Center
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class InvestigationsRadiologyController : ControllerBase
    {
        private readonly IRadiologyCenterFhirClient _radiologyClient;
        private readonly IInvestigationToFhirMapper _investigationMapper;
        private readonly ILogger<InvestigationsRadiologyController> _logger;

        public InvestigationsRadiologyController(
            IRadiologyCenterFhirClient radiologyClient,
            IInvestigationToFhirMapper investigationMapper,
            ILogger<InvestigationsRadiologyController> logger)
        {
            _radiologyClient = radiologyClient;
            _investigationMapper = investigationMapper;
            _logger = logger;
        }

        /// <summary>
        /// Send single investigation to Radiology Center
        /// Example: POST /api/investigationsradiology/send-single
        /// </summary>
        [HttpPost("send-single")]
        public async Task<IActionResult> SendSingleInvestigation([FromBody] SendInvestigationRequest request)
        {
            try
            {
                if (request == null || request.PatientId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Invalid patient ID"
                    });
                }

                if (string.IsNullOrEmpty(request.InvestigationType))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Investigation type is required"
                    });
                }

                _logger.LogInformation($"Sending investigation '{request.InvestigationType}' for patient {request.PatientId} to Radiology Center");

                // Map investigation to FHIR ServiceRequest
                var serviceRequest = _investigationMapper.MapInvestigationToServiceRequest(
                    request.PatientId,
                    request.InvestigationType,
                    request.ClinicalIndication,
                    request.Priority ?? "Routine",
                    request.ReferringDoctorName,
                    request.Notes);

                // Send to Radiology Center
                var createdOrder = await _radiologyClient.CreateScanOrderAsync(serviceRequest);

                _logger.LogInformation($"Successfully sent investigation to Radiology Center. Order ID: {createdOrder.Id}");

                return Ok(new
                {
                    success = true,
                    message = "Investigation sent to Radiology Center successfully",
                    orderId = createdOrder.Id,
                    investigationType = request.InvestigationType,
                    patientId = request.PatientId,
                    sentAt = DateTime.UtcNow,
                    status = "sent"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending investigation for patient {request.PatientId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Failed to send investigation to Radiology Center",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Send multiple investigations to Radiology Center
        /// Example: POST /api/investigationsradiology/send-multiple
        /// </summary>
        [HttpPost("send-multiple")]
        public async Task<IActionResult> SendMultipleInvestigations([FromBody] SendMultipleInvestigationsRequest request)
        {
            try
            {
                if (request == null || request.PatientId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Invalid patient ID"
                    });
                }

                if (request.InvestigationTypes == null || request.InvestigationTypes.Count == 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "At least one investigation type is required"
                    });
                }

                _logger.LogInformation($"Sending {request.InvestigationTypes.Count} investigations for patient {request.PatientId} to Radiology Center");

                // Map all investigations to FHIR ServiceRequests
                var serviceRequests = _investigationMapper.MapMultipleInvestigationsToServiceRequests(
                    request.PatientId,
                    request.InvestigationTypes,
                    request.ClinicalIndication,
                    request.Priority ?? "Routine",
                    request.ReferringDoctorName,
                    request.Notes);

                // Send all to Radiology Center
                var sentOrders = new List<object>();
                foreach (var serviceRequest in serviceRequests)
                {
                    try
                    {
                        var createdOrder = await _radiologyClient.CreateScanOrderAsync(serviceRequest);
                        sentOrders.Add(new
                        {
                            investigationType = serviceRequest.Code?.Text,
                            orderId = createdOrder.Id,
                            status = "sent"
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error sending investigation to Radiology Center");
                        sentOrders.Add(new
                        {
                            investigationType = serviceRequest.Code?.Text,
                            status = "failed",
                            error = ex.Message
                        });
                    }
                }

                _logger.LogInformation($"Sent {sentOrders.Count} investigations to Radiology Center");

                return Ok(new
                {
                    success = true,
                    message = "Investigations sent to Radiology Center",
                    patientId = request.PatientId,
                    totalSent = sentOrders.Count,
                    sentAt = DateTime.UtcNow,
                    orders = sentOrders
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending multiple investigations for patient {request.PatientId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Failed to send investigations to Radiology Center",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Get status of sent investigations
        /// Example: GET /api/investigationsradiology/investigation-status?patientId=1&investigationType=MRI
        /// </summary>
        [HttpGet("investigation-status")]
        public async Task<IActionResult> GetInvestigationStatus(int patientId, string investigationType = null)
        {
            try
            {
                if (patientId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Invalid patient ID"
                    });
                }

                _logger.LogInformation($"Fetching investigation status for patient {patientId}");

                // Get all scan orders for patient
                var scanOrders = await _radiologyClient.GetPatientScanOrdersAsync(patientId);

                // Filter by investigation type if specified
                var filteredOrders = new List<object>();
                if (scanOrders?.Entry != null && scanOrders.Entry.Count > 0)
                {
                    foreach (var entry in scanOrders.Entry)
                    {
                        if (entry.Resource is Hl7.Fhir.Model.ServiceRequest order)
                        {
                            if (string.IsNullOrEmpty(investigationType) || 
                                (order.Code?.Text ?? "").Equals(investigationType, StringComparison.OrdinalIgnoreCase))
                            {
                                filteredOrders.Add(new
                                {
                                    orderId = order.Id,
                                    investigationType = order.Code?.Text,
                                    status = order.Status?.ToString(),
                                    priority = order.Priority?.ToString(),
                                    createdDate = order.AuthoredOn,
                                    clinicalIndication = order.OrderDetail?.FirstOrDefault()?.Text
                                });
                            }
                        }
                    }
                }

                return Ok(new
                {
                    success = true,
                    patientId = patientId,
                    totalInvestigations = filteredOrders.Count,
                    investigations = filteredOrders
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching investigation status for patient {patientId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Failed to fetch investigation status",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Get investigation results from Radiology Center
        /// Example: GET /api/investigationsradiology/results?patientId=1&investigationType=MRI
        /// </summary>
        [HttpGet("results")]
        public async Task<IActionResult> GetInvestigationResults(int patientId, string investigationType = null)
        {
            try
            {
                if (patientId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Invalid patient ID"
                    });
                }

                _logger.LogInformation($"Fetching investigation results for patient {patientId}");

                // Get all diagnostic reports for patient
                var diagnosticReports = await _radiologyClient.GetPatientDiagnosticReportsAsync(patientId);

                // Filter by investigation type if specified
                var filteredReports = new List<object>();
                if (diagnosticReports?.Entry != null && diagnosticReports.Entry.Count > 0)
                {
                    foreach (var entry in diagnosticReports.Entry)
                    {
                        if (entry.Resource is Hl7.Fhir.Model.DiagnosticReport report)
                        {
                            if (string.IsNullOrEmpty(investigationType) ||
                                (report.Code?.Text ?? "").Equals(investigationType, StringComparison.OrdinalIgnoreCase))
                            {
                                filteredReports.Add(new
                                {
                                    reportId = report.Id,
                                    investigationType = report.Code?.Text,
                                    status = report.Status?.ToString(),
                                    conclusion = report.Conclusion,
                                    issued = report.Issued,
                                    radiologist = report.Performer?.FirstOrDefault()?.Display
                                });
                            }
                        }
                    }
                }

                return Ok(new
                {
                    success = true,
                    patientId = patientId,
                    totalResults = filteredReports.Count,
                    hasResults = filteredReports.Count > 0,
                    results = filteredReports
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching investigation results for patient {patientId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Failed to fetch investigation results",
                    details = ex.Message
                });
            }
        }
    }

    /// <summary>
    /// Request model for sending single investigation
    /// </summary>
    public class SendInvestigationRequest
    {
        public int PatientId { get; set; }
        public string InvestigationType { get; set; } // MRI, CT, X-Ray, CBC, etc.
        public string ClinicalIndication { get; set; } // Why this investigation is needed
        public string Priority { get; set; } // Urgent, Routine, ASAP
        public string ReferringDoctorName { get; set; } // Doctor's name
        public string Notes { get; set; } // Additional notes
    }

    /// <summary>
    /// Request model for sending multiple investigations
    /// </summary>
    public class SendMultipleInvestigationsRequest
    {
        public int PatientId { get; set; }
        public List<string> InvestigationTypes { get; set; } // Multiple investigation types
        public string ClinicalIndication { get; set; }
        public string Priority { get; set; }
        public string ReferringDoctorName { get; set; }
        public string Notes { get; set; }
    }
}
