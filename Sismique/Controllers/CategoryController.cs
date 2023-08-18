using ARIO.Data;
using ARIO.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ARIO.Controllers
{
    [Produces("application/json")]
    [Route("api/Category")]
    public class CategoryController : Controller
    {
        private readonly SismiqueContext _context;

        public CategoryController(SismiqueContext context)
        {
            _context = context;
        }

        // GET: api/Category
        [HttpGet]
        public IEnumerable<Category> GetCategory()
        {
            return _context.Categories.OrderBy(c => c.Order);
        }

        // GET: api/Category/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory([FromRoute] int id, bool includeImages = true)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IQueryable<Category> categoryQuery = _context.Categories;

            if (includeImages)
            {
                categoryQuery = categoryQuery.Include(c => c.ImageCategories);
            }

            var category = await categoryQuery.SingleOrDefaultAsync(m => m.ID == id);

            if (category == null)
            {
                return NotFound();
            }

            return Ok(category);
        }
    }
}