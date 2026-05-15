using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.DTOs;
using RadiologyCenterAPI.Models;
using System;
using System.Threading.Tasks;

namespace RadiologyCenterAPI.Services
{
    public interface IAuditService
    {
        Task LogAsync(AuditLogEntry entry);
        Task LogActionAsync(string action, string? patientId = null, int? appointmentId = null, string? userId = null, string? hl7MessageId = null, string? details = null);
    }

    public class AuditService : IAuditService
    {
        private readonly RadiologyDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuditService> _logger;

        public AuditService(
            RadiologyDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AuditService> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task LogAsync(AuditLogEntry entry)
        {
            try
            {
                var ctx = _httpContextAccessor.HttpContext;
                var ip = ctx?.Connection?.RemoteIpAddress?.ToString();
                var userId = ctx?.User?.Identity?.Name;

                _context.AuditLogs.Add(new AuditLog
                {
                    Action = entry.Action,
                    PatientIdentifier = entry.PatientIdentifier,
                    AppointmentId = entry.AppointmentId,
                    Hl7MessageId = entry.Hl7MessageId,
                    DurationMs = entry.DurationMs,
                    Details = entry.Details,
                    UserId = userId,
                    IpAddress = ip,
                    Timestamp = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write audit log for {Action}", entry.Action);
            }
        }

        /// <summary>
        /// Log an action with simplified parameters
        /// </summary>
        public async Task LogActionAsync(
            string action, 
            string? patientId = null, 
            int? appointmentId = null, 
            string? userId = null, 
            string? hl7MessageId = null, 
            string? details = null)
        {
            try
            {
                var ctx = _httpContextAccessor.HttpContext;
                var ip = ctx?.Connection?.RemoteIpAddress?.ToString();
                var contextUserId = userId ?? ctx?.User?.Identity?.Name;

                var auditLog = new AuditLog
                {
                    Action = action,
                    PatientIdentifier = patientId,
                    AppointmentId = appointmentId,
                    Hl7MessageId = hl7MessageId,
                    UserId = contextUserId,
                    IpAddress = ip,
                    Timestamp = DateTime.UtcNow,
                    Details = details
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Audit log created: {action} for appointment {appointmentId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to write audit log for {action}");
            }
        }
    }
}