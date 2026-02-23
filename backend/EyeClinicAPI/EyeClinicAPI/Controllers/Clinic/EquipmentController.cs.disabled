using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EyeClinicAPI.Data;
using EyeClinicAPI.Models.Clinic;

namespace EyeClinicAPI.Controllers.Clinic
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquipmentController : ControllerBase
    {
        private readonly EyeClinicDbContext _context;

        public EquipmentController(EyeClinicDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Equipment>>> GetEquipments()
        {
            return await _context.Equipments.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Equipment>> GetEquipment(int id)
        {
            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null) return NotFound();
            return equipment;
        }

        [HttpPost]
        public async Task<ActionResult<Equipment>> PostEquipment(Equipment equipment)
        {
            equipment.CreatedAt = DateTime.Now;
            _context.Equipments.Add(equipment);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEquipment), new { id = equipment.Id }, equipment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutEquipment(int id, Equipment equipment)
        {
            if (id != equipment.Id) return BadRequest();
            _context.Entry(equipment).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!EquipmentExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEquipment(int id)
        {
            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null) return NotFound();

            _context.Equipments.Remove(equipment);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool EquipmentExists(int id) => _context.Equipments.Any(e => e.Id == id);
    }
}
