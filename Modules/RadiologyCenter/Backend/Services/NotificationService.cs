using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadiologyCenterAPI.Services
{
    public interface INotificationService
    {
        Task<Notification?> CreateNotificationAsync(int patientId, int appointmentId, int? investigationId, string type, string title, string message);
        Task<List<Notification>> GetPatientNotificationsAsync(int patientId, bool unreadOnly = false);
        Task<bool> MarkAsReadAsync(int notificationId);
        Task<bool> MarkAllAsReadAsync(int patientId);
        Task<bool> DeleteNotificationAsync(int notificationId);
    }

    public class NotificationService : INotificationService
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            RadiologyDbContext context,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Create a new notification
        /// </summary>
        public async Task<Notification?> CreateNotificationAsync(
            int patientId, 
            int appointmentId, 
            int? investigationId, 
            string type, 
            string title, 
            string message)
        {
            try
            {
                var notification = new Notification
                {
                    PatientId = patientId,
                    AppointmentId = appointmentId,
                    Title = title,
                    Message = message,
                    Type = type,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Notification created for patient {patientId}: {type}");

                return notification;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating notification: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Get patient notifications
        /// </summary>
        public async Task<List<Notification>> GetPatientNotificationsAsync(int patientId, bool unreadOnly = false)
        {
            try
            {
                var query = _context.Notifications
                    .Where(n => n.PatientId == patientId);

                if (unreadOnly)
                    query = query.Where(n => !n.IsRead);

                return await query
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting notifications: {ex.Message}");
                return new List<Notification>();
            }
        }

        /// <summary>
        /// Mark notification as read
        /// </summary>
        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(notificationId);
                if (notification == null)
                    return false;

                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error marking notification as read: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Mark all patient notifications as read
        /// </summary>
        public async Task<bool> MarkAllAsReadAsync(int patientId)
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
                }

                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error marking all notifications as read: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        public async Task<bool> DeleteNotificationAsync(int notificationId)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(notificationId);
                if (notification == null)
                    return false;

                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting notification: {ex.Message}");
                return false;
            }
        }
    }
}
