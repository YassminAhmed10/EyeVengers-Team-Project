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
    public class NotificationController : ControllerBase
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(RadiologyDbContext context, ILogger<NotificationController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/notification/patient/{patientId}
        // Get all notifications for a patient
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult> GetPatientNotifications(int patientId, [FromQuery] bool? unreadOnly = null)
        {
            try
            {
                var query = _context.Notifications
                    .Where(n => n.PatientId == patientId)
                    .AsQueryable();

                if (unreadOnly == true)
                    query = query.Where(n => !n.IsRead);

                var notifications = await query
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = notifications.Select(n => new NotificationDto(n)),
                    unreadCount = await query.Where(n => !n.IsRead).CountAsync()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching notifications: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error fetching notifications" });
            }
        }

        // GET: api/notification/{id}
        // Get specific notification
        [HttpGet("{id}")]
        public async Task<ActionResult> GetNotification(int id)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(id);
                if (notification == null)
                    return NotFound(new { success = false, message = "Notification not found" });

                return Ok(new { success = true, data = new NotificationDto(notification) });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching notification: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error fetching notification" });
            }
        }

        // PUT: api/notification/{id}/read
        // Mark notification as read
        [HttpPut("{id}/read")]
        public async Task<ActionResult> MarkAsRead(int id)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(id);
                if (notification == null)
                    return NotFound(new { success = false, message = "Notification not found" });

                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;

                _context.Notifications.Update(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Notification {id} marked as read");
                return Ok(new { success = true, message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error marking notification as read: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error updating notification" });
            }
        }

        // PUT: api/notification/patient/{patientId}/read-all
        // Mark all notifications as read for a patient
        [HttpPut("patient/{patientId}/read-all")]
        public async Task<ActionResult> MarkAllAsRead(int patientId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.PatientId == patientId && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                    _context.Notifications.Update(notification);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"All notifications marked as read for patient {patientId}");
                return Ok(new { success = true, message = "All notifications marked as read", count = notifications.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error marking all notifications as read: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error updating notifications" });
            }
        }

        // DELETE: api/notification/{id}
        // Delete notification
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNotification(int id)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(id);
                if (notification == null)
                    return NotFound(new { success = false, message = "Notification not found" });

                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Notification {id} deleted");
                return Ok(new { success = true, message = "Notification deleted" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting notification: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error deleting notification" });
            }
        }

        // DELETE: api/notification/patient/{patientId}
        // Delete all notifications for a patient
        [HttpDelete("patient/{patientId}")]
        public async Task<ActionResult> DeleteAllNotifications(int patientId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.PatientId == patientId)
                    .ToListAsync();

                _context.Notifications.RemoveRange(notifications);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"All notifications deleted for patient {patientId}");
                return Ok(new { success = true, message = "All notifications deleted", count = notifications.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting notifications: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error deleting notifications" });
            }
        }
    }

    public class NotificationDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public int? AppointmentId { get; set; }
        public int? ResultId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }

        public NotificationDto(Notification n)
        {
            Id = n.Id;
            PatientId = n.PatientId;
            Title = n.Title;
            Message = n.Message;
            Type = n.Type;
            AppointmentId = n.AppointmentId;
            ResultId = n.ResultId;
            IsRead = n.IsRead;
            CreatedAt = n.CreatedAt;
            ReadAt = n.ReadAt;
        }
    }
}
