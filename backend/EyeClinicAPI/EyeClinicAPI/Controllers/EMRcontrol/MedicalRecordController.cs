// Controllers/EMRcontrol/MedicalRecordController.cs
#nullable enable
using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs.EMRd.MedicalRecord;
using EyeClinicAPI.Models;
using EyeClinicAPI.Models.EMR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

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

                // Try numeric ID parse
                if (medicalRecord == null && int.TryParse(patientId, out int patientIdInt))
                {
                    medicalRecord = await _context.MedicalRecords
                        .FirstOrDefaultAsync(m => m.PatientId == patientIdInt);
                }

                // Try stripping P-/PAT- prefix or adding it
                if (medicalRecord == null)
                {
                    var numericPart = Regex.Match(patientId, @"\d+").Value;
                    if (!string.IsNullOrEmpty(numericPart) && numericPart != patientId)
                    {
                        medicalRecord = await _context.MedicalRecords
                            .FirstOrDefaultAsync(m => m.PatientIdentifier == numericPart);
                    }
                    if (medicalRecord == null && !patientId.StartsWith("P-"))
                    {
                        medicalRecord = await _context.MedicalRecords
                            .FirstOrDefaultAsync(m => m.PatientIdentifier == $"P-{patientId}");
                    }
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
                return StatusCode(500, new { message = "Internal server error", details = ex.Message, inner = ex.InnerException?.Message });
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

                // Try stripping P-/PAT- prefix or adding it
                if (medicalRecord == null)
                {
                    var numericPart = Regex.Match(patientId, @"\d+").Value;
                    if (!string.IsNullOrEmpty(numericPart) && numericPart != patientId)
                    {
                        medicalRecord = await _context.MedicalRecords
                            .FirstOrDefaultAsync(m => m.PatientIdentifier == numericPart);
                    }
                    if (medicalRecord == null && !patientId.StartsWith("P-"))
                    {
                        medicalRecord = await _context.MedicalRecords
                            .FirstOrDefaultAsync(m => m.PatientIdentifier == $"P-{patientId}");
                    }
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

        // GET: api/MedicalRecord/patient/{patientId}/history
        [HttpGet("patient/{patientId}/history")]
        public async Task<ActionResult<IEnumerable<object>>> GetPatientMedicalHistory(string patientId)
        {
            try
            {
                _logger.LogInformation($"Fetching medical history for patient: {patientId}");

                List<MedicalRecord> records;

                // البحث بالـ PatientIdentifier أو PatientId
                if (int.TryParse(patientId, out int patientIdInt))
                {
                    records = await _context.MedicalRecords
                        .Where(m => m.PatientIdentifier == patientId || m.PatientId == patientIdInt)
                        .OrderByDescending(m => m.VisitDate)
                        .ToListAsync();
                }
                else
                {
                    records = await _context.MedicalRecords
                        .Where(m => m.PatientIdentifier == patientId)
                        .OrderByDescending(m => m.VisitDate)
                        .ToListAsync();
                }

                if (!records.Any())
                {
                    return Ok(new List<object>()); // إرجاع قائمة فارغة بدلاً من 404
                }

                // إرجاع معلومات موجزة عن كل سجل
                var history = records.Select(r => new
                {
                    recordId = r.Id,
                    visitDate = r.VisitDate,
                    createdAt = r.CreatedAt,
                    patientId = r.PatientId,
                    patientIdentifier = r.PatientIdentifier
                });

                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching medical history for patient: {patientId}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // GET: api/MedicalRecord/{recordId}
        [HttpGet("{recordId}")]
        public async Task<ActionResult<MedicalRecordDto>> GetMedicalRecordById(int recordId)
        {
            try
            {
                _logger.LogInformation($"Fetching medical record by ID: {recordId}");

                var medicalRecord = await _context.MedicalRecords
                    .FirstOrDefaultAsync(m => m.Id == recordId);

                if (medicalRecord == null)
                {
                    _logger.LogWarning($"Medical record not found with ID: {recordId}");
                    return NotFound(new { message = $"Medical record not found with ID: {recordId}" });
                }

                var recordDto = await MapToDto(medicalRecord);
                return Ok(recordDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching medical record by ID: {recordId}");
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

                // التحقق من وجود سجل مسبق
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

                // محاولة العثور على المريض - إذا لم يوجد، نترك PatientId = null
                int? patientId = null;
                var patient = await FindPatientByIdentifier(request.PatientIdentifier);
                if (patient != null)
                {
                    patientId = patient.Id;
                    _logger.LogInformation($"Found patient with ID: {patientId} for identifier: {request.PatientIdentifier}");
                }
                else
                {
                    _logger.LogWarning($"Patient not found for identifier: {request.PatientIdentifier}. Will set PatientId to NULL. Please ensure the database column PatientId in MedicalRecords table allows NULL values.");
                }

                // إنشاء سجل طبي جديد مع PatientId (قد يكون null)
                var newRecord = new MedicalRecord
                {
                    PatientIdentifier = request.PatientIdentifier,
                    PatientId = patientId, // ✅ يمكن أن يكون null إذا لم يوجد المريض
                    VisitDate = DateTime.Now,
                    CreatedAt = DateTime.Now
                };

                _context.MedicalRecords.Add(newRecord);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Medical record created successfully. Record ID: {newRecord.Id} with PatientId: {patientId?.ToString() ?? "NULL"}");

                return Ok(new
                {
                    success = true,
                    message = "Medical Record created successfully",
                    recordId = newRecord.Id,
                    patientId = newRecord.PatientId,
                    patientIdentifier = newRecord.PatientIdentifier
                });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error creating medical record");
                // محاولة استخراج الخطأ الداخلي
                var innerMessage = dbEx.InnerException?.Message ?? dbEx.Message;
                return StatusCode(500, new
                {
                    message = "Database error",
                    details = innerMessage,
                    suggestion = "If the error mentions 'Cannot insert the value NULL into column', please make the PatientId column nullable in the MedicalRecords table."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical record");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
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

                // التحقق من وجود سجل مسبق
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

                // محاولة العثور على المريض
                int? patientId = null;
                var patient = await FindPatientByIdentifier(request.PatientId);
                if (patient != null)
                {
                    patientId = patient.Id;
                }
                else
                {
                    _logger.LogWarning($"Patient not found for ID: {request.PatientId}. Will set PatientId to NULL.");
                }

                // إنشاء سجل جديد
                var newRecord = new MedicalRecord
                {
                    PatientIdentifier = request.PatientId,
                    PatientId = patientId,
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
                var innerMessage = dbEx.InnerException?.Message ?? dbEx.Message;
                return StatusCode(500, new
                {
                    message = "Database error",
                    details = innerMessage,
                    suggestion = "If the error mentions 'Cannot insert the value NULL into column', please make the PatientId column nullable in the MedicalRecords table."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating medical record from appointment. Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // ===== دالة مساعدة للبحث عن المريض =====
        private async Task<Patient?> FindPatientByIdentifier(string identifier)
        {
            if (string.IsNullOrWhiteSpace(identifier))
                return null;

            _logger.LogInformation($"Searching for patient with identifier: {identifier}");

            // محاولة العثور على المريض بطرق متعددة
            Patient? patient = null;

            // 1. البحث بالرقم بعد إزالة البادئة (مثلاً "P-629904" -> "629904")
            var numericMatch = Regex.Match(identifier, @"\d+");
            if (numericMatch.Success && int.TryParse(numericMatch.Value, out int numericId))
            {
                patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == numericId);
                if (patient != null)
                {
                    _logger.LogInformation($"Found patient by numeric ID: {numericId}");
                    return patient;
                }
            }

            // 2. البحث في الحقول النصية المحتملة
            patient = await _context.Patients
                .FirstOrDefaultAsync(p =>
                    (p.NationalId != null && p.NationalId == identifier) ||
                    (p.Email != null && p.Email == identifier) ||
                    (p.Phone != null && p.Phone == identifier)
                );

            if (patient != null)
            {
                _logger.LogInformation($"Found patient by text field");
                return patient;
            }

            // 3. محاولة تحويل النص إلى رقم والبحث في Id مباشرة
            if (int.TryParse(identifier, out int directId))
            {
                patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == directId);
                if (patient != null)
                {
                    _logger.LogInformation($"Found patient by direct integer ID: {directId}");
                    return patient;
                }
            }

            _logger.LogWarning($"Patient not found for identifier: {identifier}");
            return null;
        }

        // GET: api/MedicalRecord/appointment-info/{patientId}
        [HttpGet("appointment-info/{patientId}")]
        public async Task<ActionResult<object>> GetPatientInfoFromAppointments(string patientId)
        {
            try
            {
                _logger.LogInformation($"Fetching appointment info for patient: {patientId}");

                var patient = await FindPatientByIdentifier(patientId);

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

        // ===== دوال تحويل السجل الطبي إلى DTO =====
        private static int? CalculateAge(DateTime? birthDate)
        {
            if (!birthDate.HasValue) return null;
            var today = DateTime.Today;
            var age = today.Year - birthDate.Value.Year;
            if (birthDate.Value.Date > today.AddYears(-age)) age--;
            return age;
        }

        private async Task<MedicalRecordDto> MapToDto(MedicalRecord medicalRecord)
        {
            var dto = new MedicalRecordDto
            {
                Id = medicalRecord.Id,
                PatientId = medicalRecord.PatientId ?? 0,
                PatientIdentifier = medicalRecord.PatientIdentifier ?? "",
                VisitDate = medicalRecord.VisitDate,
                CreatedAt = medicalRecord.CreatedAt,
                UpdatedAt = medicalRecord.UpdatedAt
            };

            // ===== Patient Info from Patients table =====
            if (medicalRecord.PatientId.HasValue)
            {
                var patient = await _context.Patients.FindAsync(medicalRecord.PatientId.Value);
                if (patient != null)
                {
                    dto.PatientInfo = new MedicalRecordPatientDto
                    {
                        PatientId = patient.Id,
                        Name = $"{patient.FirstName} {patient.LastName}".Trim(),
                        Age = CalculateAge(patient.DateOfBirth),
                        Gender = patient.Gender ?? "",
                        ContactNumber = patient.Phone ?? "",
                        Email = patient.Email ?? "",
                        Address = patient.Address ?? "",
                        InsuranceCompany = patient.InsuranceCompany ?? "",
                        BirthDate = patient.DateOfBirth,
                        NationalId = patient.NationalId ?? "",
                        InsuranceId = patient.InsuranceId ?? "",
                        PolicyNumber = patient.InsuranceId ?? "",
                        Coverage = patient.InsuranceCompany ?? "",
                        EmergencyContactName = patient.EmergencyContactName ?? "",
                        EmergencyContactPhone = patient.EmergencyContactPhone ?? ""
                    };
                }
            }

            // ===== Map Complaints =====
            var complaints = await _context.PatientComplaints
                .Where(c => c.MedicalRecordId == medicalRecord.Id && !c.IsArchived)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            dto.Complaints = complaints.Select(c => new MedicalRecordComplaintDto
            {
                Id = c.Id,
                Complaint = c.OriginalText ?? c.Complaint ?? "",
                OriginalText = c.OriginalText ?? c.Complaint ?? "",
                Duration = c.Duration ?? "",
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).ToList();

            // ===== Map Histories =====
            var histories = await _context.MedicalHistories
                .Where(h => h.MedicalRecordId == medicalRecord.Id && !h.IsArchived)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            dto.Histories = histories.Select(h => new MedicalRecordHistoryDto
            {
                Id = h.Id,
                PreviousEye = h.PreviousEye ?? "",
                PastMedicalHistory = h.PreviousEye ?? h.PastMedicalHistory ?? "",
                FamilyHistory = h.FamilyHistory ?? "",
                Allergies = h.Allergies ?? "",
                CreatedAt = h.CreatedAt,
                UpdatedAt = h.UpdatedAt
            }).ToList();

            // ===== Map Investigations =====
            var investigations = await _context.Investigations
                .Where(i => i.MedicalRecordId == medicalRecord.Id)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            dto.Investigations = investigations.Select(i => new MedicalRecordInvestigationDto
            {
                Id = i.Id,
                TestName = i.TestName ?? "",
                Result = i.Result ?? "",
                SelectedInvestigations = i.SelectedInvestigations ?? "",
                Notes = i.Notes ?? "",
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            }).ToList();

            // ===== Map Eye Examinations =====
            var eyeExaminations = await _context.EyeExaminations
                .Where(e => e.MedicalRecordId == medicalRecord.Id && !e.IsArchived)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            dto.EyeExaminations = eyeExaminations.Select(e => new MedicalRecordEyeExaminationDto
            {
                Id = e.Id,
                MedicalRecordId = e.MedicalRecordId,
                VisualAcuity = e.VisualAcuity ?? "",
                IntraocularPressure = e.IntraocularPressure ?? "",
                RightEye = e.RightEye ?? "",
                LeftEye = e.LeftEye ?? "",
                EyePressure = e.EyePressure ?? "",
                PupilReaction = e.PupilReaction ?? "",
                PupilReactionOther = e.PupilReactionOther ?? "",
                AnteriorSegment = e.AnteriorSegment ?? "",
                PosteriorSegment = e.PosteriorSegment ?? "",
                EyeAlignment = e.EyeAlignment ?? "",
                EyeAlignmentOther = e.EyeAlignmentOther ?? "",
                EyeMovements = e.EyeMovements ?? "",
                EyeMovementsOther = e.EyeMovementsOther ?? "",
                FundusObservation = e.FundusObservation ?? "",
                OtherNotes = e.OtherNotes ?? "",
                CreatedAt = e.CreatedAt
            }).ToList();

            // ===== Map Operations =====
            var operations = await _context.Operations
                .Where(o => o.MedicalRecordId == medicalRecord.Id && !o.IsArchived)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            dto.Operations = operations.Select(o => new MedicalRecordOperationsDto
            {
                Id = o.Id,
                Name = o.Name ?? "",
                OperationName = o.Name ?? o.OperationName ?? "",
                Date = o.Date,
                Eye = o.Eye ?? "",
                Surgeon = o.Surgeon ?? "",
                Diagnosis = o.Diagnosis ?? "",
                PreMedications = o.PreMedications ?? "",
                SpecialInstructions = o.SpecialInstructions ?? "",
                PostMedications = o.PostMedications ?? "",
                FollowUp = o.FollowUp ?? "",
                Complications = o.Complications ?? "",
                Status = o.Status ?? "",
                Anesthesia = o.Anesthesia ?? "",
                Duration = o.Duration ?? "",
                Notes = o.Notes ?? "",
                CreatedAt = o.CreatedAt
            }).ToList();

            // ===== Map Medical Test Files =====
            var medicalTestFiles = await _context.MedicalTestFiles
                .Where(f => f.MedicalRecordId == medicalRecord.Id)
                .OrderByDescending(f => f.UploadDate)
                .ToListAsync();

            dto.MedicalTestFiles = medicalTestFiles.Select(f => new MedicalTestFileDto
            {
                Id = f.Id,
                MedicalRecordId = f.MedicalRecordId,
                FileName = f.FileName ?? "",
                FilePath = f.FilePath ?? "",
                FileType = f.FileType ?? "",
                CreatedAt = f.UploadDate
            }).ToList();

            // ===== Map Prescriptions =====
            var prescriptions = await _context.Prescriptions
                .Where(p => p.MedicalRecordId == medicalRecord.Id)
                .Include(p => p.Items)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            dto.Prescriptions = prescriptions.Select(p => new MedicalRecordPrescriptionDto
            {
                Id = p.Id,
                Instructions = p.Instructions ?? "",
                Notes = p.Notes ?? "",
                PrescriptionDate = p.PrescriptionDate,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Items = p.Items.Select(i => new PrescriptionItemDto
                {
                    Id = i.Id,
                    Drug = i.Drug ?? i.Medication ?? "",
                    Medication = i.Medication ?? i.Drug ?? "",
                    Form = i.Form ?? "",
                    Dose = i.Dose ?? i.Dosage ?? "",
                    Dosage = i.Dosage ?? i.Dose ?? "",
                    CustomDose = i.CustomDose ?? "",
                    Frequency = i.Frequency ?? "",
                    CustomFrequency = i.CustomFrequency ?? "",
                    Duration = i.Duration ?? "",
                    Notes = i.Notes ?? ""
                }).ToList()
            }).ToList();

            // ===== Map Diagnoses =====
            var diagnoses = await _context.Diagnoses
                .Where(d => d.MedicalRecordId == medicalRecord.Id)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            dto.Diagnoses = diagnoses.Select(d => new MedicalRecordDiagnosisDto
            {
                Id = d.Id,
                DiagnosisName = d.DiagnosisName ?? d.DiagnosisText ?? "",
                DiagnosisText = d.DiagnosisText ?? d.DiagnosisName ?? "",
                ICD10Code = d.ICD10Code ?? "",
                Status = d.Status ?? "",
                Severity = d.Severity ?? "",
                Notes = d.Notes ?? "",
                CheckupDate = d.CheckupDate,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList();

            return dto;
        }
    }
}