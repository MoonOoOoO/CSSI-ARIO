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
    [Route("api/ReportCollections")]
    public class ReportCollectionsController : Controller
    {
        private readonly SismiqueContext _context;

        public ReportCollectionsController(SismiqueContext context)
        {
            _context = context;
        }

        // GET: api/ReportCollections
        [HttpGet]
        public IEnumerable<ReportCollection> GetReportCollections()
        {
            return _context.ReportCollections;
        }

        // GET: api/ReportCollections/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReportCollection([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var reportCollection = await _context.ReportCollections.SingleOrDefaultAsync(m => m.UserID == id);

            if (reportCollection == null)
            {
                return NotFound();
            }

            return Ok(reportCollection);
        }

        // PUT: api/ReportCollections/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReportCollection([FromRoute] int id, [FromBody] ReportCollection reportCollection)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != reportCollection.ReportID)
            {
                return BadRequest();
            }

            _context.Entry(reportCollection).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReportCollectionExists(id))
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


        // POST: api/ReportCollections/Remove
        [HttpPost, Route("Remove")]
        public async Task<IActionResult> PostDeleteReportCollection([FromBody] ReportCollection reportCollection)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.ReportCollections.Remove(reportCollection);
            await _context.SaveChangesAsync();

            return Ok(reportCollection);
        }

        // POST: api/ReportCollections
        [HttpPost]
        public async Task<IActionResult> PostReportCollection([FromBody] ReportCollection reportCollection)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.ReportCollections.Add(reportCollection);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ReportCollectionExists(reportCollection.ReportID))
                {
                    return new StatusCodeResult(StatusCodes.Status409Conflict);
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetReportCollection", new { id = reportCollection.ReportID }, reportCollection);
        }

        // DELETE: api/ReportCollections/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReportCollection([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var reportCollection = await _context.ReportCollections.SingleOrDefaultAsync(m => m.ReportID == id);
            if (reportCollection == null)
            {
                return NotFound();
            }

            _context.ReportCollections.Remove(reportCollection);
            await _context.SaveChangesAsync();

            return Ok(reportCollection);
        }

        private bool ReportCollectionExists(int id)
        {
            return _context.ReportCollections.Any(e => e.ReportID == id);
        }
    }
}