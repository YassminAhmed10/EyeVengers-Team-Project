using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models.Clinic;

namespace EyeClinicAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(EyeClinicDbContext context, ILogger<NotificationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Get notifications for a specific patient
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetPatientNotifications(int patientId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.PatientId == patientId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            
            return Ok(notifications);
        }

        // Get unread count for a patient
        [HttpGet("patient/{patientId}/unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount(int patientId)
        {
            var count = await _context.Notifications
                .Where(n => n.PatientId == patientId && !n.IsRead)
                .CountAsync();
            
            return Ok(new { unreadCount = count });
        }

        // Mark notification as read
        [HttpPatch("{id}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return NotFound();
            
            notification.IsRead = true;
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Notification marked as read" });
        }

        // Mark all notifications as read for a patient
        [HttpPatch("patient/{patientId}/mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead(int patientId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.PatientId == patientId && !n.IsRead)
                .ToListAsync();
            
            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = $"Marked {notifications.Count} notifications as read" });
        }
    }
}