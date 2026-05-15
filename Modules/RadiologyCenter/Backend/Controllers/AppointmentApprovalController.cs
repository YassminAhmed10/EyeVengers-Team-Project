using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;
using RadiologyCenterAPI.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/appointments")]
    [EnableCors("AllowAll")]
    public class AppointmentApprovalController : ControllerBase
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<AppointmentApprovalController> _logger;
        private readonly IAppointmentApprovalService _approvalService;
        private readonly IInvestigationWorkflowService _investigationService;
        private readonly IStatusSynchronizationService _statusSyncService;

        public AppointmentApprovalController(
            RadiologyDbContext context,
            ILogger<AppointmentApprovalController> logger,
            IAppointmentApprovalService approvalService,
            IInvestigationWorkflowService investigationService,
            IStatusSynchronizationService statusSyncService)
        {
            _context = context;
            _logger = logger;
            _approvalService = approvalService;
            _investigationService = investigationService;
            _statusSyncService = statusSyncService;
        }

        /// <summary>
        /// GET: api/appointments/pending-requests
        /// Get all pending appointment requests (admin dashboard)
        /// </summary>
        [HttpGet("pending-requests")]
        public async Task<ActionResult> GetPendingRequests([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var skip = (pageNumber - 1) * pageSize;

                var pendingAppointments = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.RadiologyService)
                    .Include(a => a.Slot)
                    .Where(a => a.Status == "Pending" || a.Status == "Requested by Doctor")
                    .OrderByDescending(a => a.CreatedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                var totalCount = await _context.Appointments
                    .Where(a => a.Status == "Pending" || a.Status == "Requested by Doctor")
                    .CountAsync();

                return Ok(new
                {
                    success = true,
                    data = pendingAppointments,
                    pagination = new
                    {
                        pageNumber,
                        pageSize,
                        totalCount,
                        totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching pending requests: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/appointments/active-investigations
        /// Get all active investigations (admin dashboard)
        /// </summary>
        [HttpGet("active-investigations")]
        public async Task<ActionResult> GetActiveInvestigations()
        {
            try
            {
                var (success, message, investigations) = await _investigationService.GetActiveInvestigationsAsync();

                if (!success)
                    return BadRequest(new { success = false, message });

                return Ok(new
                {
                    success = true,
                    data = investigations,
                    message = $"Retrieved {investigations?.Count ?? 0} active investigations"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching active investigations: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// POST: api/appointments/{id}/approve
        /// Approve an appointment and create investigation
        /// </summary>
        [HttpPost("{id}/approve")]
        public async Task<ActionResult> ApproveAppointment(int id, [FromBody] AppointmentApprovalRequest request)
        {
            try
            {
                var adminUserId = int.TryParse(User.FindFirst("sub")?.Value ?? "1", out var userId) ? userId : 1;

                var (success, message, appointment) = await _approvalService.ApproveAppointmentAsync(
                    id,
                    request?.AdminNotes,
                    adminUserId
                );

                if (!success)
                    return BadRequest(new { success = false, message });

                _logger.LogInformation($"Appointment {id} approved successfully");

                return Ok(new
                {
                    success = true,
                    message = message,
                    data = appointment
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error approving appointment: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// POST: api/appointments/{id}/reject
        /// Reject an appointment request
        /// </summary>
        [HttpPost("{id}/reject")]
        public async Task<ActionResult> RejectAppointment(int id, [FromBody] AppointmentRejectionRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request?.RejectionReason))
                    return BadRequest(new { success = false, message = "Rejection reason is required" });

                var adminUserId = int.TryParse(User.FindFirst("sub")?.Value ?? "1", out var userId) ? userId : 1;

                var (success, message, appointment) = await _approvalService.RejectAppointmentAsync(
                    id,
                    request.RejectionReason,
                    adminUserId
                );

                if (!success)
                    return BadRequest(new { success = false, message });

                _logger.LogInformation($"Appointment {id} rejected");

                return Ok(new
                {
                    success = true,
                    message = message,
                    data = appointment
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error rejecting appointment: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/appointments/{id}/details
        /// Get appointment details with investigation and files
        /// </summary>
        [HttpGet("{id}/details")]
        public async Task<ActionResult> GetAppointmentDetails(int id)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.RadiologyService)
                    .Include(a => a.Slot)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                    return NotFound(new { success = false, message = "Appointment not found" });

                var investigation = await _context.Investigations
                    .Include(i => i.Files)
                    .FirstOrDefaultAsync(i => i.AppointmentId == id);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        appointment,
                        investigation
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching appointment details: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// POST: api/appointments/{id}/upload-files
        /// Upload investigation files
        /// </summary>
        [HttpPost("{appointmentId}/investigations/{investigationId}/upload-files")]
        public async Task<ActionResult> UploadInvestigationFiles(int appointmentId, int investigationId, [FromForm] IFormFileCollection files)
        {
            try
            {
                if (files == null || files.Count == 0)
                    return BadRequest(new { success = false, message = "No files provided" });

                var uploadedFiles = new List<InvestigationFile>();
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Investigations");

                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var adminUserId = int.TryParse(User.FindFirst("sub")?.Value ?? "1", out var userId) ? userId : 1;

                foreach (var file in files)
                {
                    // Validate file type
                    var allowedMimeTypes = new[] { "image/jpeg", "image/png", "application/pdf", "application/dicom" };
                    if (!allowedMimeTypes.Contains(file.ContentType.ToLower()))
                    {
                        _logger.LogWarning($"Invalid file type: {file.ContentType}");
                        continue;
                    }

                    if (file.Length > 104857600) // 100MB limit
                    {
                        _logger.LogWarning($"File too large: {file.FileName}");
                        continue;
                    }

                    try
                    {
                        // Generate unique filename
                        var fileName = $"{investigationId}_{DateTime.UtcNow.Ticks}_{Path.GetFileName(file.FileName)}";
                        var filePath = Path.Combine(uploadPath, fileName);

                        // Save file
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        // Determine FHIR resource type
                        var fhirResourceType = file.ContentType switch
                        {
                            "image/jpeg" or "image/png" => "ImagingStudy",
                            "application/dicom" => "ImagingStudy",
                            "application/pdf" => "DocumentReference",
                            _ => "Media"
                        };

                        // Create investigation file record
                        var (success, message, investFile) = await _investigationService.UploadInvestigationFileAsync(
                            investigationId,
                            fileName,
                            file.FileName,
                            file.Length,
                            file.ContentType,
                            filePath,
                            fhirResourceType,
                            adminUserId
                        );

                        if (success && investFile != null)
                        {
                            uploadedFiles.Add(investFile);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error uploading file {file.FileName}: {ex.Message}");
                    }
                }

                if (uploadedFiles.Count == 0)
                    return BadRequest(new { success = false, message = "Failed to upload files" });

                // Sync status to all systems
                await _statusSyncService.SyncStatusAsync(appointmentId, "Under Review", "Investigation");

                return Ok(new
                {
                    success = true,
                    message = $"Successfully uploaded {uploadedFiles.Count} files",
                    data = uploadedFiles
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error uploading investigation files: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// POST: api/appointments/{id}/complete-investigation
        /// Mark investigation as complete
        /// </summary>
        [HttpPost("{appointmentId}/investigations/{investigationId}/complete")]
        public async Task<ActionResult> CompleteInvestigation(int appointmentId, int investigationId, [FromBody] CompleteInvestigationRequest request)
        {
            try
            {
                var (success, message, investigation) = await _investigationService.CompleteInvestigationAsync(
                    investigationId,
                    request?.CompletionNotes
                );

                if (!success)
                    return BadRequest(new { success = false, message });

                // Sync status to all systems
                await _statusSyncService.SyncStatusAsync(appointmentId, "Completed", "Investigation");

                _logger.LogInformation($"Investigation {investigationId} completed");

                return Ok(new
                {
                    success = true,
                    message = message,
                    data = investigation
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error completing investigation: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET: api/appointments/{id}/sync-status
        /// Manually sync appointment status to all systems
        /// </summary>
        [HttpPost("{id}/sync-status")]
        public async Task<ActionResult> SyncStatus(int id, [FromBody] SyncStatusRequest request)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null)
                    return NotFound(new { success = false, message = "Appointment not found" });

                var syncSuccess = await _statusSyncService.SyncStatusAsync(
                    id,
                    request?.Status ?? appointment.Status,
                    "Appointment"
                );

                if (!syncSuccess)
                    return BadRequest(new { success = false, message = "Failed to sync status" });

                return Ok(new
                {
                    success = true,
                    message = "Status synced to all systems",
                    data = appointment
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error syncing status: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    // Request/Response DTOs
    public class AppointmentApprovalRequest
    {
        public string? AdminNotes { get; set; }
    }

    public class AppointmentRejectionRequest
    {
        public string? RejectionReason { get; set; }
    }

    public class CompleteInvestigationRequest
    {
        public string? CompletionNotes { get; set; }
    }

    public class SyncStatusRequest
    {
        public string? Status { get; set; }
    }
}
