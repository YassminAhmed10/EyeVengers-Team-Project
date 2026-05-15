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
        [HttpGet("MyOrders")]
        public async Task<IActionResult> GetMyOrders([FromQuery] string patientId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(patientId))
                    return BadRequest(new { message = "patientId is required" });

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

                var normalizedPatientId = NormalizePatientId(dto.PatientId);

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
                {
                    order.Status = "Accepted";
                    order.AcceptedAt = DateTime.UtcNow;
                }
                else if (response.Action == "Rejected")
                {
                    order.Status = "Rejected";
                    order.RejectionReason = response.RejectionReason;
                    order.RespondedAt = DateTime.UtcNow;
                }
                else
                    return BadRequest(new { message = "Invalid action. Use 'Accepted' or 'Rejected'" });

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Order {Id} status updated to {Status}", id, order.Status);
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
                order.BookedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Order {Id} booked for {Date} at {Time}", id, booking.AppointmentDate, booking.AppointmentTime);
                return Ok(MapToResponse(order));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error booking order {Id}", id);
                return StatusCode(500, new { message = "Error booking order" });
            }
        }

        // ── NEW: PATCH {id}/Status (for radiology booking confirmation) ────────
        [HttpPatch("{id}/Status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            try
            {
                var order = await _context.DoctorOrders.FindAsync(id);
                if (order == null)
                    return NotFound(new { message = "Order not found", success = false });

                // Update order status
                order.Status = request.Status;
                order.UpdatedAt = request.UpdatedAt ?? DateTime.UtcNow;
                
                // Update appointment details if provided
                if (!string.IsNullOrEmpty(request.AppointmentDate))
                    order.AppointmentDate = DateTime.Parse(request.AppointmentDate);
                
                if (!string.IsNullOrEmpty(request.AppointmentTime))
                    order.AppointmentTime = request.AppointmentTime;
                
                if (!string.IsNullOrEmpty(request.RadiologyBookingRef))
                    order.ExternalSystemConfirmationId = request.RadiologyBookingRef;
                
                if (request.AppointmentId.HasValue)
                    order.RadiologyAppointmentId = request.AppointmentId.Value.ToString();
                
                // Set status-specific timestamps
                if (request.Status == "Booked" && order.BookedAt == null)
                    order.BookedAt = DateTime.UtcNow;
                else if (request.Status == "InProgress")
                    order.InProgressAt = DateTime.UtcNow;
                else if (request.Status == "Completed")
                    order.CompletedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Order {Id} status updated to {Status} from Radiology system", id, request.Status);
                
                // Create notification for patient (optional)
                await CreateOrderStatusNotification(order);
                
                return Ok(new { 
                    success = true, 
                    message = $"Order status updated to {request.Status}",
                    data = MapToResponse(order)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status for {Id}", id);
                return StatusCode(500, new { message = "Error updating order status", error = ex.Message, success = false });
            }
        }

        // ── NEW: GET patient/{patientId}/status (get order by status) ──────────
        [HttpGet("patient/{patientId}/status/{status}")]
        public async Task<IActionResult> GetOrdersByStatus(string patientId, string status)
        {
            try
            {
                var normalizedId = NormalizePatientId(patientId);
                var orders = await _context.DoctorOrders
                    .Where(o => o.PatientId == normalizedId && o.Status == status)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();
                    
                return Ok(orders.Select(MapToResponse));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders by status");
                return StatusCode(500, new { message = "Error retrieving orders", error = ex.Message });
            }
        }

        // ── NEW: GET radiology/sync/{orderId} (sync order from radiology) ─────
        [HttpGet("radiology/sync/{orderId}")]
        public async Task<IActionResult> GetOrderForRadiologySync(int orderId)
        {
            try
            {
                var order = await _context.DoctorOrders
                    .Include(o => o.Patient)
                    .FirstOrDefaultAsync(o => o.Id == orderId);
                    
                if (order == null)
                    return NotFound(new { success = false, message = "Order not found" });
                
                return Ok(new
                {
                    success = true,
                    order = new
                    {
                        id = order.Id,
                        patientId = order.PatientId,
                        patientName = order.Patient?.Name,
                        patientEmail = order.Patient?.Email,
                        patientPhone = order.Patient?.Phone,
                        doctorName = order.Doctor?.Name ?? "Referring Physician",
                        requestedTest = GetRequestedTestFromData(order.DataJson),
                        orderNotes = GetOrderNotesFromData(order.DataJson),
                        priority = GetPriorityFromData(order.DataJson),
                        status = order.Status,
                        createdAt = order.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing order for radiology");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ── NEW: POST radiology/webhook (receive appointment confirmation) ─────
        [HttpPost("radiology/webhook")]
        public async Task<IActionResult> ReceiveRadiologyConfirmation([FromBody] RadiologyConfirmationDto confirmation)
        {
            try
            {
                _logger.LogInformation("Received radiology confirmation for order {OrderId}", confirmation.OrderId);
                
                var order = await _context.DoctorOrders.FindAsync(confirmation.OrderId);
                if (order == null)
                    return NotFound(new { success = false, message = "Order not found" });
                
                // Update order with radiology booking info
                order.Status = "Booked";
                order.ExternalSystemConfirmationId = confirmation.BookingReference;
                order.AppointmentDate = DateTime.Parse(confirmation.AppointmentDate);
                order.AppointmentTime = confirmation.AppointmentTime;
                order.RadiologyAppointmentId = confirmation.RadiologyAppointmentId;
                order.BookedAt = DateTime.UtcNow;
                order.RadiologyStatus = "Confirmed";
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Order {OrderId} confirmed by Radiology system", confirmation.OrderId);
                
                return Ok(new { success = true, message = "Order confirmed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing radiology confirmation");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ── Helper methods ───────────────────────────────────────────────────

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
            id = o.Id,
            patientId = o.PatientId,
            medicalRecordId = o.MedicalRecordId,
            doctorId = o.DoctorId,
            orderType = o.OrderType,
            dataJson = o.DataJson,
            data = TryParseJson(o.DataJson),
            status = o.Status,
            createdAt = o.CreatedAt,
            respondedAt = o.RespondedAt,
            acceptedAt = o.AcceptedAt,
            bookedAt = o.BookedAt,
            rejectionReason = o.RejectionReason,
            appointmentDate = o.AppointmentDate,
            appointmentTime = o.AppointmentTime,
            externalSystemConfirmationId = o.ExternalSystemConfirmationId,
            radiologyAppointmentId = o.RadiologyAppointmentId,
            radiologyStatus = o.RadiologyStatus
        };

        private static object? TryParseJson(string json)
        {
            try { return JsonSerializer.Deserialize<object>(json); }
            catch { return null; }
        }
        
        private static string GetRequestedTestFromData(string dataJson)
        {
            try
            {
                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(dataJson);
                if (data?.ContainsKey("selectedTests") == true)
                {
                    var tests = JsonSerializer.Deserialize<List<string>>(data["selectedTests"].ToString());
                    return tests?.FirstOrDefault() ?? "Radiology Investigation";
                }
                return data?.ContainsKey("testName") == true ? data["testName"].ToString() : "Radiology Investigation";
            }
            catch { return "Radiology Investigation"; }
        }
        
        private static string GetOrderNotesFromData(string dataJson)
        {
            try
            {
                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(dataJson);
                return data?.ContainsKey("notes") == true ? data["notes"].ToString() : "";
            }
            catch { return ""; }
        }
        
        private static string GetPriorityFromData(string dataJson)
        {
            try
            {
                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(dataJson);
                return data?.ContainsKey("priority") == true ? data["priority"].ToString() : "Routine";
            }
            catch { return "Routine"; }
        }
        
        private async Task CreateOrderStatusNotification(DoctorOrder order)
        {
            try
            {
                // Find patient by identifier
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id.ToString() == order.PatientId || p.Identifier == order.PatientId);
                if (patient == null) return;
                
                var notification = new Models.EMR.Notification
                {
                    PatientId = patient.Id,
                    Title = $"Doctor Order Status: {order.Status}",
                    Message = $"Your doctor request (ID: {order.Id}) status has been updated to {order.Status}",
                    Type = "order_status_update",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create notification for order {OrderId}", order.Id);
            }
        }
    }

    // DTOs
    public class DoctorOrderDto
    {
        public string PatientId { get; set; } = "";
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

    public class UpdateOrderStatusRequest
    {
        public string Status { get; set; } = "";
        public int? AppointmentId { get; set; }
        public string? AppointmentDate { get; set; }
        public string? AppointmentTime { get; set; }
        public string? RadiologyBookingRef { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class RadiologyConfirmationDto
    {
        public int OrderId { get; set; }
        public string BookingReference { get; set; } = "";
        public string AppointmentDate { get; set; } = "";
        public string AppointmentTime { get; set; } = "";
        public string RadiologyAppointmentId { get; set; } = "";
        public string Status { get; set; } = "Confirmed";
    }
}