using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.IO;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class RadiologyResultController : ControllerBase
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<RadiologyResultController> _logger;
        private readonly string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Radiology");

        public RadiologyResultController(RadiologyDbContext context, ILogger<RadiologyResultController> logger)
        {
            _context = context;
            _logger = logger;
            
            // Ensure upload directory exists
            if (!Directory.Exists(_uploadPath))
                Directory.CreateDirectory(_uploadPath);
        }

        // GET: api/radiologyresult/appointment/{appointmentId}
        // Get all results for an appointment
        [HttpGet("appointment/{appointmentId}")]
        public async Task<ActionResult> GetResultsByAppointment(int appointmentId)
        {
            try
            {
                var results = await _context.RadiologyResults
                    .Where(r => r.AppointmentId == appointmentId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return Ok(new { success = true, data = results.Select(r => new RadiologyResultDto(r)) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching results: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error fetching results" });
            }
        }

        // GET: api/radiologyresult/{id}
        // Get specific result
        [HttpGet("{id}")]
        public async Task<ActionResult> GetResult(int id)
        {
            try
            {
                var result = await _context.RadiologyResults.FindAsync(id);
                if (result == null)
                    return NotFound(new { success = false, message = "Result not found" });

                return Ok(new { success = true, data = new RadiologyResultDto(result) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching result: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error fetching result" });
            }
        }

        // POST: api/radiologyresult
        // Create result with report text
        [HttpPost]
        public async Task<ActionResult> CreateResult([FromBody] CreateRadiologyResultRequest request)
        {
            try
            {
                if (request.AppointmentId <= 0)
                    return BadRequest(new { success = false, message = "Invalid appointment ID" });

                var appointment = await _context.Appointments.FindAsync(request.AppointmentId);
                if (appointment == null)
                    return NotFound(new { success = false, message = "Appointment not found" });

                var result = new RadiologyResult
                {
                    AppointmentId = request.AppointmentId,
                    ReportTitle = request.ReportTitle,
                    ReportText = request.ReportText,
                    Findings = request.Findings,
                    Conclusion = request.Conclusion,
                    CreatedAt = DateTime.UtcNow
                };

                _context.RadiologyResults.Add(result);
                await _context.SaveChangesAsync();

                // Create notification
                await CreateNotification(appointment.PatientId, appointment.Id, result.Id, "result_uploaded", "New Radiology Report", "A new radiology report has been uploaded for your review");

                _logger.LogInformation($"Result created for appointment {request.AppointmentId}");
                return Ok(new { success = true, message = "Result created", data = new RadiologyResultDto(result) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating result: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error creating result" });
            }
        }

        // POST: api/radiologyresult/{id}/upload-image
        // Upload radiology image
        [HttpPost("{id}/upload-image")]
        public async Task<ActionResult> UploadImage(int id, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "No file provided" });

                var result = await _context.RadiologyResults.FindAsync(id);
                if (result == null)
                    return NotFound(new { success = false, message = "Result not found" });

                // Validate file type
                var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/dicom", "application/dicom" };
                if (!allowedMimeTypes.Contains(file.ContentType))
                    return BadRequest(new { success = false, message = "Invalid file type. Only JPEG, PNG, and DICOM files are allowed" });

                // Save file
                var fileName = $"img_{result.Id}_{DateTime.UtcNow.Ticks}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(_uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                result.ImageFileName = fileName;
                result.ImagePath = filePath;
                result.ImageUrl = $"/uploads/radiology/{fileName}";
                result.ImageMimeType = file.ContentType;
                result.ImageFileSize = file.Length;
                result.UpdatedAt = DateTime.UtcNow;

                _context.RadiologyResults.Update(result);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Image uploaded for result {id}");
                return Ok(new { success = true, message = "Image uploaded successfully", data = new RadiologyResultDto(result) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error uploading image: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error uploading image" });
            }
        }

        // POST: api/radiologyresult/{id}/upload-report
        // Upload PDF report
        [HttpPost("{id}/upload-report")]
        public async Task<ActionResult> UploadReport(int id, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "No file provided" });

                var result = await _context.RadiologyResults.FindAsync(id);
                if (result == null)
                    return NotFound(new { success = false, message = "Result not found" });

                // Validate file type
                if (file.ContentType != "application/pdf")
                    return BadRequest(new { success = false, message = "Only PDF files are allowed" });

                // Save file
                var fileName = $"report_{result.Id}_{DateTime.UtcNow.Ticks}.pdf";
                var filePath = Path.Combine(_uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                result.ReportFileName = fileName;
                result.ReportPath = filePath;
                result.ReportUrl = $"/uploads/radiology/{fileName}";
                result.ReportFileSize = file.Length;
                result.UpdatedAt = DateTime.UtcNow;

                _context.RadiologyResults.Update(result);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Report uploaded for result {id}");
                return Ok(new { success = true, message = "Report uploaded successfully", data = new RadiologyResultDto(result) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error uploading report: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error uploading report" });
            }
        }

        // PUT: api/radiologyresult/{id}
        // Update result details
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateResult(int id, [FromBody] UpdateRadiologyResultRequest request)
        {
            try
            {
                var result = await _context.RadiologyResults.FindAsync(id);
                if (result == null)
                    return NotFound(new { success = false, message = "Result not found" });

                if (!string.IsNullOrEmpty(request.ReportTitle))
                    result.ReportTitle = request.ReportTitle;
                if (!string.IsNullOrEmpty(request.ReportText))
                    result.ReportText = request.ReportText;
                if (!string.IsNullOrEmpty(request.Findings))
                    result.Findings = request.Findings;
                if (!string.IsNullOrEmpty(request.Conclusion))
                    result.Conclusion = request.Conclusion;

                result.UpdatedAt = DateTime.UtcNow;

                _context.RadiologyResults.Update(result);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Result {id} updated");
                return Ok(new { success = true, message = "Result updated", data = new RadiologyResultDto(result) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating result: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error updating result" });
            }
        }

        // DELETE: api/radiologyresult/{id}
        // Delete result
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteResult(int id)
        {
            try
            {
                var result = await _context.RadiologyResults.FindAsync(id);
                if (result == null)
                    return NotFound(new { success = false, message = "Result not found" });

                // Delete files if they exist
                if (!string.IsNullOrEmpty(result.ImagePath) && System.IO.File.Exists(result.ImagePath))
                    System.IO.File.Delete(result.ImagePath);

                if (!string.IsNullOrEmpty(result.ReportPath) && System.IO.File.Exists(result.ReportPath))
                    System.IO.File.Delete(result.ReportPath);

                _context.RadiologyResults.Remove(result);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Result {id} deleted");
                return Ok(new { success = true, message = "Result deleted" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting result: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error deleting result" });
            }
        }

        // Helper method
        private async Task CreateNotification(int patientId, int? appointmentId, int? resultId, string type, string title, string message)
        {
            try
            {
                var notification = new Notification
                {
                    PatientId = patientId,
                    AppointmentId = appointmentId,
                    ResultId = resultId,
                    Type = type,
                    Title = title,
                    Message = message,
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
    }

    // DTOs
    public class RadiologyResultDto
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public string ReportTitle { get; set; }
        public string ReportText { get; set; }
        public string Findings { get; set; }
        public string Conclusion { get; set; }
        public string? ImageFileName { get; set; }
        public string? ImageUrl { get; set; }
        public long? ImageFileSize { get; set; }
        public string? ReportFileName { get; set; }
        public string? ReportUrl { get; set; }
        public long? ReportFileSize { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public RadiologyResultDto(RadiologyResult r)
        {
            Id = r.Id;
            AppointmentId = r.AppointmentId;
            ReportTitle = r.ReportTitle;
            ReportText = r.ReportText;
            Findings = r.Findings;
            Conclusion = r.Conclusion;
            ImageFileName = r.ImageFileName;
            ImageUrl = r.ImageUrl;
            ImageFileSize = r.ImageFileSize;
            ReportFileName = r.ReportFileName;
            ReportUrl = r.ReportUrl;
            ReportFileSize = r.ReportFileSize;
            CreatedAt = r.CreatedAt;
            UpdatedAt = r.UpdatedAt;
        }
    }

    public class CreateRadiologyResultRequest
    {
        public int AppointmentId { get; set; }
        public string ReportTitle { get; set; } = "";
        public string ReportText { get; set; } = "";
        public string Findings { get; set; } = "";
        public string Conclusion { get; set; } = "";
    }

    public class UpdateRadiologyResultRequest
    {
        public string? ReportTitle { get; set; }
        public string? ReportText { get; set; }
        public string? Findings { get; set; }
        public string? Conclusion { get; set; }
    }
}
