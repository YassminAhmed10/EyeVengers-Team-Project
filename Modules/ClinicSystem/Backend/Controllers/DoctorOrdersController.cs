using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models.Clinic;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace EyeClinicAPI.Modules.ClinicSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorOrdersController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;
        private readonly ILogger<DoctorOrdersController> _logger;

        public DoctorOrdersController(EyeClinicDbContext context, ILogger<DoctorOrdersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok(new { 
                message = "DoctorOrders API is working!", 
                timestamp = DateTime.UtcNow,
                status = "online"
            });
        }

        [HttpGet("MyOrders")]
        public async Task<ActionResult<IEnumerable<DoctorOrder>>> GetMyOrders([FromQuery] int patientId)
        {
            try
            {
                _logger.LogInformation("Getting orders for patient ID: {PatientId}", patientId);
                var orders = await _context.DoctorOrders
                    .Where(o => o.PatientId == patientId)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "Error retrieving orders", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DoctorOrder>> PostDoctorOrder([FromBody] DoctorOrderDto orderDto)
        {
            try
            {
                _logger.LogInformation("=== CREATE ORDER REQUEST ===");
                _logger.LogInformation("PatientId: {PatientId}", orderDto.PatientId);
                _logger.LogInformation("MedicalRecordId: {MedicalRecordId}", orderDto.MedicalRecordId);
                _logger.LogInformation("OrderType: {OrderType}", orderDto.OrderType);
                
                int doctorId = 1;
                var doctor = await _context.Doctors.FindAsync(doctorId);
                if (doctor == null)
                {
                    _logger.LogWarning("Doctor with ID {DoctorId} not found!", doctorId);
                    var anyDoctor = await _context.Doctors.FirstOrDefaultAsync();
                    if (anyDoctor != null)
                    {
                        doctorId = anyDoctor.DoctorId;
                        _logger.LogInformation("Using doctor ID: {DoctorId}", doctorId);
                    }
                    else
                    {
                        return BadRequest(new { message = "No doctor found in the system. Please add a doctor first." });
                    }
                }
                
                var order = new DoctorOrder
                {
                    PatientId = orderDto.PatientId,
                    MedicalRecordId = orderDto.MedicalRecordId,
                    DoctorId = doctorId,
                    OrderType = orderDto.OrderType,
                    DataJson = JsonSerializer.Serialize(orderDto.Data),
                    Status = "PendingPatientApproval",
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.DoctorOrders.Add(order);
                
                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException dbEx)
                {
                    _logger.LogError(dbEx, "Database update exception");
                    return StatusCode(500, new 
                    { 
                        message = "Database error", 
                        error = dbEx.Message,
                        innerError = dbEx.InnerException?.Message,
                        stackTrace = dbEx.StackTrace
                    });
                }
                
                _logger.LogInformation("Order created successfully with ID: {OrderId}", order.Id);
                
                return Ok(new
                {
                    message = "Order created successfully",
                    order = order
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, new 
                { 
                    message = "Error creating order", 
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPatch("{id}/Respond")]
        public async Task<IActionResult> RespondToOrder(int id, [FromBody] OrderResponseDto response)
        {
            try
            {
                var order = await _context.DoctorOrders.FindAsync(id);
                if (order == null)
                    return NotFound(new { message = "Order not found" });
                
                if (response.Action == "Accepted")
                {
                    order.Status = "Accepted";
                }
                else if (response.Action == "Rejected")
                {
                    order.Status = "Rejected";
                    order.RejectionReason = response.RejectionReason;
                }
                else
                {
                    return BadRequest(new { message = "Invalid action. Use 'Accepted' or 'Rejected'" });
                }
                
                await _context.SaveChangesAsync();
                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error responding to order {OrderId}", id);
                return StatusCode(500, new { message = "Error updating order" });
            }
        }

        [HttpPatch("{id}/Book")]
        public async Task<IActionResult> BookOrder(int id, [FromBody] BookOrderDto booking)
        {
            try
            {
                var order = await _context.DoctorOrders.FindAsync(id);
                if (order == null)
                    return NotFound(new { message = "Order not found" });
                
                order.Status = "Booked";
                order.AppointmentDate = booking.AppointmentDate;
                order.AppointmentTime = booking.AppointmentTime;
                order.ExternalSystemConfirmationId = $"BOOK-{DateTime.Now.Ticks}";
                
                await _context.SaveChangesAsync();
                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error booking order {OrderId}", id);
                return StatusCode(500, new { message = "Error booking order" });
            }
        }
    }

    public class DoctorOrderDto
    {
        public int PatientId { get; set; }
        public int MedicalRecordId { get; set; }
        public string OrderType { get; set; } = "";
        public object Data { get; set; } = new object();
    }

    public class OrderResponseDto
    {
        public string Action { get; set; } = "";
        public string? RejectionReason { get; set; }
    }

    public class BookOrderDto
    {
        public DateTime AppointmentDate { get; set; }
        public string AppointmentTime { get; set; } = "";
    }
}

