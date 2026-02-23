using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs.EMRd.Diagnosis;
using EyeClinicAPI.Models.EMR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EyeClinicAPI.Controllers.EMRcontrol
{
   [Route("api/[controller]")]
    [ApiController]
    public class DiagnosisController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public DiagnosisController(EyeClinicDbContext context)
        {
            _context = context;
        }

        [HttpGet("{medicalRecordId}")]
        public async Task<ActionResult<List<DiagnosisDto>>> GetByMedicalRecord(int medicalRecordId)
        {
            var diagnoses = await _context.Diagnoses
                .Where(d => d.MedicalRecordId == medicalRecordId)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new DiagnosisDto
                {
                    Id = d.Id,
                    DiagnosisName = d.DiagnosisName,
                    Status = d.Status,
                    Severity = d.Severity,
                    Notes = d.Notes,
                    CheckupDate = d.CheckupDate,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .ToListAsync();

            return Ok(diagnoses);
        }

        [HttpPost]
        public async Task<ActionResult<DiagnosisDto>> Create(CreateDiagnosisRequest request)
        {
            var diag = new Diagnosis
            {
                MedicalRecordId = request.MedicalRecordId,
                DiagnosisName = request.DiagnosisName,
                Status = request.Status,
                Severity = request.Severity,
                Notes = request.Notes,
                CheckupDate = request.CheckupDate ?? DateTime.Now,
                CreatedAt = DateTime.Now
            };

            _context.Diagnoses.Add(diag);
            await _context.SaveChangesAsync();

            return Ok(new DiagnosisDto
            {
                Id = diag.Id,
                DiagnosisName = diag.DiagnosisName,
                Status = diag.Status,
                Severity = diag.Severity,
                Notes = diag.Notes,
                CheckupDate = diag.CheckupDate,
                CreatedAt = diag.CreatedAt,
                UpdatedAt = diag.UpdatedAt
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateDiagnosisRequest request)
        {
            var existing = await _context.Diagnoses.FindAsync(id);
            if (existing == null) return NotFound();

            existing.DiagnosisName = request.DiagnosisName;
            existing.Status = request.Status;
            existing.Severity = request.Severity;
            existing.Notes = request.Notes;
            existing.CheckupDate = request.CheckupDate ?? existing.CheckupDate;
            existing.UpdatedAt = DateTime.Now;

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.Diagnoses.FindAsync(id);
            if (existing == null) return NotFound();

            _context.Diagnoses.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

}
