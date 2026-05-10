using Microsoft.AspNetCore.Mvc;
using RadiologyCenterAPI.DTOs;
using RadiologyCenterAPI.Models;
using RadiologyCenterAPI.Services;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RadiologyController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly ILogger<RadiologyController> _logger;

        public RadiologyController(IAppointmentService appointmentService, ILogger<RadiologyController> logger)
        {
            _appointmentService = appointmentService;
            _logger = logger;
        }

        /// <summary>
        /// Get all available radiology services
        /// </summary>
        [HttpGet("services")]
        public async Task<ActionResult<List<RadiologyServiceDto>>> GetServices()
        {
            try
            {
                var services = await _appointmentService.GetServicesAsync();
                var dtos = services.Select(s => new RadiologyServiceDto
                {
                    Id = s.Id,
                    Code = s.Code,
                    Display = s.Display,
                    Modality = s.Modality,
                    DurationMin = s.DurationMin,
                    Price = s.Price,
                    IsActive = s.IsActive
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving radiology services");
                return StatusCode(500, new { error = "Failed to retrieve services", details = ex.Message });
            }
        }

        /// <summary>
        /// Get available slots for a service on a specific date
        /// </summary>
        [HttpGet("slots")]
        public async Task<ActionResult<List<SlotDto>>> GetAvailableSlots([FromQuery] string service, [FromQuery] string date)
        {
            try
            {
                if (string.IsNullOrEmpty(service) || string.IsNullOrEmpty(date))
                {
                    return BadRequest(new { error = "service and date parameters are required" });
                }

                if (!DateTime.TryParse(date, out var parsedDate))
                {
                    return BadRequest(new { error = "Invalid date format. Use yyyy-MM-dd" });
                }

                var slots = await _appointmentService.GetAvailableSlotsAsync(service, parsedDate);
                var dtos = slots.Select(s => new SlotDto
                {
                    Id = s.Id,
                    Start = s.Start,
                    End = s.End,
                    Status = s.Status
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available slots");
                return StatusCode(500, new { error = "Failed to retrieve slots", details = ex.Message });
            }
        }

        /// <summary>
        /// Book a radiology appointment
        /// </summary>
        [HttpPost("book")]
        public async Task<ActionResult<BookingResult>> BookAppointment([FromBody] BookAppointmentRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { error = "Request body is required" });
                }

                // Parse the booking request
                var parsedRequest = new ParsedBookingRequest
                {
                    Patient = new PatientInfo
                    {
                        Identifier = request.PatientId.ToString(),
                        FirstName = request.PatientFirstName ?? "",
                        LastName = request.PatientLastName ?? "",
                        Email = request.PatientEmail ?? ""
                    },
                    ServiceRequest = new ServiceRequestInfo
                    {
                        Code = request.ServiceCode ?? "",
                        Display = request.ServiceDisplay ?? "",
                        Priority = request.Priority ?? "routine"
                    },
                    Appointment = new AppointmentInfo
                    {
                        Start = DateTime.Parse($"{request.AppointmentDate} {request.AppointmentTime}"),
                        End = DateTime.Parse($"{request.AppointmentDate} {request.AppointmentTime}").AddMinutes(30),
                        ServiceCode = request.ServiceCode ?? "",
                        ServiceType = request.ServiceDisplay ?? ""
                    }
                };

                var result = await _appointmentService.BookAppointmentAsync(parsedRequest);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error booking appointment");
                return StatusCode(500, new { error = "Failed to book appointment", details = ex.Message });
            }
        }

        /// <summary>
        /// Get appointment details
        /// </summary>
        [HttpGet("appointments/{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            try
            {
                var appointment = await _appointmentService.GetByIdAsync(id);
                if (appointment == null)
                {
                    return NotFound(new { error = "Appointment not found" });
                }

                return Ok(appointment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appointment");
                return StatusCode(500, new { error = "Failed to retrieve appointment", details = ex.Message });
            }
        }

        /// <summary>
        /// Get patient appointments
        /// </summary>
        [HttpGet("appointments/patient/{patientId}")]
        public async Task<ActionResult<List<Appointment>>> GetPatientAppointments(string patientId)
        {
            try
            {
                var appointments = await _appointmentService.GetPatientAppointmentsAsync(patientId);
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient appointments");
                return StatusCode(500, new { error = "Failed to retrieve appointments", details = ex.Message });
            }
        }

        /// <summary>
        /// Cancel an appointment
        /// </summary>
        [HttpPost("appointments/{id}/cancel")]
        public async Task<ActionResult<object>> CancelAppointment(int id)
        {
            try
            {
                var appointment = await _appointmentService.GetByIdAsync(id);
                if (appointment == null)
                {
                    return NotFound(new { error = "Appointment not found" });
                }

                await _appointmentService.CancelAsync(id);
                return Ok(new { message = "Appointment cancelled successfully", appointmentId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling appointment");
                return StatusCode(500, new { error = "Failed to cancel appointment", details = ex.Message });
            }
        }
    }

    /// <summary>
    /// Request DTO for booking an appointment from external systems
    /// </summary>
    public class BookAppointmentRequest
    {
        public int PatientId { get; set; }
        public string? PatientFirstName { get; set; }
        public string? PatientLastName { get; set; }
        public string? PatientEmail { get; set; }
        public string? ServiceCode { get; set; }
        public string? ServiceDisplay { get; set; }
        public string AppointmentDate { get; set; } = "";
        public string AppointmentTime { get; set; } = "";
        public string Priority { get; set; } = "routine";
    }
}
