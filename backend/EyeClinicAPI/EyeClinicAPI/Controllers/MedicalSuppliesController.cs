using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models;

namespace EyeClinicAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalSuppliesController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public MedicalSuppliesController(EyeClinicDbContext context)
        {
            _context = context;
        }

        // GET: api/MedicalSupplies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicalSupplies>>> GetMedicalSupplies()
        {
            return await _context.MedicalSupplies.OrderBy(s => s.SupplyName).ToListAsync();
        }

        // GET: api/MedicalSupplies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalSupplies>> GetMedicalSupply(int id)
        {
            var supply = await _context.MedicalSupplies.FindAsync(id);
            
            if (supply == null)
            {
                return NotFound();
            }
            
            return supply;
        }

        // GET: api/MedicalSupplies/LowStock
        [HttpGet("LowStock")]
        public async Task<ActionResult<IEnumerable<MedicalSupplies>>> GetLowStockSupplies()
        {
            return await _context.MedicalSupplies
                .Where(s => s.CurrentQuantity <= s.ReorderLevel)
                .OrderBy(s => s.CurrentQuantity)
                .ToListAsync();
        }

        // PUT: api/MedicalSupplies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMedicalSupply(int id, MedicalSupplies supply)
        {
            if (id != supply.SupplyId)
            {
                return BadRequest();
            }

            supply.UpdatedAt = DateTime.Now;
            _context.Entry(supply).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MedicalSupplyExists(id))
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

        // POST: api/MedicalSupplies
        [HttpPost]
        public async Task<ActionResult<MedicalSupplies>> PostMedicalSupply(MedicalSupplies supply)
        {
            supply.CreatedAt = DateTime.Now;
            supply.UpdatedAt = DateTime.Now;
            
            _context.MedicalSupplies.Add(supply);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMedicalSupply), new { id = supply.SupplyId }, supply);
        }

        // DELETE: api/MedicalSupplies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicalSupply(int id)
        {
            var supply = await _context.MedicalSupplies.FindAsync(id);
            if (supply == null)
            {
                return NotFound();
            }

            _context.MedicalSupplies.Remove(supply);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MedicalSupplyExists(int id)
        {
            return _context.MedicalSupplies.Any(e => e.SupplyId == id);
        }
    }
}
