using ARIO.Data;
using ARIO.DTO;
using ARIO.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using System.Linq.Expressions;

namespace ARIO.Controllers
{
    [Produces("application/json")]
    [Route("api/Images")]
    public class ImagesController : Controller
    {
        private readonly SismiqueContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;

        private const int IMAGES_PAGE_SIZE = 24;

        public ImagesController(SismiqueContext context, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        // GET: api/Images
        [HttpGet]
        public ImagePaginatedList GetImages(int filterCategory = -1, int pageIndex = 1, int pageSize = IMAGES_PAGE_SIZE)
        {
            var images = new List<Image>();

            // If pageSize is less than or equal to zero, there is no size limit
            if (pageSize <= 0)
            {
                pageSize = int.MaxValue;
            }

            // Variables for pagination
            var imagesCount = 0;
            var totalPages = 0;

            // If filter category is defined, we include only images from one category
            if (filterCategory > -1)
            {
                var imageCategoriesQuery = _context.ImageCategories
                    .Include(ic => ic.Image)
                    .ThenInclude(i => i.Report)
                    .ThenInclude(d => d.ReportDescription)
                    .Where(ic => ic.CategoryId == filterCategory)
                    .OrderBy(ic => ic.Image.Date);

                // How many images in total
                imagesCount = imageCategoriesQuery.Count();
                // Compute the index of the last page, and clamp pageIndex
                totalPages = (int)Math.Ceiling((double)imagesCount / pageSize);
                pageIndex = Math.Clamp(pageIndex, 1, Math.Max(totalPages, 1));

                var imageCategories = imageCategoriesQuery.Skip((pageIndex - 1) * pageSize)
                                                          .Take(pageSize)
                                                          .ToList();

                // Map results into a collection of images
                foreach (var ic in imageCategories)
                {
                    if (ic.Image.Report.Shared == true)
                    {
                        images.Add(ic.Image);
                    }
                }
            }
            else
            {
                var imagesQuery = _context.Images.Include(i => i.Report)
                                                 .OrderBy(i => i.Date);

                // How many images in total
                imagesCount = imagesQuery.Count();
                // Compute the index of the last page, and clamp pageIndex
                totalPages = (int)Math.Ceiling((double)imagesCount / pageSize);
                pageIndex = Math.Clamp(pageIndex, 1, Math.Max(totalPages, 1));

                // No filter, just all images
                images = _context.Images.Skip((pageIndex - 1) * pageSize)
                                        .Take(pageSize)
                                        .ToList();
            }
            return new ImagePaginatedList(images, imagesCount, pageIndex, pageSize);
        }

        // GET: api/Images/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetImage([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var image = await _context.Images.SingleOrDefaultAsync(m => m.ID == id);

            if (image == null)
            {
                return NotFound();
            }

            return Ok(image);
        }

        // PUT: api/Images/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutImage([FromRoute] int id, [FromBody] Image image)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != image.ID)
            {
                return BadRequest();
            }

            _context.Entry(image).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ImageExists(id))
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

        // POST: api/Images
        [HttpPost]
        public async Task<IActionResult> PostImage([FromBody] Image image)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Images.Add(image);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetImage", new { id = image.ID }, image);
        }

        // DELETE: api/Images/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var image = await _context.Images.SingleOrDefaultAsync(m => m.ID == id);
            if (image == null)
            {
                return NotFound();
            }

            var rawFilePath = Path.Combine(_hostingEnvironment.WebRootPath, image.File);
            var thumbnailPath = Path.Combine(_hostingEnvironment.WebRootPath, image.Thumbnail);

            if (System.IO.File.Exists(thumbnailPath))
            {
                try
                {
                    Console.WriteLine(thumbnailPath);
                    System.IO.File.Delete(thumbnailPath);
                }
                catch (Exception e)
                {
                    Console.WriteLine("Error when delete the image thumbnail " + e.Message);
                }
            }


            if (System.IO.File.Exists(rawFilePath))
            {
                try
                {
                    Console.WriteLine(rawFilePath);
                    System.IO.File.Delete(rawFilePath);
                }
                catch (Exception e)
                {
                    Console.WriteLine("Error when delete the image file " + e.Message);
                }
            }

            _context.Images.Remove(image);
            await _context.SaveChangesAsync();

            return Ok(image);
        }

        private bool ImageExists(int id)
        {
            return _context.Images.Any(e => e.ID == id);
        }
    }
}