using ARIO.Data;
using ARIO.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ARIO.Controllers
{
    [Route("api/CategoryType")]
    public class CategoryTypeController : Controller
    {
        private readonly SismiqueContext _context;

        public CategoryTypeController(SismiqueContext context)
        {
            _context = context;
        }

        // GET: api/CategoryType
        [HttpGet]
        public IEnumerable<CategoryType> GetCategoryType(bool includeCategories = true)
        {
            IQueryable<CategoryType> categoryTypeQuery = _context.CategoryTypes;

            if (includeCategories)
            {
                categoryTypeQuery = categoryTypeQuery.Include(ct => ct.Categories);
            }

            // Sort the sub lists
            var categoryTypes = categoryTypeQuery.OrderBy(c => c.Order).ToList();
            foreach (var categoryType in categoryTypes)
            {
                categoryType.Categories = categoryType.Categories.OrderBy(ct => ct.Order).ToList();
            }

            return categoryTypes;
        }

        // GET api/CategoryType/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryType([FromRoute] int id, bool includeCategories = true)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IQueryable<CategoryType> categoryTypeQuery = _context.CategoryTypes;

            if (includeCategories)
            {
                categoryTypeQuery = categoryTypeQuery.Include(ct => ct.Categories);
            }

            var categoryType = await categoryTypeQuery.SingleOrDefaultAsync(ct => ct.ID == id);

            if (categoryType == null)
            {
                return NotFound();
            }

            return Ok(categoryType);
        }
    }
}
