using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.DTOs;
using RadiologyCenterAPI.Models;

namespace RadiologyCenterAPI.Services
{
    public interface IAuditService
    {
        Task LogAsync(AuditLogEntry entry);
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
    }
}