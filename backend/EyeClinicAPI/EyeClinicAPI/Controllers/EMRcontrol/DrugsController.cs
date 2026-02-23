using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace EyeClinicAPI.Controllers.EMRcontrol
{
    [Route("api/[controller]")]
    [ApiController]
    public class DrugsController : ControllerBase
    {
        private readonly string _filePath;

        public DrugsController()
        {
            _filePath = Path.Combine(Directory.GetCurrentDirectory(), "SeedData", "drugs.json");
        }

        // GET: api/Drugs?query=a
        [HttpGet]
        public IActionResult GetDrugs([FromQuery] string query = "")
        {
            if (!System.IO.File.Exists(_filePath))
                return NotFound("Drugs JSON file not found");

            var json = System.IO.File.ReadAllText(_filePath);
            var drugs = JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();

            var filtered = drugs
                .Where(d => d.Contains(query, StringComparison.OrdinalIgnoreCase))
                .Take(50)
                .ToList();

            return Ok(filtered);
        }

        // POST: api/Drugs
        [HttpPost]
        public IActionResult AddDrug([FromBody] string newDrug)
        {
            if (string.IsNullOrWhiteSpace(newDrug))
                return BadRequest("Drug name cannot be empty");

            if (!System.IO.File.Exists(_filePath))
                return NotFound("Drugs JSON file not found");

            var json = System.IO.File.ReadAllText(_filePath);
            var drugs = JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();

            if (!drugs.Contains(newDrug, StringComparer.OrdinalIgnoreCase))
            {
                drugs.Add(newDrug);

                System.IO.File.WriteAllText(_filePath,
                    JsonSerializer.Serialize(drugs, new JsonSerializerOptions { WriteIndented = true }));
            }

            return Ok(drugs);
        }
    }
}
