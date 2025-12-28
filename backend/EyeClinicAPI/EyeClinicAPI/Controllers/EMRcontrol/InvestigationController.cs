using EyeClinicAPI.Data;
using EyeClinicAPI.DTOs.EMRd.Investigation;
using EyeClinicAPI.Models.EMR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EyeClinicAPI.Controllers.EMRcontrol
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

        // GET: api/Investigation
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

        // GET: api/Investigation/5
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

        // POST: api/Investigation
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
                CreatedAt = DateTime.Now
            };

            _context.Investigations.Add(inv);
            await _context.SaveChangesAsync();

            var dto = new InvestigationDto
            {
                Id = inv.Id,
                MedicalRecordId = inv.MedicalRecordId,
                SelectedInvestigations = inv.SelectedInvestigations,
                Notes = inv.Notes,
                CreatedAt = inv.CreatedAt,
                UpdatedAt = inv.UpdatedAt
            };

            return CreatedAtAction(nameof(GetById), new { id = inv.Id }, dto);
        }

        // PUT: api/Investigation/5
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

        // DELETE: api/Investigation/5
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
