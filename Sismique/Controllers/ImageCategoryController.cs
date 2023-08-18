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
    [Route("api/ImageCategory")]
    public class ImageCategoryController : Controller
    {
        private readonly SismiqueContext _context;

        public ImageCategoryController(SismiqueContext context)
        {
            _context = context;
        }

        // GET: api/ImageCategory
        [HttpGet]
        public IEnumerable<ImageCategory> GetImageCategories()
        {
            return _context.ImageCategories;
        }

        // GET: api/ImageCategory/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetImageCategory([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var imageCategory = await _context.ImageCategories.SingleOrDefaultAsync(m => m.ImageId == id);

            if (imageCategory == null)
            {
                return NotFound();
            }

            return Ok(imageCategory);
        }

        // PUT: api/ImageCategory/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutImageCategory([FromRoute] int id, [FromBody] ImageCategory imageCategory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != imageCategory.ImageId)
            {
                return BadRequest();
            }

            _context.Entry(imageCategory).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ImageCategoryExists(id))
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

        // POST: api/ImageCategory
        [HttpPost]
        public async Task<IActionResult> PostImageCategory([FromBody] ImageCategory imageCategory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.ImageCategories.Add(imageCategory);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ImageCategoryExists(imageCategory.ImageId))
                {
                    return new StatusCodeResult(StatusCodes.Status409Conflict);
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetImageCategory", new { id = imageCategory.ImageId }, imageCategory);
        }

        [HttpPost, Route("delete")]
        public async Task<IActionResult> DeleteImageCategory([FromBody] ImageCategory imageCategory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ic = await _context.ImageCategories
                .SingleOrDefaultAsync(p =>
                    p.ImageId == imageCategory.ImageId
                    && p.CategoryId == imageCategory.CategoryId);
            if (ic == null)
            {
                return NotFound();
            }

            _context.ImageCategories.Remove(ic);
            await _context.SaveChangesAsync();

            return Ok(ic);
        }

        // DELETE: api/ImageCategory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImageCategory([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var imageCategory = await _context.ImageCategories.SingleOrDefaultAsync(m => m.ImageId == id);
            if (imageCategory == null)
            {
                return NotFound();
            }

            _context.ImageCategories.Remove(imageCategory);
            await _context.SaveChangesAsync();

            return Ok(imageCategory);
        }

        private bool ImageCategoryExists(int id)
        {
            return _context.ImageCategories.Any(e => e.ImageId == id);
        }
    }
}