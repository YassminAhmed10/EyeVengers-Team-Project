using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace EyeClinicAPI.Controllers
{
    // ===================== DTOs =====================

    public class CreateAppointmentRequest
    {
        public string? PatientId { get; set; }
        public string? PatientName { get; set; }
        public int? PatientGender { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public DateTime? PatientBirthDate { get; set; }
        public string? Age { get; set; }
        public string? NationalId { get; set; }
        public string? Address { get; set; }
        public int? DoctorId { get; set; }
        public string? AppointmentDate { get; set; }
        public string? AppointmentTime { get; set; }
        public int? DurationMinutes { get; set; }
        public int? Status { get; set; }
        public bool? IsSurgery { get; set; }
        public string? AppointmentType { get; set; }
        public string? ReasonForVisit { get; set; }
        public string? Notes { get; set; }
        public string? ChronicDiseases { get; set; }
        public string? CurrentMedications { get; set; }
        public string? OtherAllergies { get; set; }
        public string? VisionSymptoms { get; set; }
        public string? FamilyEyeDiseases { get; set; }
        public string? OtherFamilyDiseases { get; set; }
        public string? EyeAllergies { get; set; }
        public string? EyeSurgeries { get; set; }
        public string? OtherEyeSurgeries { get; set; }
        public string? InsuranceCompany { get; set; }
        public string? InsuranceId { get; set; }
        public string? PolicyNumber { get; set; }
        public string? Coverage { get; set; }
        public string? CoverageType { get; set; }
        public DateTime? InsuranceExpiryDate { get; set; }
        public string? InsuranceContact { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentStatus { get; set; }
        public decimal? FinalPrice { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
    }

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
        public async Task<IActionResult> PostAppointment([FromBody] CreateAppointmentRequest request)
        {
            _logger.LogInformation("Received appointment request: PatientName={PatientName}, Date={Date}, Time={Time}", 
                request?.PatientName, request?.AppointmentDate, request?.AppointmentTime);

            if (request == null)
                return BadRequest(new { message = "Appointment data is required" });

            try
            {
                // Parse date and time
                if (!DateTime.TryParse(request.AppointmentDate, out DateTime appointmentDate))
                    return BadRequest(new { message = "Invalid appointment date format" });

                if (!TimeSpan.TryParse(request.AppointmentTime, out TimeSpan appointmentTime))
                    return BadRequest(new { message = "Invalid appointment time format. Expected format: HH:mm" });

                // Create appointment entity
                var appointment = new Appointment
                {
                    PatientId = request.PatientId ?? "P-" + DateTime.Now.Ticks.ToString().Substring(0, 6),
                    PatientName = request.PatientName ?? "",
                    PatientGender = (PatientGender)(request.PatientGender ?? 0),
                    Phone = request.Phone,
                    Email = request.Email,
                    PatientBirthDate = request.PatientBirthDate,
                    Age = request.Age,
                    NationalId = request.NationalId,
                    Address = request.Address,
                    DoctorId = request.DoctorId ?? 1,
                    AppointmentDate = appointmentDate,
                    AppointmentTime = appointmentTime,
                    DurationMinutes = request.DurationMinutes ?? 30,
                    Status = (AppointmentStatus)(request.Status ?? 0),
                    IsSurgery = request.IsSurgery ?? false,
                    AppointmentType = request.AppointmentType ?? "offline",
                    ReasonForVisit = request.ReasonForVisit,
                    Notes = request.Notes,
                    ChronicDiseases = request.ChronicDiseases,
                    CurrentMedications = request.CurrentMedications,
                    OtherAllergies = request.OtherAllergies,
                    VisionSymptoms = request.VisionSymptoms,
                    FamilyEyeDiseases = request.FamilyEyeDiseases,
                    OtherFamilyDiseases = request.OtherFamilyDiseases,
                    EyeAllergies = request.EyeAllergies,
                    EyeSurgeries = request.EyeSurgeries,
                    OtherEyeSurgeries = request.OtherEyeSurgeries,
                    InsuranceCompany = request.InsuranceCompany,
                    InsuranceId = request.InsuranceId,
                    PolicyNumber = request.PolicyNumber,
                    Coverage = request.Coverage,
                    CoverageType = request.CoverageType,
                    InsuranceExpiryDate = request.InsuranceExpiryDate,
                    InsuranceContact = request.InsuranceContact,
                    PaymentMethod = request.PaymentMethod,
                    PaymentStatus = request.PaymentStatus,
                    FinalPrice = request.FinalPrice,
                    EmergencyContactName = request.EmergencyContactName,
                    EmergencyContactPhone = request.EmergencyContactPhone,
                    CreatedAt = DateTime.Now
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Appointment created successfully: ID={appointmentId}", appointment.AppointmentId);
                
                return Ok(appointment);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error while creating appointment");
                return BadRequest(new { message = "Database error", error = ex.InnerException?.Message ?? ex.Message });
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
            _logger.LogInformation("PATCH request received for appointment ID: {id}, Status: {status}", id, request.Status);
            
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                _logger.LogWarning("Appointment not found: {id}", id);
                return NotFound();
            }

            _logger.LogInformation("Current appointment status: {currentStatus}", appointment.Status);

            if (request.Status.HasValue &&
                Enum.IsDefined(typeof(AppointmentStatus), request.Status.Value))
            {
                var oldStatus = appointment.Status;
                appointment.Status = (AppointmentStatus)request.Status.Value;
                appointment.UpdatedAt = DateTime.Now;
                _logger.LogInformation("Status updated from {oldStatus} to {newStatus}", oldStatus, appointment.Status);
            }

            if (request.IsSurgery.HasValue)
            {
                appointment.IsSurgery = request.IsSurgery.Value;
                appointment.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Appointment {id} saved successfully to database", id);
            
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
            var appointmentDateTime = appointment.AppointmentDate.Date.Add(appointment.AppointmentTime);

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
