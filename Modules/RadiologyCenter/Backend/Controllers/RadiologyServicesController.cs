using Microsoft.AspNetCore.Mvc;
using RadiologyCenterAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace RadiologyCenterAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RadiologyServicesController : ControllerBase
    {
        private readonly RadiologyDbContext _context;

        public RadiologyServicesController(RadiologyDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var services = await _context.RadiologyServices.ToListAsync();
            return Ok(services);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var service = await _context.RadiologyServices.FindAsync(id);
            if (service == null) return NotFound();
            return Ok(service);
        }
    }
}
