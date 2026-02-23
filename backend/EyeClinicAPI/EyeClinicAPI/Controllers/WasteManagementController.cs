using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;

namespace EyeClinicAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WasteManagementController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public WasteManagementController(EyeClinicDbContext context)
        {
            _context = context;
        }

        // GET: api/WasteManagement
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WasteManagement>>> GetWasteManagement()
        {
            return await _context.WasteManagement.OrderByDescending(w => w.GeneratedDate).ToListAsync();
        }

        // GET: api/WasteManagement/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WasteManagement>> GetWasteRecord(int id)
        {
            var waste = await _context.WasteManagement.FindAsync(id);
            
            if (waste == null)
            {
                return NotFound();
            }
            
            return waste;
        }

        // GET: api/WasteManagement/Pending
        [HttpGet("Pending")]
        public async Task<ActionResult<IEnumerable<WasteManagement>>> GetPendingWaste()
        {
            return await _context.WasteManagement
                .Where(w => w.Status == "Pending" || w.Status == "Collected")
                .OrderBy(w => w.GeneratedDate)
                .ToListAsync();
        }

        // PUT: api/WasteManagement/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutWasteRecord(int id, WasteManagement waste)
        {
            if (id != waste.WasteId)
            {
                return BadRequest();
            }

            waste.UpdatedAt = DateTime.Now;
            _context.Entry(waste).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WasteRecordExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/WasteManagement
        [HttpPost]
        public async Task<ActionResult<WasteManagement>> PostWasteRecord(WasteManagement waste)
        {
            waste.CreatedAt = DateTime.Now;
            waste.UpdatedAt = DateTime.Now;
            
            _context.WasteManagement.Add(waste);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWasteRecord), new { id = waste.WasteId }, waste);
        }

        // DELETE: api/WasteManagement/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWasteRecord(int id)
        {
            var waste = await _context.WasteManagement.FindAsync(id);
            if (waste == null)
            {
                return NotFound();
            }

            _context.WasteManagement.Remove(waste);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool WasteRecordExists(int id)
        {
            return _context.WasteManagement.Any(e => e.WasteId == id);
        }
    }
}
