using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models.Clinic;
using System.Text.Json;

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
        public IActionResult Ping() =>
            Ok(new { message = "DoctorOrders API is working!", timestamp = DateTime.UtcNow });

        // ── GET MyOrders?patientId=P-532756 ──────────────────────────────────
        // patientId is now a string — accepts P-XXXXXX format
        [HttpGet("MyOrders")]
        public async Task<IActionResult> GetMyOrders([FromQuery] string patientId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(patientId))
                    return BadRequest(new { message = "patientId is required" });

                // Normalize: ensure P- prefix
                var normalizedId = NormalizePatientId(patientId);

                _logger.LogInformation("GetMyOrders — PatientId: {PatientId}", normalizedId);

                var orders = await _context.DoctorOrders
                    .Where(o => o.PatientId == normalizedId)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                return Ok(orders.Select(MapToResponse));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for patient {PatientId}", patientId);
                return StatusCode(500, new { message = "Error retrieving orders", error = ex.Message });
            }
        }

        // ── GET ByMedicalRecord/{medicalRecordId} ─────────────────────────────
        [HttpGet("ByMedicalRecord/{medicalRecordId}")]
        public async Task<IActionResult> GetByMedicalRecord(int medicalRecordId)
        {
            try
            {
                _logger.LogInformation("GetByMedicalRecord — MedicalRecordId: {Id}", medicalRecordId);

                var orders = await _context.DoctorOrders
                    .Where(o => o.MedicalRecordId == medicalRecordId)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                return Ok(orders.Select(MapToResponse));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for medical record {Id}", medicalRecordId);
                return StatusCode(500, new { message = "Error retrieving orders", error = ex.Message });
            }
        }

        // ── POST (create order) ───────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> PostDoctorOrder([FromBody] DoctorOrderDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.PatientId))
                    return BadRequest(new { message = "patientId is required" });

                // Normalize: ensure P- prefix
                var normalizedPatientId = NormalizePatientId(dto.PatientId);

                // Get doctor
                int doctorId = 1;
                var anyDoctor = await _context.Doctors.FirstOrDefaultAsync();
                if (anyDoctor != null) doctorId = anyDoctor.DoctorId;

                var order = new DoctorOrder
                {
                    PatientId       = normalizedPatientId,
                    MedicalRecordId = dto.MedicalRecordId,
                    DoctorId        = doctorId,
                    OrderType       = dto.OrderType,
                    DataJson        = JsonSerializer.Serialize(dto.Data),
                    Status          = "PendingPatientApproval",
                    CreatedAt       = DateTime.UtcNow
                };

                _context.DoctorOrders.Add(order);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Order created — Id: {Id}, PatientId: {PatientId}", order.Id, order.PatientId);

                return Ok(new { message = "Order created successfully", order = MapToResponse(order) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, new { message = "Error creating order", error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }

        // ── PATCH {id}/Respond ────────────────────────────────────────────────
        [HttpPatch("{id}/Respond")]
        public async Task<IActionResult> RespondToOrder(int id, [FromBody] OrderResponseDto response)
        {
            try
            {
                var order = await _context.DoctorOrders.FindAsync(id);
                if (order == null) return NotFound(new { message = "Order not found" });

                if (response.Action == "Accepted")
                    order.Status = "Accepted";
                else if (response.Action == "Rejected")
                {
                    order.Status = "Rejected";
                    order.RejectionReason = response.RejectionReason;
                    order.RespondedAt = DateTime.UtcNow;
                }
                else
                    return BadRequest(new { message = "Invalid action. Use 'Accepted' or 'Rejected'" });

                await _context.SaveChangesAsync();
                return Ok(MapToResponse(order));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error responding to order {Id}", id);
                return StatusCode(500, new { message = "Error updating order" });
            }
        }

        // ── PATCH {id}/Book ───────────────────────────────────────────────────
        [HttpPatch("{id}/Book")]
        public async Task<IActionResult> BookOrder(int id, [FromBody] BookOrderDto booking)
        {
            try
            {
                var order = await _context.DoctorOrders.FindAsync(id);
                if (order == null) return NotFound(new { message = "Order not found" });

                order.Status          = "Booked";
                order.AppointmentDate = booking.AppointmentDate;
                order.AppointmentTime = booking.AppointmentTime;
                order.ExternalSystemConfirmationId = $"BOOK-{DateTime.Now.Ticks}";

                await _context.SaveChangesAsync();
                return Ok(MapToResponse(order));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error booking order {Id}", id);
                return StatusCode(500, new { message = "Error booking order" });
            }
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        /// Ensures PatientId always has P- prefix (P-532756, not 532756)
        private static string NormalizePatientId(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) return id;
            var trimmed = id.Trim();
            return trimmed.StartsWith("P-", StringComparison.OrdinalIgnoreCase)
                ? trimmed.ToUpper()
                : $"P-{trimmed}";
        }

        private static object MapToResponse(DoctorOrder o) => new
        {
            id                           = o.Id,
            patientId                    = o.PatientId,
            medicalRecordId              = o.MedicalRecordId,
            doctorId                     = o.DoctorId,
            orderType                    = o.OrderType,
            dataJson                     = o.DataJson,
            data                         = TryParseJson(o.DataJson),
            status                       = o.Status,
            createdAt                    = o.CreatedAt,
            respondedAt                  = o.RespondedAt,
            rejectionReason              = o.RejectionReason,
            appointmentDate              = o.AppointmentDate,
            appointmentTime              = o.AppointmentTime,
            externalSystemConfirmationId = o.ExternalSystemConfirmationId,
        };

        private static object? TryParseJson(string json)
        {
            try { return JsonSerializer.Deserialize<object>(json); }
            catch { return null; }
        }
    }

    public class DoctorOrderDto
    {
        public string PatientId { get; set; } = "";   // P-XXXXXX
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