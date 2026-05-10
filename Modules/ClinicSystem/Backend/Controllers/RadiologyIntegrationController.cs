using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using EyeClinicAPI.Services;

namespace EyeClinicAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RadiologyIntegrationController : ControllerBase
    {
        private readonly IRadiologyIntegrationService _radiologyService;
        private readonly ILogger<RadiologyIntegrationController> _logger;

        public RadiologyIntegrationController(
            IRadiologyIntegrationService radiologyService,
            ILogger<RadiologyIntegrationController> logger)
        {
            _radiologyService = radiologyService;
            _logger = logger;
        }

        /// <summary>
        /// Get all available radiology services from Radiology Center
        /// </summary>
        [HttpGet("services")]
        public async Task<IActionResult> GetServices()
        {
            try
            {
                var services = await _radiologyService.GetServicesAsync();
                return Ok(services);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error connecting to Radiology Center");
                return StatusCode(503, new { error = "Radiology Center is unavailable", details = ex.Message });
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
        public async Task<IActionResult> GetAvailableSlots([FromQuery] string service, [FromQuery] string date)
        {
            try
            {
                if (string.IsNullOrEmpty(service) || string.IsNullOrEmpty(date))
                {
                    return BadRequest(new { error = "service and date parameters are required" });
                }

                var slots = await _radiologyService.GetAvailableSlotsAsync(service, date);
                return Ok(slots);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error connecting to Radiology Center");
                return StatusCode(503, new { error = "Radiology Center is unavailable", details = ex.Message });
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
        public async Task<IActionResult> BookAppointment([FromBody] BookRadiologyAppointmentRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { error = "Request body is required" });
                }

                var result = await _radiologyService.BookAppointmentAsync(request);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error connecting to Radiology Center");
                return StatusCode(503, new { error = "Radiology Center is unavailable", details = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid booking request");
                return BadRequest(new { error = "Invalid booking request", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error booking appointment");
                return StatusCode(500, new { error = "Failed to book appointment", details = ex.Message });
            }
        }

        /// <summary>
        /// Get appointment status
        /// </summary>
        [HttpGet("appointments/{appointmentId}")]
        public async Task<IActionResult> GetAppointmentStatus(int appointmentId)
        {
            try
            {
                var appointment = await _radiologyService.GetAppointmentStatusAsync(appointmentId);
                return Ok(appointment);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error connecting to Radiology Center");
                return StatusCode(503, new { error = "Radiology Center is unavailable", details = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "Appointment not found", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appointment status");
                return StatusCode(500, new { error = "Failed to retrieve appointment", details = ex.Message });
            }
        }

        /// <summary>
        /// Cancel a booked appointment
        /// </summary>
        [HttpPost("appointments/{appointmentId}/cancel")]
        public async Task<IActionResult> CancelAppointment(int appointmentId)
        {
            try
            {
                var result = await _radiologyService.CancelAppointmentAsync(appointmentId);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error connecting to Radiology Center");
                return StatusCode(503, new { error = "Radiology Center is unavailable", details = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "Appointment not found", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling appointment");
                return StatusCode(500, new { error = "Failed to cancel appointment", details = ex.Message });
            }
        }
    }

    /// <summary>
    /// Request DTO for booking a radiology appointment from the clinic system
    /// </summary>
    public class BookRadiologyAppointmentRequest
    {
        public int OrderId { get; set; }
        public string? AppointmentDate { get; set; }
        public string? AppointmentTime { get; set; }
        public string? ServiceCode { get; set; }
        public string? ServiceDisplay { get; set; }
        public string Priority { get; set; } = "routine";
    }
}
