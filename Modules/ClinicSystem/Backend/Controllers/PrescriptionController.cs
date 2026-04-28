using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs.Prescription;
using EyeClinicAPI.Models.EMR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EyeClinicAPI.Modules.ClinicSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrescriptionController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public PrescriptionController(EyeClinicDbContext context)
        {
            _context = context;
        }

        [HttpGet("{medicalRecordId}")]
        public async Task<IActionResult> GetPrescriptions(int medicalRecordId)
        {
            var prescriptions = await _context.Prescriptions
                .Include(p => p.Items)
                .Where(p => p.MedicalRecordId == medicalRecordId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(prescriptions);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionRequest request)
        {
            var prescription = new Prescription
            {
                MedicalRecordId = request.MedicalRecordId,
                Notes = request.Notes,
                CreatedAt = DateTime.Now,
                Items = request.Items.Select(i => new PrescriptionItem
                {
                    Drug = i.Drug,
                    Form = i.Form,
                    Dose = i.Dose,
                    CustomDose = i.CustomDose,
                    Frequency = i.Frequency,
                    CustomFrequency = i.CustomFrequency,
                    Notes = i.Notes
                }).ToList()
            };

            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            return Ok(prescription);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePrescription(int id, [FromBody] CreatePrescriptionRequest request)
        {
            var existing = await _context.Prescriptions
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existing == null) return NotFound();

            existing.Notes = request.Notes;
            existing.UpdatedAt = DateTime.Now;

            existing.Items = request.Items.Select(i => new PrescriptionItem
            {
                Drug = i.Drug,
                Form = i.Form,
                Dose = i.Dose,
                CustomDose = i.CustomDose,
                Frequency = i.Frequency,
                CustomFrequency = i.CustomFrequency,
                Notes = i.Notes
            }).ToList();

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrescription(int id)
        {
            var existing = await _context.Prescriptions
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existing == null) return NotFound();

            _context.Prescriptions.Remove(existing);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

