using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models.Clinic;

namespace EyeClinicAPI.Controllers.Clinic
{
    [ApiController]
    [Route("api/[controller]")]
    public class SupplyController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public SupplyController(EyeClinicDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Supply>>> GetSupplies()
        {
            return await _context.Supplies.ToListAsync();
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<IEnumerable<Supply>>> GetLowStock()
        {
            return await _context.Supplies
                .Where(s => s.Quantity <= s.ReorderLevel)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Supply>> GetSupply(int id)
        {
            var supply = await _context.Supplies.FindAsync(id);
            if (supply == null) return NotFound();
            return supply;
        }

        [HttpPost]
        public async Task<ActionResult<Supply>> PostSupply(Supply supply)
        {
            supply.CreatedAt = DateTime.Now;
            supply.LastRestocked = DateTime.Now;
            _context.Supplies.Add(supply);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSupply), new { id = supply.Id }, supply);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSupply(int id, Supply supply)
        {
            if (id != supply.Id) return BadRequest();
            _context.Entry(supply).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!SupplyExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupply(int id)
        {
            var supply = await _context.Supplies.FindAsync(id);
            if (supply == null) return NotFound();

            _context.Supplies.Remove(supply);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool SupplyExists(int id) => _context.Supplies.Any(e => e.Id == id);
    }
}
