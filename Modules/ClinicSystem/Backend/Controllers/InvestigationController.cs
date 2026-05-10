using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs.Investigation;
using EyeClinicAPI.Models.EMR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EyeClinicAPI.Modules.ClinicSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvestigationController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public InvestigationController(EyeClinicDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InvestigationDto>>> GetAll()
        {
            var invs = await _context.Investigations
                .Select(i => new InvestigationDto
                {
                    Id = i.Id,
                    MedicalRecordId = i.MedicalRecordId,
                    SelectedInvestigations = i.SelectedInvestigations,
                    Notes = i.Notes,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt
                })
                .ToListAsync();

            return Ok(invs);
        }

        // ✅ NEW: GET all investigations for a specific medical record
        // Frontend calls: GET /api/Investigation/ByRecord/{medicalRecordId}
        [HttpGet("ByRecord/{medicalRecordId}")]
        public async Task<IActionResult> GetByMedicalRecord(int medicalRecordId)
        {
            var invs = await _context.Investigations
                .Where(i => i.MedicalRecordId == medicalRecordId)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new
                {
                    id = i.Id,
                    medicalRecordId = i.MedicalRecordId,
                    selectedInvestigations = i.SelectedInvestigations,
                    notes = i.Notes,
                    createdAt = i.CreatedAt,   // ✅ explicit camelCase
                    updatedAt = i.UpdatedAt
                })
                .ToListAsync();

            return Ok(invs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InvestigationDto>> GetById(int id)
        {
            var i = await _context.Investigations.FindAsync(id);
            if (i == null) return NotFound();

            var dto = new InvestigationDto
            {
                Id = i.Id,
                MedicalRecordId = i.MedicalRecordId,
                SelectedInvestigations = i.SelectedInvestigations,
                Notes = i.Notes,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<InvestigationDto>> Create(CreateInvestigationRequest request)
        {
            var record = await _context.MedicalRecords.FindAsync(request.MedicalRecordId);
            if (record == null) return BadRequest("Invalid MedicalRecordId");

            var inv = new Investigation
            {
                MedicalRecordId = request.MedicalRecordId,
                SelectedInvestigations = request.SelectedInvestigations,
                Notes = request.Notes,
                CreatedAt = DateTime.Now  // ✅ always set server-side
            };

            _context.Investigations.Add(inv);
            await _context.SaveChangesAsync();

            // ✅ Return camelCase so frontend reads createdAt correctly
            return CreatedAtAction(nameof(GetById), new { id = inv.Id }, new
            {
                id = inv.Id,
                medicalRecordId = inv.MedicalRecordId,
                selectedInvestigations = inv.SelectedInvestigations,
                notes = inv.Notes,
                createdAt = inv.CreatedAt,
                updatedAt = inv.UpdatedAt
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateInvestigationRequest request)
        {
            var existing = await _context.Investigations.FindAsync(id);
            if (existing == null) return NotFound();

            existing.SelectedInvestigations = request.SelectedInvestigations;
            existing.Notes = request.Notes;
            existing.UpdatedAt = DateTime.Now;

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Archive(int id)
        {
            var existing = await _context.Investigations.FindAsync(id);
            if (existing == null) return NotFound();

            existing.UpdatedAt = DateTime.Now;
            _context.Investigations.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}