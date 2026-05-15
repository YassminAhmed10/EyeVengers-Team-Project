using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace RadiologyCenterAPI.Services
{
    public interface IInvestigationWorkflowService
    {
        Task<(bool Success, string Message, Investigation? Investigation)> StartInvestigationAsync(int appointmentId, string investigationType, string? notes = null);
        Task<(bool Success, string Message, Investigation? Investigation)> CompleteInvestigationAsync(int investigationId, string? completionNotes = null);
        Task<(bool Success, string Message, InvestigationFile? File)> UploadInvestigationFileAsync(int investigationId, string fileName, string originalFileName, long fileSize, string? mimeType, string filePath, string fhirResourceType, int uploadedByUserId);
        Task<(bool Success, string Message, bool Deleted)> DeleteInvestigationFileAsync(int fileId);
        Task<(bool Success, string Message, List<Investigation>?)> GetPendingInvestigationsAsync();
        Task<(bool Success, string Message, List<Investigation>?)> GetActiveInvestigationsAsync();
        Task<(bool Success, string Message, Investigation?)> GetInvestigationDetailsAsync(int investigationId);
    }

    public class InvestigationWorkflowService : IInvestigationWorkflowService
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<InvestigationWorkflowService> _logger;
        private readonly IAuditService _auditService;
        private readonly INotificationService _notificationService;
        private readonly IStatusSynchronizationService _statusSyncService;
        private readonly string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Investigations");

        public InvestigationWorkflowService(
            RadiologyDbContext context,
            ILogger<InvestigationWorkflowService> logger,
            IAuditService auditService,
            INotificationService notificationService,
            IStatusSynchronizationService statusSyncService)
        {
            _context = context;
            _logger = logger;
            _auditService = auditService;
            _notificationService = notificationService;
            _statusSyncService = statusSyncService;

            // Ensure upload directory exists
            if (!Directory.Exists(_uploadPath))
                Directory.CreateDirectory(_uploadPath);
        }

        /// <summary>
        /// Start a new investigation
        /// </summary>
        public async Task<(bool Success, string Message, Investigation? Investigation)> StartInvestigationAsync(
            int appointmentId, 
            string investigationType, 
            string? notes = null)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .FirstOrDefaultAsync(a => a.Id == appointmentId);

                if (appointment == null)
                    return (false, "Appointment not found", null);

                // Check if investigation already exists
                var existingInvestigation = await _context.Investigations
                    .FirstOrDefaultAsync(i => i.AppointmentId == appointmentId && i.Status != "Completed");

                if (existingInvestigation != null)
                    return (false, "Investigation already exists for this appointment", null);

                var investigation = new Investigation
                {
                    AppointmentId = appointmentId,
                    InvestigationType = investigationType,
                    Status = "Active",
                    StartedAt = DateTime.UtcNow,
                    Notes = notes
                };

                _context.Investigations.Add(investigation);
                appointment.InvestigationStatus = "In Progress";
                appointment.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Investigation {investigation.Id} started for appointment {appointmentId}");

                // Notify patient
                await _notificationService.CreateNotificationAsync(
                    appointment.PatientId,
                    appointmentId,
                    investigation.Id,
                    "investigation_started",
                    "Investigation Started",
                    $"Your {investigationType} investigation has begun."
                );

                // Sync status across systems
                await _statusSyncService.SyncStatusAsync(appointmentId, "In Progress", "Investigation");

                return (true, "Investigation started", investigation);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error starting investigation: {ex.Message}");
                return (false, $"Error: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Complete an investigation
        /// </summary>
        public async Task<(bool Success, string Message, Investigation? Investigation)> CompleteInvestigationAsync(
            int investigationId, 
            string? completionNotes = null)
        {
            try
            {
                var investigation = await _context.Investigations
                    .Include(i => i.Appointment)
                    .ThenInclude(a => a!.Patient)
                    .FirstOrDefaultAsync(i => i.Id == investigationId);

                if (investigation == null)
                    return (false, "Investigation not found", null);

                investigation.Status = "Completed";
                investigation.CompletedAt = DateTime.UtcNow;
                investigation.AdminNotes = completionNotes;

                if (investigation.Appointment != null)
                {
                    investigation.Appointment.InvestigationStatus = "Completed";
                    investigation.Appointment.Status = "Completed";
                    investigation.Appointment.CompletedAt = DateTime.UtcNow;
                    investigation.Appointment.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Investigation {investigationId} completed");

                // Notify patient
                if (investigation.Appointment != null)
                {
                    await _notificationService.CreateNotificationAsync(
                        investigation.Appointment.PatientId,
                        investigation.AppointmentId,
                        investigationId,
                        "investigation_completed",
                        "Investigation Complete",
                        "Your investigation is complete. Results are now available in your patient portal."
                    );

                    // Sync status across systems
                    await _statusSyncService.SyncStatusAsync(investigation.AppointmentId, "Completed", "Investigation");
                }

                return (true, "Investigation completed", investigation);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error completing investigation: {ex.Message}");
                return (false, $"Error: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Upload an investigation file
        /// </summary>
        public async Task<(bool Success, string Message, InvestigationFile? File)> UploadInvestigationFileAsync(
            int investigationId,
            string fileName,
            string originalFileName,
            long fileSize,
            string? mimeType,
            string filePath,
            string fhirResourceType,
            int uploadedByUserId)
        {
            try
            {
                var investigation = await _context.Investigations
                    .Include(i => i.Appointment)
                    .ThenInclude(a => a!.Patient)
                    .FirstOrDefaultAsync(i => i.Id == investigationId);

                if (investigation == null)
                    return (false, "Investigation not found", null);

                var investigationFile = new InvestigationFile
                {
                    InvestigationId = investigationId,
                    FileName = fileName,
                    OriginalFileName = originalFileName,
                    FileSize = fileSize,
                    MimeType = mimeType,
                    FilePath = filePath,
                    FileUrl = $"/uploads/investigations/{fileName}",
                    FileType = Path.GetExtension(fileName).ToLower().TrimStart('.'),
                    FhirResourceType = fhirResourceType,
                    UploadedAt = DateTime.UtcNow,
                    UploadedBy = uploadedByUserId
                };

                _context.InvestigationFiles.Add(investigationFile);

                // Update investigation status if needed
                if (investigation.Status == "Active")
                {
                    investigation.Status = "Under Review";
                    investigation.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"File {fileName} uploaded for investigation {investigationId}");

                // Notify patient about file upload
                if (investigation.Appointment != null)
                {
                    await _notificationService.CreateNotificationAsync(
                        investigation.Appointment.PatientId,
                        investigation.AppointmentId,
                        investigationId,
                        "file_uploaded",
                        "Investigation File Uploaded",
                        $"A new file has been uploaded for your {investigation.InvestigationType} investigation."
                    );
                }

                // Create audit log
                await _auditService.LogActionAsync(
                    "FILE_UPLOADED",
                    investigation.Appointment?.PatientId.ToString(),
                    investigation.AppointmentId,
                    uploadedByUserId.ToString(),
                    details: $"File: {originalFileName}, Size: {fileSize} bytes, Type: {fhirResourceType}"
                );

                // Generate FHIR DocumentReference
                await GenerateFhirDocumentReferenceAsync(investigationFile, investigation);

                return (true, "File uploaded successfully", investigationFile);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error uploading investigation file: {ex.Message}");
                return (false, $"Error: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Delete an investigation file
        /// </summary>
        public async Task<(bool Success, string Message, bool Deleted)> DeleteInvestigationFileAsync(int fileId)
        {
            try
            {
                var file = await _context.InvestigationFiles.FindAsync(fileId);
                if (file == null)
                    return (false, "File not found", false);

                // Delete physical file
                if (File.Exists(file.FilePath))
                {
                    File.Delete(file.FilePath);
                }

                _context.InvestigationFiles.Remove(file);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"File {fileId} deleted successfully");

                return (true, "File deleted", true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting file: {ex.Message}");
                return (false, $"Error: {ex.Message}", false);
            }
        }

        /// <summary>
        /// Get all pending investigations
        /// </summary>
        public async Task<(bool Success, string Message, List<Investigation>?)> GetPendingInvestigationsAsync()
        {
            try
            {
                var pending = await _context.Investigations
                    .Include(i => i.Appointment)
                    .ThenInclude(a => a!.Patient)
                    .Include(i => i.Appointment)
                    .ThenInclude(a => a!.RadiologyService)
                    .Include(i => i.Files)
                    .Where(i => i.Status == "Active" || i.Status == "Pending")
                    .OrderByDescending(i => i.StartedAt)
                    .ToListAsync();

                return (true, "Retrieved pending investigations", pending);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting pending investigations: {ex.Message}");
                return (false, $"Error: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Get all active investigations
        /// </summary>
        public async Task<(bool Success, string Message, List<Investigation>?)> GetActiveInvestigationsAsync()
        {
            try
            {
                var active = await _context.Investigations
                    .Include(i => i.Appointment)
                    .ThenInclude(a => a!.Patient)
                    .Include(i => i.Appointment)
                    .ThenInclude(a => a!.RadiologyService)
                    .Include(i => i.Files)
                    .Where(i => i.Status == "In Progress" || i.Status == "Under Review")
                    .OrderByDescending(i => i.StartedAt)
                    .ToListAsync();

                return (true, "Retrieved active investigations", active);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting active investigations: {ex.Message}");
                return (false, $"Error: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Get investigation details
        /// </summary>
        public async Task<(bool Success, string Message, Investigation?)> GetInvestigationDetailsAsync(int investigationId)
        {
            try
            {
                var investigation = await _context.Investigations
                    .Include(i => i.Appointment)
                    .ThenInclude(a => a!.Patient)
                    .Include(i => i.Appointment)
                    .ThenInclude(a => a!.RadiologyService)
                    .Include(i => i.Files)
                    .FirstOrDefaultAsync(i => i.Id == investigationId);

                if (investigation == null)
                    return (false, "Investigation not found", null);

                return (true, "Investigation retrieved", investigation);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting investigation details: {ex.Message}");
                return (false, $"Error: {ex.Message}", null);
            }
        }

        private async Task GenerateFhirDocumentReferenceAsync(InvestigationFile file, Investigation investigation)
        {
            try
            {
                var fhirDocRef = new
                {
                    resourceType = "DocumentReference",
                    id = file.Id.ToString(),
                    status = "current",
                    subject = new { reference = $"Patient/{investigation.Appointment?.PatientId}" },
                    date = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    author = new object[] { new { reference = $"Organization/radiology-center" } },
                    type = new
                    {
                        coding = new[]
                        {
                            new
                            {
                                system = "http://loinc.org",
                                code = "18748-4",
                                display = file.FhirResourceType
                            }
                        }
                    },
                    content = new object[] {
                        new {
                            attachment = new {
                                contentType = file.MimeType,
                                url = file.FileUrl,
                                creation = file.UploadedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
                            }
                        }
                    },
                    relatesTo = new object[] {
                        new {
                            code = "appends",
                            target = new { reference = $"ServiceRequest/{investigation.AppointmentId}" }
                        }
                    }
                };

                _logger.LogInformation($"FHIR DocumentReference generated for file {file.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating FHIR DocumentReference: {ex.Message}");
            }
        }
    }
}
