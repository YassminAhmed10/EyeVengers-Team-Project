using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class AppointmentController : ControllerBase
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<AppointmentController> _logger;

        public AppointmentController(RadiologyDbContext context, ILogger<AppointmentController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/appointment
        // Get all appointments with filters
        [HttpGet]
        public async Task<ActionResult> GetAppointments([FromQuery] string? status = null, [FromQuery] string? investigationStatus = null)
        {
            try
            {
                var query = _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.RadiologyService)
                    .Include(a => a.Slot)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(a => a.Status == status);

                if (!string.IsNullOrEmpty(investigationStatus))
                    query = query.Where(a => a.InvestigationStatus == investigationStatus);

                var appointments = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = appointments.Select(a => new AppointmentDto(a))
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching appointments: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error fetching appointments" });
            }
        }

        // GET: api/appointment/{id}
        // Get specific appointment
        [HttpGet("{id}")]
        public async Task<ActionResult> GetAppointment(int id)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.RadiologyService)
                    .Include(a => a.Results)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                    return NotFound(new { success = false, message = "Appointment not found" });

                return Ok(new { success = true, data = new AppointmentDto(appointment) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching appointment: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error fetching appointment" });
            }
        }

        // GET: api/appointment/patient/{patientId}
        // Get appointments for specific patient
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult> GetPatientAppointments(int patientId, [FromQuery] string? status = null)
        {
            try
            {
                var query = _context.Appointments
                    .Include(a => a.RadiologyService)
                    .Include(a => a.Results)
                    .Where(a => a.PatientId == patientId)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(a => a.Status == status);

                var appointments = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();

                return Ok(new { success = true, data = appointments.Select(a => new AppointmentDto(a)) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching patient appointments: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error fetching appointments" });
            }
        }

        // POST: api/appointment/{id}/accept
        // Admin accepts appointment request
        [HttpPost("{id}/accept")]
        public async Task<ActionResult> AcceptAppointment(int id, [FromBody] AcceptAppointmentRequest request)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null)
                    return NotFound(new { success = false, message = "Appointment not found" });

                appointment.Status = "Accepted";
                appointment.InvestigationStatus = "Upcoming";
                appointment.AcceptedAt = DateTime.UtcNow;
                appointment.UpdatedAt = DateTime.UtcNow;
                if (!string.IsNullOrEmpty(request.AdminNotes))
                    appointment.AdminNotes = request.AdminNotes;

                _context.Appointments.Update(appointment);
                await _context.SaveChangesAsync();

                // Create notification
                await CreateNotification(appointment.PatientId, appointment.Id, null, "appointment_accepted", "Appointment Accepted", $"Your appointment has been accepted for {appointment.RadiologyService?.Display}");

                _logger.LogInformation($"Appointment {id} accepted by admin");
                return Ok(new { success = true, message = "Appointment accepted", data = new AppointmentDto(appointment) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error accepting appointment: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error accepting appointment" });
            }
        }

        // POST: api/appointment/{id}/reject
        // Admin rejects appointment request
        [HttpPost("{id}/reject")]
        public async Task<ActionResult> RejectAppointment(int id, [FromBody] RejectAppointmentRequest request)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null)
                    return NotFound(new { success = false, message = "Appointment not found" });

                appointment.Status = "Rejected";
                appointment.UpdatedAt = DateTime.UtcNow;
                appointment.AdminNotes = request.Reason;

                _context.Appointments.Update(appointment);
                await _context.SaveChangesAsync();

                // Create notification
                await CreateNotification(appointment.PatientId, appointment.Id, null, "appointment_rejected", "Appointment Rejected", $"Your appointment request has been rejected: {request.Reason}");

                _logger.LogInformation($"Appointment {id} rejected by admin");
                return Ok(new { success = true, message = "Appointment rejected" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error rejecting appointment: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error rejecting appointment" });
            }
        }

        // PUT: api/appointment/{id}/investigation-status
        // Update investigation status (Upcoming -> In Progress -> Done)
        [HttpPut("{id}/investigation-status")]
        public async Task<ActionResult> UpdateInvestigationStatus(int id, [FromBody] UpdateInvestigationStatusRequest request)
        {
            try
            {
                var appointment = await _context.Appointments.FindAsync(id);
                if (appointment == null)
                    return NotFound(new { success = false, message = "Appointment not found" });

                var validStatuses = new[] { "Upcoming", "In Progress", "Done" };
                if (!validStatuses.Contains(request.Status))
                    return BadRequest(new { success = false, message = "Invalid status" });

                appointment.InvestigationStatus = request.Status;
                appointment.UpdatedAt = DateTime.UtcNow;

                if (request.Status == "Done")
                    appointment.CompletedAt = DateTime.UtcNow;

                _context.Appointments.Update(appointment);
                await _context.SaveChangesAsync();

                // Create notification
                await CreateNotification(appointment.PatientId, appointment.Id, null, "status_update", "Investigation Status Updated", $"Your investigation status has been updated to: {request.Status}");

                _logger.LogInformation($"Appointment {id} investigation status updated to {request.Status}");
                return Ok(new { success = true, message = $"Status updated to {request.Status}", data = new AppointmentDto(appointment) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating investigation status: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error updating status" });
            }
        }

        // POST: api/appointment
        // Create new appointment (patient booking)
        [HttpPost]
        public async Task<ActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            try
            {
                // Validate patient exists
                var patient = await _context.Patients.FindAsync(request.PatientId);
                if (patient == null)
                    return NotFound(new { success = false, message = "Patient not found" });

                // Update patient info if provided
                if (!string.IsNullOrEmpty(request.PatientName))
                {
                    var parts = request.PatientName.Split(' ', 2);
                    patient.FirstName = parts[0];
                    patient.LastName = parts.Length > 1 ? parts[1] : "";
                }
                if (!string.IsNullOrEmpty(request.PatientEmail))
                    patient.Email = request.PatientEmail;
                if (!string.IsNullOrEmpty(request.PatientPhone))
                    patient.Phone = request.PatientPhone;
                if (!string.IsNullOrEmpty(request.PatientGender))
                    patient.Gender = request.PatientGender;
                if (request.PatientAge.HasValue && request.PatientAge > 0)
                {
                    // Calculate approximate birth date from age
                    patient.BirthDate = DateTime.Now.AddYears(-request.PatientAge.Value);
                }

                // Create new appointment
                var appointment = new Appointment
                {
                    PatientId = request.PatientId,
                    RadiologyServiceId = request.RadiologyServiceId,
                    Status = request.Status ?? "Pending",
                    InvestigationStatus = "Upcoming",
                    Priority = request.Priority ?? "Normal",
                    Notes = request.Notes,
                    PractitionerRef = request.RequestingDoctor,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // If slotDateTime is provided, create a new slot
                if (request.SlotDateTime.HasValue)
                {
                    var slot = new Slot
                    {
                        Start = request.SlotDateTime.Value,
                        End = request.SlotDateTime.Value.AddHours(1),
                        IsBooked = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Slots.Add(slot);
                    await _context.SaveChangesAsync();
                    appointment.SlotId = slot.Id;
                }

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"✓ New appointment created - ID: {appointment.Id}, Patient: {patient.FirstName} {patient.LastName}, Service: {request.RadiologyServiceId}, Status: {appointment.Status}");
                return Ok(new { success = true, message = "Appointment created successfully and sent to admin for review", data = new AppointmentDto(appointment) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating appointment: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error creating appointment: " + ex.Message });
            }
        }

        // Helper method to create notification
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
    public class AppointmentDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string PatientEmail { get; set; }
        public string PatientPhone { get; set; }
        public string ServiceName { get; set; }
        public string Status { get; set; }
        public string InvestigationStatus { get; set; }
        public string Priority { get; set; }
        public string? AdminNotes { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? SlotDateTime { get; set; }
        public int ResultCount { get; set; }

        public AppointmentDto(Appointment a)
        {
            Id = a.Id;
            PatientId = a.PatientId;
            PatientName = a.Patient != null ? $"{a.Patient.FirstName} {a.Patient.LastName}" : "Unknown";
            PatientEmail = a.Patient?.Email ?? "";
            PatientPhone = a.Patient?.Phone ?? "";
            ServiceName = a.RadiologyService?.Display ?? "Unknown";
            Status = a.Status;
            InvestigationStatus = a.InvestigationStatus;
            Priority = a.Priority;
            AdminNotes = a.AdminNotes;
            Notes = a.Notes;
            CreatedAt = a.CreatedAt;
            AcceptedAt = a.AcceptedAt;
            CompletedAt = a.CompletedAt;
            SlotDateTime = a.Slot?.Start;
            ResultCount = a.Results?.Count ?? 0;
        }
    }

    public class AcceptAppointmentRequest
    {
        public string? AdminNotes { get; set; }
    }

    public class RejectAppointmentRequest
    {
        public string Reason { get; set; } = "";
    }

    public class UpdateInvestigationStatusRequest
    {
        public string Status { get; set; } = ""; // Upcoming, In Progress, Done
    }

    public class CreateAppointmentRequest
    {
        public int PatientId { get; set; }
        public string? PatientName { get; set; }
        public string? PatientEmail { get; set; }
        public string? PatientPhone { get; set; }
        public int? PatientAge { get; set; }
        public string? PatientGender { get; set; }
        public int RadiologyServiceId { get; set; }
        public DateTime? SlotDateTime { get; set; }
        public string? Priority { get; set; }
        public string? Notes { get; set; }
        public string? RequestingDoctor { get; set; }
        public string? Status { get; set; }
    }
}
