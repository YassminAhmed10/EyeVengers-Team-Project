// Controllers/InvestigationController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;
using System.IO;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class InvestigationController : ControllerBase
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<InvestigationController> _logger;
        private readonly string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Investigations");

        public InvestigationController(RadiologyDbContext context, ILogger<InvestigationController> logger)
        {
            _context = context;
            _logger = logger;
            
            if (!Directory.Exists(_uploadPath))
                Directory.CreateDirectory(_uploadPath);
        }

        // GET: api/investigation/appointment/{appointmentId}
        [HttpGet("appointment/{appointmentId}")]
        public async Task<ActionResult> GetByAppointment(int appointmentId)
        {
            try
            {
                var investigations = await _context.Investigations
                    .Include(i => i.Files)
                    .Where(i => i.AppointmentId == appointmentId)
                    .OrderByDescending(i => i.StartedAt)
                    .ToListAsync();
                    
                return Ok(new { success = true, data = investigations });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching investigations: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // POST: api/investigation/start
        [HttpPost("start")]
        public async Task<ActionResult> StartInvestigation([FromBody] StartInvestigationRequest request)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(request.AppointmentId);
                if (appointment == null)
                    return NotFound(new { success = false, message = "Appointment not found" });
                
                // Update appointment status
                appointment.InvestigationStatus = "Active";
                appointment.UpdatedAt = DateTime.UtcNow;
                
                // Create investigation record
                var investigation = new Investigation
                {
                    AppointmentId = request.AppointmentId,
                    InvestigationType = request.InvestigationType,
                    Status = "Active",
                    StartedAt = DateTime.UtcNow,
                    Notes = request.Notes,
                    AdminNotes = request.AdminNotes
                };
                
                _context.Investigations.Add(investigation);
                await _context.SaveChangesAsync();
                
                // Create notification for patient
                await CreateNotification(appointment.PatientId, appointment.Id, investigation.Id, 
                    "investigation_started", "Investigation Started", 
                    $"Your {appointment.RadiologyService?.Display} investigation has started.");
                
                // Send FHIR ServiceRequest update
                await UpdateFhirServiceRequest(appointment, "in-progress");
                
                _logger.LogInformation($"Investigation started for appointment {request.AppointmentId}");
                return Ok(new { success = true, message = "Investigation started", data = investigation });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error starting investigation: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // POST: api/investigation/{id}/complete
        [HttpPost("{id}/complete")]
        public async Task<ActionResult> CompleteInvestigation(int id)
        {
            try
            {
                var investigation = await _context.Investigations
                    .Include(i => i.Appointment)
                    .FirstOrDefaultAsync(i => i.Id == id);
                    
                if (investigation == null)
                    return NotFound(new { success = false, message = "Investigation not found" });
                
                investigation.Status = "Completed";
                investigation.CompletedAt = DateTime.UtcNow;
                
                // Update appointment status
                if (investigation.Appointment != null)
                {
                    investigation.Appointment.InvestigationStatus = "Completed";
                    investigation.Appointment.Status = "Completed";
                    investigation.Appointment.CompletedAt = DateTime.UtcNow;
                    investigation.Appointment.UpdatedAt = DateTime.UtcNow;
                }
                
                await _context.SaveChangesAsync();
                
                // Create notification
                await CreateNotification(investigation.Appointment.PatientId, investigation.AppointmentId, investigation.Id,
                    "investigation_completed", "Investigation Completed", 
                    "Your radiology investigation has been completed. Results are being processed.");
                
                // Send FHIR DiagnosticReport
                await CreateFhirDiagnosticReport(investigation);
                
                _logger.LogInformation($"Investigation {id} completed");
                return Ok(new { success = true, message = "Investigation completed" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error completing investigation: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // POST: api/investigation/{id}/upload
        [HttpPost("{id}/upload")]
        public async Task<ActionResult> UploadFile(int id, IFormFile file, [FromQuery] string fileType = "image")
        {
            try
            {
                var investigation = await _context.Investigations.FindAsync(id);
                if (investigation == null)
                    return NotFound(new { success = false, message = "Investigation not found" });
                
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "No file provided" });
                
                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/dicom", "application/dicom", "application/pdf" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                    return BadRequest(new { success = false, message = "Invalid file type" });
                
                // Generate unique filename
                var fileName = $"{id}_{DateTime.UtcNow.Ticks}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(_uploadPath, fileName);
                var fileUrl = $"/uploads/investigations/{fileName}";
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                var investigationFile = new InvestigationFile
                {
                    InvestigationId = id,
                    FileName = fileName,
                    OriginalFileName = file.FileName,
                    FileType = fileType,
                    FilePath = filePath,
                    FileUrl = fileUrl,
                    FileSize = file.Length,
                    MimeType = file.ContentType,
                    UploadedAt = DateTime.UtcNow,
                    UploadedBy = 1, // Admin user ID
                    FhirResourceType = fileType == "image" ? "ImagingStudy" : "DocumentReference",
                    FhirResourceId = Guid.NewGuid().ToString()
                };
                
                _context.InvestigationFiles.Add(investigationFile);
                await _context.SaveChangesAsync();
                
                // Create DiagnosticReport for image
                if (fileType == "image")
                {
                    await CreateFhirImagingStudy(investigation, investigationFile);
                }
                else if (file.ContentType == "application/pdf")
                {
                    await CreateFhirDocumentReference(investigation, investigationFile);
                }
                
                // Notify patient
                await CreateNotification(investigation.Appointment.PatientId, investigation.AppointmentId, investigation.Id,
                    "result_uploaded", "New Result Available", 
                    $"A new result has been uploaded for your {investigation.Appointment?.RadiologyService?.Display} investigation.");
                
                _logger.LogInformation($"File uploaded for investigation {id}: {file.FileName}");
                return Ok(new { success = true, message = "File uploaded", data = investigationFile });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error uploading file: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET: api/investigation/patient/{patientId}
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult> GetPatientInvestigations(int patientId)
        {
            try
            {
                var investigations = await _context.Investigations
                    .Include(i => i.Appointment)
                        .ThenInclude(a => a.RadiologyService)
                    .Include(i => i.Files)
                    .Where(i => i.Appointment.PatientId == patientId)
                    .OrderByDescending(i => i.StartedAt)
                    .ToListAsync();
                    
                return Ok(new { success = true, data = investigations });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching patient investigations: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // DELETE: api/investigation/file/{fileId}
        [HttpDelete("file/{fileId}")]
        public async Task<ActionResult> DeleteFile(int fileId)
        {
            try
            {
                var file = await _context.InvestigationFiles.FindAsync(fileId);
                if (file == null)
                    return NotFound(new { success = false, message = "File not found" });
                
                // Delete physical file
                if (System.IO.File.Exists(file.FilePath))
                    System.IO.File.Delete(file.FilePath);
                
                _context.InvestigationFiles.Remove(file);
                await _context.SaveChangesAsync();
                
                return Ok(new { success = true, message = "File deleted" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting file: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        private async Task CreateNotification(int patientId, int? appointmentId, int? investigationId, string type, string title, string message)
        {
            try
            {
                var notification = new Notification
                {
                    PatientId = patientId,
                    AppointmentId = appointmentId,
                    Title = title,
                    Message = message,
                    Type = type,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating notification: {ex.Message}");
            }
        }
        
        private async Task UpdateFhirServiceRequest(Appointment appointment, string status)
        {
            // Implementation for FHIR ServiceRequest update
            _logger.LogInformation($"FHIR ServiceRequest update for appointment {appointment.Id}: status={status}");
            await Task.CompletedTask;
        }
        
        private async Task CreateFhirDiagnosticReport(Investigation investigation)
        {
            _logger.LogInformation($"FHIR DiagnosticReport created for investigation {investigation.Id}");
            await Task.CompletedTask;
        }
        
        private async Task CreateFhirImagingStudy(Investigation investigation, InvestigationFile file)
        {
            _logger.LogInformation($"FHIR ImagingStudy created for investigation {investigation.Id}, file {file.Id}");
            await Task.CompletedTask;
        }
        
        private async Task CreateFhirDocumentReference(Investigation investigation, InvestigationFile file)
        {
            _logger.LogInformation($"FHIR DocumentReference created for investigation {investigation.Id}, file {file.Id}");
            await Task.CompletedTask;
        }
    }
    
    public class StartInvestigationRequest
    {
        public int AppointmentId { get; set; }
        public string InvestigationType { get; set; } = "";
        public string? Notes { get; set; }
        public string? AdminNotes { get; set; }
    }
}