using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.Models;
using System;
using System.Threading.Tasks;

namespace RadiologyCenterAPI.Services
{
    public interface IAppointmentApprovalService
    {
        Task<(bool Success, string Message, Appointment? Appointment)> ApproveAppointmentAsync(int appointmentId, string? adminNotes = null, int? adminUserId = null);
        Task<(bool Success, string Message, Appointment? Appointment)> RejectAppointmentAsync(int appointmentId, string rejectionReason, int? adminUserId = null);
        Task<(bool Success, string Message, Appointment? Appointment)> ScheduleInvestigationAsync(int appointmentId, string investigationType, string? notes = null, int? adminUserId = null);
    }

    public class AppointmentApprovalService : IAppointmentApprovalService
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<AppointmentApprovalService> _logger;
        private readonly IFhirMappingService _fhirMapper;
        private readonly IAuditService _auditService;
        private readonly INotificationService _notificationService;

        public AppointmentApprovalService(
            RadiologyDbContext context,
            ILogger<AppointmentApprovalService> logger,
            IFhirMappingService fhirMapper,
            IAuditService auditService,
            INotificationService notificationService)
        {
            _context = context;
            _logger = logger;
            _fhirMapper = fhirMapper;
            _auditService = auditService;
            _notificationService = notificationService;
        }

        /// <summary>
        /// Approve an appointment request and transition it to "Active Investigation"
        /// </summary>
        public async Task<(bool Success, string Message, Appointment? Appointment)> ApproveAppointmentAsync(
            int appointmentId, 
            string? adminNotes = null, 
            int? adminUserId = null)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.RadiologyService)
                    .FirstOrDefaultAsync(a => a.Id == appointmentId);

                if (appointment == null)
                {
                    _logger.LogWarning($"Appointment {appointmentId} not found for approval");
                    return (false, "Appointment not found", null);
                }

                // Check if appointment is in a valid state for approval
                if (appointment.Status != "Pending" && appointment.Status != "Requested by Doctor")
                {
                    _logger.LogWarning($"Appointment {appointmentId} is in invalid state: {appointment.Status}");
                    return (false, $"Appointment cannot be approved from status: {appointment.Status}", null);
                }

                // Update appointment
                appointment.Status = "Approved";
                appointment.InvestigationStatus = "Active Investigation";
                appointment.UpdatedAt = DateTime.UtcNow;
                appointment.AcceptedAt = DateTime.UtcNow;
                appointment.AdminNotes = adminNotes;

                // Create investigation record
                var investigation = new Investigation
                {
                    AppointmentId = appointmentId,
                    InvestigationType = appointment.RadiologyService?.Name ?? "General Investigation",
                    Status = "Active",
                    StartedAt = DateTime.UtcNow,
                    AdminNotes = adminNotes
                };

                _context.Investigations.Add(investigation);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Appointment {appointmentId} approved successfully. Investigation {investigation.Id} created.");

                // Create notifications
                await _notificationService.CreateNotificationAsync(
                    appointment.PatientId,
                    appointmentId,
                    investigation.Id,
                    "appointment_approved",
                    "Appointment Approved",
                    $"Your appointment for {appointment.RadiologyService?.Name} has been approved. Investigation is now active."
                );

                // Create audit log
                await _auditService.LogActionAsync(
                    "APPOINTMENT_APPROVED",
                    appointment.Patient?.Id.ToString(),
                    appointmentId,
                    adminUserId?.ToString(),
                    details: $"Investigation {investigation.Id} created. Notes: {adminNotes}"
                );

                // Generate and send FHIR ServiceRequest update
                await GenerateFhirServiceRequestUpdateAsync(appointment, investigation);

                return (true, "Appointment approved and investigation started", appointment);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error approving appointment: {ex.Message}");
                return (false, $"Error: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Reject an appointment request
        /// </summary>
        public async Task<(bool Success, string Message, Appointment? Appointment)> RejectAppointmentAsync(
            int appointmentId, 
            string rejectionReason,
            int? adminUserId = null)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.RadiologyService)
                    .FirstOrDefaultAsync(a => a.Id == appointmentId);

                if (appointment == null)
                {
                    _logger.LogWarning($"Appointment {appointmentId} not found for rejection");
                    return (false, "Appointment not found", null);
                }

                // Check if appointment is in a valid state for rejection
                if (appointment.Status != "Pending" && appointment.Status != "Requested by Doctor")
                {
                    _logger.LogWarning($"Appointment {appointmentId} cannot be rejected from status: {appointment.Status}");
                    return (false, $"Appointment cannot be rejected from status: {appointment.Status}", null);
                }

                // Update appointment
                appointment.Status = "Rejected";
                appointment.InvestigationStatus = "Cancelled";
                appointment.UpdatedAt = DateTime.UtcNow;
                appointment.AdminNotes = rejectionReason;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Appointment {appointmentId} rejected. Reason: {rejectionReason}");

                // Create notification for patient
                await _notificationService.CreateNotificationAsync(
                    appointment.PatientId,
                    appointmentId,
                    null,
                    "appointment_rejected",
                    "Appointment Rejected",
                    $"Your appointment for {appointment.RadiologyService?.Name} has been rejected. Reason: {rejectionReason}"
                );

                // Create audit log
                await _auditService.LogActionAsync(
                    "APPOINTMENT_REJECTED",
                    appointment.Patient?.Id.ToString(),
                    appointmentId,
                    adminUserId?.ToString(),
                    details: $"Reason: {rejectionReason}"
                );

                return (true, "Appointment rejected", appointment);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error rejecting appointment: {ex.Message}");
                return (false, $"Error: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Schedule investigation and update appointment status
        /// </summary>
        public async Task<(bool Success, string Message, Appointment? Appointment)> ScheduleInvestigationAsync(
            int appointmentId,
            string investigationType,
            string? notes = null,
            int? adminUserId = null)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .FirstOrDefaultAsync(a => a.Id == appointmentId);

                if (appointment == null)
                {
                    return (false, "Appointment not found", null);
                }

                // Check if investigation already exists
                var existingInvestigation = await _context.Investigations
                    .FirstOrDefaultAsync(i => i.AppointmentId == appointmentId);

                if (existingInvestigation != null)
                {
                    return (false, "Investigation already exists for this appointment", null);
                }

                // Create investigation
                var investigation = new Investigation
                {
                    AppointmentId = appointmentId,
                    InvestigationType = investigationType,
                    Status = "Active",
                    StartedAt = DateTime.UtcNow,
                    Notes = notes
                };

                _context.Investigations.Add(investigation);
                appointment.InvestigationStatus = "Active Investigation";
                appointment.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Investigation scheduled for appointment {appointmentId}");

                // Create audit log
                await _auditService.LogActionAsync(
                    "INVESTIGATION_SCHEDULED",
                    appointment.Patient?.Id.ToString(),
                    appointmentId,
                    adminUserId?.ToString(),
                    details: $"Type: {investigationType}"
                );

                return (true, "Investigation scheduled", appointment);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error scheduling investigation: {ex.Message}");
                return (false, $"Error: {ex.Message}", null);
            }
        }

        private async Task GenerateFhirServiceRequestUpdateAsync(Appointment appointment, Investigation investigation)
        {
            try
            {
                // Generate FHIR ServiceRequest resource
                var fhirServiceRequest = new
                {
                    resourceType = "ServiceRequest",
                    id = appointment.Id.ToString(),
                    status = "active",
                    intent = "order",
                    subject = new { reference = $"Patient/{appointment.PatientId}" },
                    authoredOn = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    code = new
                    {
                        coding = new[]
                        {
                            new
                            {
                                system = "http://loinc.org",
                                code = "24627-2",
                                display = investigation.InvestigationType
                            }
                        ]
                    },
                    extension = new[]
                    {
                        new
                        {
                            url = "http://example.com/investigation-status",
                            valueCode = investigation.Status
                        }
                    }
                };

                _logger.LogInformation($"FHIR ServiceRequest generated for Investigation {investigation.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating FHIR ServiceRequest: {ex.Message}");
            }
        }
    }
}
