using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ARIO.Data;
using ARIO.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ARIO.Controllers
{
    [Produces("application/json")]
    [Route("api/ReportDescription")]
    public class ReportDescriptionController : Controller
    {
        private readonly SismiqueContext _context;

        public ReportDescriptionController(SismiqueContext context)
        {
            _context = context;
        }

        // GET: api/ReportDescription
        [HttpGet]
        public IEnumerable<ReportDescription> GetReportDescriptions()
        {
            return _context.ReportDescriptions;
        }

        // GET: api/ReportDescription/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReportDescription([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var reportDescription = await _context.ReportDescriptions.SingleOrDefaultAsync(m => m.ID == id);

            if (reportDescription == null)
            {
                return NotFound();
            }

            return Ok(reportDescription);
        }

        // PUT: api/ReportDescription/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReportDescription([FromRoute] int id, [FromBody] ReportDescription reportDescription)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != reportDescription.ID)
            {
                return BadRequest();
            }

            _context.Entry(reportDescription).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReportDescriptionExists(id))
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

        // POST: api/ReportDescription
        [HttpPost]
        public async Task<IActionResult> PostReportDescription([FromBody] ReportDescription reportDescription)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.ReportDescriptions.Add(reportDescription);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetReportDescription", new { id = reportDescription.ID }, reportDescription);
        }

        // DELETE: api/ReportDescription/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReportDescription([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var reportDescription = await _context.ReportDescriptions.SingleOrDefaultAsync(m => m.ID == id);
            if (reportDescription == null)
            {
                return NotFound();
            }

            _context.ReportDescriptions.Remove(reportDescription);
            await _context.SaveChangesAsync();

            return Ok(reportDescription);
        }

        private bool ReportDescriptionExists(int id)
        {
            return _context.ReportDescriptions.Any(e => e.ID == id);
        }
    }
}