using Microsoft.EntityFrameworkCore;
using RadiologyCenterAPI.Data;
using RadiologyCenterAPI.DTOs;
using RadiologyCenterAPI.Models;

namespace RadiologyCenterAPI.Services
{
    public interface IAppointmentService
    {
        Task<List<RadiologyService>> GetServicesAsync();
        Task<List<Slot>> GetAvailableSlotsAsync(string serviceCode, DateTime date);
        Task<BookingResult> BookAppointmentAsync(ParsedBookingRequest req);
        Task<Appointment?> GetByIdAsync(int id);
        Task CancelAsync(int id);
        Task<List<Appointment>> GetPatientAppointmentsAsync(string patientIdentifier);
    }

    public class AppointmentService : IAppointmentService
    {
        private readonly RadiologyDbContext _context;
        private readonly IHl7Service _hl7;
        private readonly ILogger<AppointmentService> _logger;

        public AppointmentService(
            RadiologyDbContext context,
            IHl7Service hl7,
            ILogger<AppointmentService> logger)
        {
            _context = context;
            _hl7 = hl7;
            _logger = logger;
        }

        public async Task<List<RadiologyService>> GetServicesAsync()
        {
            return await _context.RadiologyServices
                .Where(s => s.IsActive)
                .OrderBy(s => s.Display)
                .ToListAsync();
        }

        public async Task<List<Slot>> GetAvailableSlotsAsync(string serviceCode, DateTime date)
        {
            var service = await _context.RadiologyServices
                .FirstOrDefaultAsync(s => s.Code == serviceCode || s.Modality == serviceCode);
            
            if (service == null) return new List<Slot>();

            var dayStart = date.Date;
            var dayEnd = dayStart.AddDays(1);

            var existing = await _context.Slots
                .Where(s => s.RadiologyServiceId == service.Id && s.Start >= dayStart && s.Start < dayEnd)
                .ToListAsync();

            if (!existing.Any())
            {
                var slots = new List<Slot>();
                var current = dayStart.AddHours(8);
                var endOfDay = dayStart.AddHours(16);
                
                while (current < endOfDay)
                {
                    var slotEnd = current.AddMinutes(service.DurationMin);
                    if (slotEnd > endOfDay) break;
                    
                    slots.Add(new Slot
                    {
                        RadiologyServiceId = service.Id,
                        Start = current,
                        End = slotEnd,
                        Status = "free"
                    });
                    current = slotEnd;
                }
                
                _context.Slots.AddRange(slots);
                await _context.SaveChangesAsync();
                existing = slots;
            }

            return existing.Where(s => s.Status == "free").OrderBy(s => s.Start).ToList();
        }

        public async Task<BookingResult> BookAppointmentAsync(ParsedBookingRequest req)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var service = await _context.RadiologyServices
                    .FirstOrDefaultAsync(s => s.Code == req.ServiceRequest.Code);
                    
                if (service == null)
                    throw new InvalidOperationException($"Unknown service code: {req.ServiceRequest.Code}");

                var patient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.Identifier == req.Patient.Identifier);
                    
                if (patient == null)
                {
                    patient = new Patient
                    {
                        Identifier = req.Patient.Identifier,
                        FirstName = req.Patient.FirstName,
                        LastName = req.Patient.LastName,
                        Gender = req.Patient.Gender,
                        BirthDate = req.Patient.BirthDate,
                        Phone = req.Patient.Phone,
                        Email = req.Patient.Email,
                        Address = req.Patient.Address
                    };
                    _context.Patients.Add(patient);
                    await _context.SaveChangesAsync();
                }

                var slot = await _context.Slots
                    .FirstOrDefaultAsync(s =>
                        s.RadiologyServiceId == service.Id &&
                        s.Start == req.Appointment.Start &&
                        s.Status == "free");

                if (slot == null)
                    throw new InvalidOperationException("Selected time slot is no longer available");

                slot.Status = "booked";
                await _context.SaveChangesAsync();

                var appointment = new Appointment
                {
                    PatientId = patient.Id,
                    SlotId = slot.Id,
                    RadiologyServiceId = service.Id,
                    Status = "Pending",
                    PractitionerRef = req.ServiceRequest.PractitionerRef,
                    Priority = req.ServiceRequest.Priority,
                    Notes = req.ServiceRequest.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                slot.AppointmentId = appointment.Id;
                await _context.SaveChangesAsync();

                var orderControlId = $"ORD-{appointment.Id:D6}";
                var hl7Msg = _hl7.BuildOrmO01(req, orderControlId);

                try
                {
                    var ack = await _hl7.SendAsync(hl7Msg);
                    appointment.Status = "Confirmed";
                    appointment.ConfirmationId = orderControlId;
                    appointment.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "HL7 send failed, rolling back slot");
                    slot.Status = "free";
                    slot.AppointmentId = null;
                    appointment.Status = "Failed";
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    throw;
                }

                await transaction.CommitAsync();

                appointment.Patient = patient;
                appointment.Slot = slot;
                appointment.RadiologyService = service;

                return new BookingResult
                {
                    AppointmentId = appointment.Id,
                    ConfirmationId = appointment.ConfirmationId ?? "",
                    Hl7MessageId = appointment.Hl7MessageId ?? "",
                    Appointment = appointment
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Booking failed");
                throw;
            }
        }

        public async Task<Appointment?> GetByIdAsync(int id)
        {
            return await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Slot)
                .Include(a => a.RadiologyService)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Appointment>> GetPatientAppointmentsAsync(string patientIdentifier)
        {
            return await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Slot)
                .Include(a => a.RadiologyService)
                .Where(a => a.Patient != null && a.Patient.Identifier == patientIdentifier)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task CancelAsync(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Slot)
                .FirstOrDefaultAsync(a => a.Id == id);
                
            if (appointment == null) return;

            appointment.Status = "Cancelled";
            appointment.UpdatedAt = DateTime.UtcNow;
            
            if (appointment.Slot != null)
            {
                appointment.Slot.Status = "free";
                appointment.Slot.AppointmentId = null;
            }
            
            await _context.SaveChangesAsync();
        }
    }

    public class SlotTakenException : Exception
    {
        public SlotTakenException() : base("Time slot is no longer available") { }
    }

    public class RisOfflineException : Exception
    {
        public RisOfflineException() : base("RIS system is offline") { }
    }

    public class Hl7RejectedException : Exception
    {
        public Hl7RejectedException(string message) : base(message) { }
    }
}