using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace EyeClinicAPI.Controllers
{
    // ===================== DTOs =====================

    public class UpdateAppointmentRequest
    {
        public int? Status { get; set; }
        public bool? IsSurgery { get; set; }
    }

    public class PatientInfoDto
    {
        public string Name { get; set; } = string.Empty;
        public string PatientId { get; set; } = string.Empty;
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public DateTime? LastVisit { get; set; }
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
        public string? InsuranceCompany { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Address { get; set; }
        public string? NationalId { get; set; }
        public string? InsuranceId { get; set; }
        public string? PolicyNumber { get; set; }
        public string? Coverage { get; set; }
        public string? CoverageType { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
    }

    // ===================== Controller =====================

    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(
            EyeClinicDbContext context,
            ILogger<AppointmentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ===================== GET =====================

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            return await _context.Appointments
                .Include(a => a.Doctor)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
                return NotFound();

            return appointment;
        }

        [HttpGet("ByPatient/{patientId}")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointmentsByPatient(string patientId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.PatientId.ToLower() == patientId.ToLower())
                .Include(a => a.Doctor)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();

            if (!appointments.Any())
                return NotFound();

            return Ok(appointments);
        }

        [HttpGet("ByDate/{date}")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointmentsByDate(string date)
        {
            if (!DateTime.TryParse(date, out DateTime parsedDate))
                return BadRequest(new { message = "Invalid date format" });

            var appointments = await _context.Appointments
                .Where(a => a.AppointmentDate.Date == parsedDate.Date)
                .Include(a => a.Doctor)
                .OrderBy(a => a.AppointmentTime)
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("statistics/{date}")]
        public async Task<ActionResult<object>> GetAppointmentStatistics(string date)
        {
            if (!DateTime.TryParse(date, out DateTime parsedDate))
                return BadRequest(new { message = "Invalid date format" });

            var startDate = parsedDate.Date;
            var endDate = startDate.AddDays(1);

            var appointmentsOnDate = await _context.Appointments
                .Where(a => a.AppointmentDate >= startDate && a.AppointmentDate < endDate)
                .ToListAsync();

            var totalOnlineConfirmed = appointmentsOnDate.Count(a => a.AppointmentType.ToLower() == "online" && a.Status == AppointmentStatus.Upcoming);
            var totalOffline = appointmentsOnDate.Count(a => a.AppointmentType.ToLower() != "online");
            var totalAppointments = appointmentsOnDate.Count;
            var pendingRequests = appointmentsOnDate.Count(a => a.AppointmentType.ToLower() == "online" && a.Status != AppointmentStatus.Upcoming && a.Status != AppointmentStatus.Completed);

            return Ok(new
            {
                date = parsedDate.Date.ToString("yyyy-MM-dd"),
                totalOnlineAppointments = totalOnlineConfirmed,
                totalOfflineAppointments = totalOffline,
                totalAppointments = totalAppointments,
                pendingOnlineRequests = pendingRequests,
                confirmedAppointments = appointmentsOnDate.Count(a => a.Status == AppointmentStatus.Upcoming),
                completedAppointments = appointmentsOnDate.Count(a => a.Status == AppointmentStatus.Completed),
                cancelledAppointments = appointmentsOnDate.Count(a => a.Status == AppointmentStatus.Cancelled),
                surgeryAppointments = appointmentsOnDate.Count(a => a.IsSurgery)
            });
        }

        // ===================== POST (FIXED) =====================

        [HttpPost]
        public async Task<IActionResult> PostAppointment([FromBody] Appointment appointment)
        {
            // Log the incoming request
            _logger.LogInformation("Received appointment: PatientName={PatientName}, Date={Date}, Time={Time}", 
                appointment?.PatientName, appointment?.AppointmentDate, appointment?.AppointmentTime);

            if (appointment == null)
                return BadRequest(new { message = "Appointment data is required" });

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                _logger.LogError("Invalid model state: {errors}", string.Join(", ", errors));
                return BadRequest(new { message = "Validation failed", errors = errors });
            }

            // Set default values for required fields
            if (appointment.CreatedAt == default)
                appointment.CreatedAt = DateTime.Now;
            
            if (appointment.DurationMinutes == 0)
                appointment.DurationMinutes = 30;

            try
            {
                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Appointment created successfully: {appointmentId}", appointment.AppointmentId);
                return Ok(appointment);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error while creating appointment");
                return BadRequest(new { message = "Database error", error = ex.InnerException?.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment");
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        // ===================== PATCH =====================

        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchAppointment(
            int id,
            [FromBody] UpdateAppointmentRequest request)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound();

            if (request.Status.HasValue &&
                Enum.IsDefined(typeof(AppointmentStatus), request.Status.Value))
            {
                appointment.Status = (AppointmentStatus)request.Status.Value;
                appointment.UpdatedAt = DateTime.Now;
            }

            if (request.IsSurgery.HasValue)
            {
                appointment.IsSurgery = request.IsSurgery.Value;
                appointment.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ===================== CONFIRM ONLINE APPOINTMENT =====================

        [HttpPut("confirm/{id}")]
        public async Task<IActionResult> ConfirmAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            if (appointment.AppointmentType != "online")
                return BadRequest(new { message = "Only online appointments can be confirmed" });

            // Update appointment status based on time
            var currentDateTime = DateTime.Now;
            var appointmentDateTime = appointment.AppointmentDate.Date + appointment.AppointmentTime;

            // If appointment is in the past or within 15 minutes, mark as InProgress
            if (appointmentDateTime <= currentDateTime.AddMinutes(15))
            {
                appointment.Status = AppointmentStatus.InProgress;
            }
            else
            {
                // Otherwise mark as Upcoming
                appointment.Status = AppointmentStatus.Upcoming;
            }

            appointment.UpdatedAt = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Appointment {id} confirmed successfully", id);
                
                return Ok(new 
                { 
                    message = "Appointment confirmed successfully",
                    appointment = appointment,
                    notificationSent = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming appointment {id}", id);
                return StatusCode(500, new { message = "Error confirming appointment", error = ex.Message });
            }
        }
    }
}
