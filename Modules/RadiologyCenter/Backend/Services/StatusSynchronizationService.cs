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
    public interface IStatusSynchronizationService
    {
        Task<bool> SyncStatusAsync(int appointmentId, string newStatus, string entityType);
        Task<bool> SyncToPatientSystemAsync(int appointmentId, Dictionary<string, string> statusData);
        Task<bool> SyncToMedicalRecordSystemAsync(int appointmentId, Investigation investigation);
        Task<bool> SyncToClinicSystemAsync(int appointmentId, string status);
        Task<bool> PropagateStatusChangeAsync(int appointmentId, string status, List<string> targetSystems);
    }

    public class StatusSynchronizationService : IStatusSynchronizationService
    {
        private readonly RadiologyDbContext _context;
        private readonly ILogger<StatusSynchronizationService> _logger;
        private readonly IAuditService _auditService;

        public StatusSynchronizationService(
            RadiologyDbContext context,
            ILogger<StatusSynchronizationService> logger,
            IAuditService auditService)
        {
            _context = context;
            _logger = logger;
            _auditService = auditService;
        }

        /// <summary>
        /// Synchronize status across all connected systems
        /// </summary>
        public async Task<bool> SyncStatusAsync(int appointmentId, string newStatus, string entityType)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .FirstOrDefaultAsync(a => a.Id == appointmentId);

                if (appointment == null)
                {
                    _logger.LogWarning($"Cannot sync status for appointment {appointmentId} - not found");
                    return false;
                }

                // Determine target systems based on appointment type
                var targetSystems = new List<string> { "PatientSystem", "MedicalRecordSystem" };
                
                if (!string.IsNullOrEmpty(appointment.Hl7MessageId))
                    targetSystems.Add("ClinicSystem");

                // Propagate to all target systems
                return await PropagateStatusChangeAsync(appointmentId, newStatus, targetSystems);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error synchronizing status: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Synchronize status to Patient System
        /// </summary>
        public async Task<bool> SyncToPatientSystemAsync(int appointmentId, Dictionary<string, string> statusData)
        {
            try
            {
                // Build sync payload
                var syncPayload = new
                {
                    appointmentId = appointmentId,
                    status = statusData.GetValueOrDefault("Status", "Unknown"),
                    investigationStatus = statusData.GetValueOrDefault("InvestigationStatus", "Unknown"),
                    updatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    fhirResourceId = statusData.GetValueOrDefault("FhirResourceId", "")
                };

                _logger.LogInformation($"Syncing status to Patient System - Appointment: {appointmentId}");

                // In a real scenario, this would call the Patient System API
                // For now, we'll simulate the sync
                await _auditService.LogActionAsync(
                    "STATUS_SYNC_PATIENT_SYSTEM",
                    statusData.GetValueOrDefault("PatientId", ""),
                    appointmentId,
                    null,
                    details: $"Status: {syncPayload.status}, Investigation: {syncPayload.investigationStatus}"
                );

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error syncing to Patient System: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Synchronize status to Medical Record System
        /// </summary>
        public async Task<bool> SyncToMedicalRecordSystemAsync(int appointmentId, Investigation investigation)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.RadiologyService)
                    .FirstOrDefaultAsync(a => a.Id == appointmentId);

                if (appointment == null)
                    return false;

                // Build medical record entry
                var medicalRecordEntry = new
                {
                    appointmentId = appointmentId,
                    patientId = appointment.PatientId,
                    investigationType = investigation.InvestigationType,
                    testType = appointment.RadiologyService?.Name ?? "General",
                    uploadDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    doctorNotes = investigation.Notes,
                    adminNotes = investigation.AdminNotes,
                    fileCount = investigation.Files?.Count ?? 0,
                    status = investigation.Status,
                    completedAt = investigation.CompletedAt?.ToString("yyyy-MM-ddTHH:mm:ssZ")
                };

                _logger.LogInformation($"Syncing investigation to Medical Record System - Investigation: {investigation.Id}");

                // In a real scenario, this would call the Medical Record System API
                await _auditService.LogActionAsync(
                    "STATUS_SYNC_MEDICAL_RECORD",
                    appointment.Patient?.Id.ToString(),
                    appointmentId,
                    null,
                    details: $"Investigation: {investigation.InvestigationType}, Status: {investigation.Status}"
                );

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error syncing to Medical Record System: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Synchronize status to Clinic System
        /// </summary>
        public async Task<bool> SyncToClinicSystemAsync(int appointmentId, string status)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .FirstOrDefaultAsync(a => a.Id == appointmentId);

                if (appointment == null)
                    return false;

                // Build HL7 SIU segment for status update
                var hl7Payload = GenerateStatusUpdateHL7Message(appointment, status);

                _logger.LogInformation($"Syncing status to Clinic System - Appointment: {appointmentId}, Status: {status}");

                // In a real scenario, this would send HL7 message to Clinic System
                await _auditService.LogActionAsync(
                    "STATUS_SYNC_CLINIC_SYSTEM",
                    appointment.Patient?.Id.ToString(),
                    appointmentId,
                    null,
                    details: $"Status: {status}, HL7 Message sent"
                );

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error syncing to Clinic System: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Propagate status change to multiple target systems
        /// </summary>
        public async Task<bool> PropagateStatusChangeAsync(int appointmentId, string status, List<string> targetSystems)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .FirstOrDefaultAsync(a => a.Id == appointmentId);

                if (appointment == null)
                    return false;

                var investigation = await _context.Investigations
                    .FirstOrDefaultAsync(i => i.AppointmentId == appointmentId);

                var allSyncsSuccessful = true;

                // Sync to each target system
                foreach (var system in targetSystems)
                {
                    switch (system.ToLower())
                    {
                        case "patientsystem":
                            var statusData = new Dictionary<string, string>
                            {
                                { "Status", status },
                                { "InvestigationStatus", appointment.InvestigationStatus },
                                { "PatientId", appointment.PatientId.ToString() }
                            };
                            allSyncsSuccessful &= await SyncToPatientSystemAsync(appointmentId, statusData);
                            break;

                        case "medicalrecordsystem":
                            if (investigation != null)
                            {
                                allSyncsSuccessful &= await SyncToMedicalRecordSystemAsync(appointmentId, investigation);
                            }
                            break;

                        case "clinicsystem":
                            allSyncsSuccessful &= await SyncToClinicSystemAsync(appointmentId, status);
                            break;
                    }
                }

                _logger.LogInformation($"Status propagation completed for appointment {appointmentId}. All syncs successful: {allSyncsSuccessful}");

                return allSyncsSuccessful;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error propagating status change: {ex.Message}");
                return false;
            }
        }

        private string GenerateStatusUpdateHL7Message(Appointment appointment, string status)
        {
            // Generate HL7 SIU^S12 (Appointment Information) message for status update
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var messageId = Guid.NewGuid().ToString().Substring(0, 20);

            var hl7Message = $@"MSH|^~\&|RADIOLOGY|RADIOLOGY|CLINIC|CLINIC|{timestamp}||SIU^S12|{messageId}|P|2.5
PID|||{appointment.PatientId}||{appointment.Patient?.LastName ?? "UNKNOWN"}^{appointment.Patient?.FirstName ?? "UNKNOWN"}||||||||||
SIU|1|{appointment.Id}|{status}|{timestamp}|{appointment.UpdatedAt:yyyyMMddHHmmss}|";

            return hl7Message;
        }
    }
}
