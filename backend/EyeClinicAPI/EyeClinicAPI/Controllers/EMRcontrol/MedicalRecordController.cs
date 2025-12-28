// Controllers/EMRcontrol/MedicalRecordController.cs
using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs.EMRd.MedicalRecord;
using EyeClinicAPI.Models;
using EyeClinicAPI.Models.EMR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EyeClinicAPI.Controllers.EMRcontrol
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalRecordController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;
        private readonly ILogger<MedicalRecordController> _logger;

        public MedicalRecordController(EyeClinicDbContext context, ILogger<MedicalRecordController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/MedicalRecord/patient/{patientId}
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<MedicalRecordDto>> GetMedicalRecordByPatientId(string patientId)
        {
            try
            {
                _logger.LogInformation($"Fetching medical record for patient: {patientId}");

                var medicalRecord = await _context.MedicalRecords
                    .FirstOrDefaultAsync(m => m.PatientIdentifier == patientId);

                if (medicalRecord == null && int.TryParse(patientId, out int patientIdInt))
                {
                    medicalRecord = await _context.MedicalRecords
                        .FirstOrDefaultAsync(m => m.PatientId == patientIdInt);
                }

                if (medicalRecord == null)
                {
                    _logger.LogWarning($"Medical record not found for patient: {patientId}");
                    return NotFound(new { message = $"Medical record not found for patient: {patientId}" });
                }

                var recordDto = await MapToDto(medicalRecord);
                return Ok(recordDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching medical record for patient: {patientId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // GET: api/MedicalRecord/check/{patientId}
        [HttpGet("check/{patientId}")]
        public async Task<ActionResult<object>> CheckMedicalRecordExists(string patientId)
        {
            try
            {
                var medicalRecord = await _context.MedicalRecords
                    .FirstOrDefaultAsync(m => m.PatientIdentifier == patientId);

                if (medicalRecord == null && int.TryParse(patientId, out int patientIdInt))
                {
                    medicalRecord = await _context.MedicalRecords
                        .FirstOrDefaultAsync(m => m.PatientId == patientIdInt);
                }

                if (medicalRecord == null)
                {
                    return Ok(new { exists = false });
                }

                return Ok(new
                {
                    exists = true,
                    recordId = medicalRecord.Id,
                    patientId = medicalRecord.PatientId,
                    patientIdentifier = medicalRecord.PatientIdentifier,
                    visitDate = medicalRecord.VisitDate
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking medical record existence for patient: {patientId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // POST: api/MedicalRecord
        [HttpPost]
        public async Task<IActionResult> CreateMedicalRecord([FromBody] CreateMedicalRecordRequest request)
        {
            try
            {
                _logger.LogInformation($"Creating medical record for patient: {request.PatientIdentifier}");

                if (string.IsNullOrWhiteSpace(request.PatientIdentifier))
                {
                    return BadRequest(new { message = "Patient identifier is required" });
                }

                var existingRecord = await _context.MedicalRecords
                    .FirstOrDefaultAsync(m => m.PatientIdentifier == request.PatientIdentifier);

                if (existingRecord != null)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Medical Record already exists",
                        recordId = existingRecord.Id,
                        patientId = existingRecord.PatientId,
                        patientIdentifier = existingRecord.PatientIdentifier
                    });
                }

                var newRecord = new MedicalRecord
                {
                    PatientIdentifier = request.PatientIdentifier,
                    VisitDate = DateTime.Now,
                    CreatedAt = DateTime.Now
                };

                _context.MedicalRecords.Add(newRecord);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Medical record created successfully. Record ID: {newRecord.Id}");

                return Ok(new
                {
                    success = true,
                    message = "Medical Record created successfully",
                    recordId = newRecord.Id,
                    patientId = newRecord.PatientId,
                    patientIdentifier = newRecord.PatientIdentifier
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical record");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // POST: api/MedicalRecord/from-appointment
        [HttpPost("from-appointment")]
        public async Task<IActionResult> CreateMedicalRecordFromAppointment([FromBody] CreateMedicalRecordFromAppointmentRequest request)
        {
            try
            {
                if (request == null)
                {
                    _logger.LogWarning("CreateMedicalRecordFromAppointment: Request is null");
                    return BadRequest(new { message = "Request body is required" });
                }

                _logger.LogInformation($"Creating medical record from appointment for patient: {request.PatientName} (ID: {request.PatientId})");

                if (string.IsNullOrWhiteSpace(request.PatientId))
                {
                    _logger.LogWarning("CreateMedicalRecordFromAppointment: Patient ID is empty");
                    return BadRequest(new { message = "Patient ID is required" });
                }

                // Check if record already exists
                var existingRecord = await _context.MedicalRecords
                    .FirstOrDefaultAsync(m => m.PatientIdentifier == request.PatientId);

                if (existingRecord != null)
                {
                    _logger.LogInformation($"Medical Record already exists for patient: {request.PatientId}");
                    return Ok(new
                    {
                        success = true,
                        message = "Medical Record already exists",
                        recordId = existingRecord.Id,
                        patientId = existingRecord.PatientId
                    });
                }

                // Create new medical record
                var newRecord = new MedicalRecord
                {
                    PatientIdentifier = request.PatientId,
                    VisitDate = request.AppointmentDate ?? DateTime.Now,
                    CreatedAt = DateTime.Now
                };

                _context.MedicalRecords.Add(newRecord);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Medical record created successfully. Record ID: {newRecord.Id}");

                return Ok(new
                {
                    success = true,
                    message = "Medical Record created from appointment",
                    recordId = newRecord.Id,
                    patientId = newRecord.PatientId,
                    patientIdentifier = newRecord.PatientIdentifier
                });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error creating medical record from appointment");
                return StatusCode(500, new { message = "Database error: " + dbEx.InnerException?.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating medical record from appointment. Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // GET: api/MedicalRecord/appointment-info/{patientId}
        [HttpGet("appointment-info/{patientId}")]
        public async Task<ActionResult<object>> GetPatientInfoFromAppointments(string patientId)
        {
            try
            {
                _logger.LogInformation($"Fetching appointment info for patient: {patientId}");

                var patient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.Id.ToString() == patientId || p.Email == patientId || p.Phone == patientId);

                if (patient != null)
                {
                    int? age = null;
                    if (patient.DateOfBirth != default)
                    {
                        var today = DateTime.Today;
                        var calculatedAge = today.Year - patient.DateOfBirth.Year;
                        if (patient.DateOfBirth.Date > today.AddYears(-calculatedAge)) calculatedAge--;
                        age = calculatedAge;
                    }

                    return Ok(new
                    {
                        patientId = patient.Id,
                        patientName = $"{patient.FirstName} {patient.LastName}",
                        age = age,
                        gender = patient.Gender,
                        contactNumber = patient.Phone,
                        email = patient.Email,
                        address = patient.Address,
                        insuranceCompany = patient.InsuranceCompany,
                        birthDate = patient.DateOfBirth,
                        nationalId = patient.NationalId,
                        insuranceId = patient.InsuranceId,
                        policyNumber = patient.InsuranceId,
                        coverage = patient.InsuranceCompany,
                        emergencyContactName = patient.EmergencyContactName,
                        emergencyContactPhone = patient.EmergencyContactPhone,
                        lastVisit = DateTime.UtcNow
                    });
                }

                var latestAppointment = await _context.Appointments
                    .Where(a => a.PatientId.ToString() == patientId)
                    .OrderByDescending(a => a.AppointmentDate)
                    .FirstOrDefaultAsync();

                if (latestAppointment == null)
                {
                    return NotFound(new { message = $"No information found for patient: {patientId}" });
                }

                return Ok(new
                {
                    patientId = latestAppointment.PatientId,
                    patientName = $"Patient {latestAppointment.PatientId}",
                    age = null as int?,
                    gender = "Unknown",
                    contactNumber = "",
                    email = "",
                    address = "",
                    insuranceCompany = "",
                    birthDate = null as DateTime?,
                    nationalId = "",
                    insuranceId = "",
                    policyNumber = "",
                    coverage = "",
                    emergencyContactName = "",
                    emergencyContactPhone = "",
                    lastVisit = latestAppointment.AppointmentDate
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching patient info for patient: {patientId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private async Task<MedicalRecordDto> MapToDto(MedicalRecord medicalRecord)
        {
            var dto = new MedicalRecordDto
            {
                PatientId = medicalRecord.PatientId,
                VisitDate = medicalRecord.VisitDate,
                Complaints = new List<MedicalRecordComplaintDto>(),
                Histories = new List<MedicalRecordHistoryDto>(),
                Investigations = new List<MedicalRecordInvestigationDto>(),
                EyeExaminations = new List<MedicalRecordEyeExaminationDto>(),
                Operations = new List<MedicalRecordOperationsDto>(),
                MedicalTestFiles = new List<MedicalTestFileDto>(),
                Prescriptions = new List<MedicalRecordPrescriptionDto>(),
                Diagnoses = new List<MedicalRecordDiagnosisDto>()
            };

            // Map Complaints
            var complaints = await _context.PatientComplaints
                .Where(c => c.MedicalRecordId == medicalRecord.Id && !c.IsArchived)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            dto.Complaints = complaints.Select(c => new MedicalRecordComplaintDto
            {
                Id = c.Id,
                Complaint = c.Complaint,
                Duration = c.Duration,
                CreatedAt = c.CreatedAt
            }).ToList();

            // Map Histories
            var histories = await _context.MedicalHistories
                .Where(h => h.MedicalRecordId == medicalRecord.Id && !h.IsArchived)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            dto.Histories = histories.Select(h => new MedicalRecordHistoryDto
            {
                Id = h.Id,
                PastMedicalHistory = h.PastMedicalHistory,
                FamilyHistory = h.FamilyHistory,
                Allergies = h.Allergies,
                CreatedAt = h.CreatedAt
            }).ToList();

            // Map Investigations
            var investigations = await _context.Investigations
                .Where(i => i.MedicalRecordId == medicalRecord.Id)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            dto.Investigations = investigations.Select(i => new MedicalRecordInvestigationDto
            {
                Id = i.Id,
                TestName = i.TestName,
                Result = i.Result,
                CreatedAt = i.CreatedAt
            }).ToList();

            // Map Eye Examinations
            var eyeExaminations = await _context.EyeExaminations
                .Where(e => e.MedicalRecordId == medicalRecord.Id && !e.IsArchived)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            dto.EyeExaminations = eyeExaminations.Select(e => new MedicalRecordEyeExaminationDto
            {
                Id = e.Id,
                MedicalRecordId = e.MedicalRecordId,
                VisualAcuity = e.VisualAcuity,
                IntraocularPressure = e.IntraocularPressure,
                AnteriorSegment = e.AnteriorSegment,
                PosteriorSegment = e.PosteriorSegment,
                CreatedAt = e.CreatedAt
            }).ToList();

            // Map Operations
            var operations = await _context.Operations
                .Where(o => o.MedicalRecordId == medicalRecord.Id && !o.IsArchived)
                .OrderByDescending(o => o.Date)
                .ToListAsync();

            dto.Operations = operations.Select(o => new MedicalRecordOperationsDto
            {
                Id = o.Id,
                OperationName = o.OperationName,
                Date = o.Date,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt
            }).ToList();

            // Map Medical Test Files
            var medicalTestFiles = await _context.MedicalTestFiles
                .Where(f => f.MedicalRecordId == medicalRecord.Id)
                .OrderByDescending(f => f.UploadDate)
                .ToListAsync();

            dto.MedicalTestFiles = medicalTestFiles.Select(f => new MedicalTestFileDto
            {
                Id = f.Id,
                MedicalRecordId = f.MedicalRecordId,
                FileName = f.FileName,
                FilePath = f.FilePath,
                FileType = f.FileType,
                CreatedAt = f.UploadDate
            }).ToList();

            // Map Prescriptions
            var prescriptions = await _context.Prescriptions
                .Where(p => p.MedicalRecordId == medicalRecord.Id)
                .Include(p => p.Items)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            dto.Prescriptions = prescriptions.Select(p => new MedicalRecordPrescriptionDto
            {
                Id = p.Id,
                Instructions = p.Instructions,
                PrescriptionDate = p.PrescriptionDate,
                CreatedAt = p.CreatedAt,
                Items = p.Items.Select(i => new PrescriptionItemDto
                {
                    Id = i.Id,
                    Medication = i.Medication,
                    Dosage = i.Dosage,
                    Frequency = i.Frequency,
                    Duration = i.Duration
                }).ToList()
            }).ToList();

            // Map Diagnoses
            var diagnoses = await _context.Diagnoses
                .Where(d => d.MedicalRecordId == medicalRecord.Id)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            dto.Diagnoses = diagnoses.Select(d => new MedicalRecordDiagnosisDto
            {
                Id = d.Id,
                DiagnosisText = d.DiagnosisText,
                ICD10Code = d.ICD10Code,
                CheckupDate = d.CheckupDate,
                CreatedAt = d.CreatedAt
            }).ToList();

            return dto;
        }

        private int GeneratePatientId(string patientIdentifier)
        {
            return Math.Abs(patientIdentifier.GetHashCode());
        }
    }
}