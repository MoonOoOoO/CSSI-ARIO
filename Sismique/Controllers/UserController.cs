using ARIO.DTO;
using ARIO.Data;
using ARIO.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using System.Composition;
using MetadataExtractor;

namespace ARIO.Controllers
{
    [Produces("application/json")]
    [Route("api/User")]
    public class UserController : Controller
    {
        private readonly SismiqueContext _context;
        private static string key;

        public UserController(SismiqueContext context)
        {
            _context = context;
        }

        // GET: api/User
        [HttpGet]
        public IEnumerable<User> GetUsers()
        {
            return _context.Users;
        }

        // GET: api/User/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            IQueryable<User> userQuery = _context.Users;

            userQuery = userQuery.Include(r => r.Reports)
                .ThenInclude(i => i.Images);

            userQuery = userQuery.Include(r => r.ReportCollections)
                .ThenInclude(i => i.Report)
                .ThenInclude(i => i.ReportDescription);

            userQuery = userQuery.Include(r => r.ReportCollections)
                .ThenInclude(i => i.Report)
                .ThenInclude(i => i.Images);

            var user = await userQuery.SingleOrDefaultAsync(m => m.ID == id);

            if (user == null)
            {
                return NotFound();
            }

            user.Password = GetRandomString(64);
            var reportList = new List<ListReport>();
            foreach (var report in user.Reports)
            {
                // By default, display the first image
                var bestImage = report.Images.FirstOrDefault();
                var bestConfidence = double.MinValue;

                // By default, display the GPS coordinates of the last image with GPS coordinates
                var location = new GeoLocation(0.0, 0.0);

                // Select the image, which is from an overview category, that has the best confidence
                foreach (var image in report.Images)
                {
                    // Check if this image is the best overview image
                    foreach (var ic in image.ImageCategories)
                    {
                        if (ic.Category.OverviewCategory && ic.Confidence > bestConfidence)
                        {
                            bestConfidence = ic.Confidence;
                            bestImage = image;
                        }
                    }

                    // Check if this image has GPS coordinates
                    if (image.HasGpsCoordinates())
                    {
                        location = image.GetGeoLocation();
                    }
                }
                reportList.Add(ListReport.FromReport(report, report.Images.Count(), bestImage, location));
            }

            var loginUser = new LoginUser(
            user.ID, user.Username, user.Password,
                user.Firstname, user.Middlename, user.Lastname,
                user.Institution, user.Lastlogin,
                reportList, user.ReportCollections);
            return Ok(loginUser);
        }

        // PUT: api/User/5
        // update user information
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser([FromRoute] int id, [FromBody] User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != user.ID)
            {
                return BadRequest();
            }

            IQueryable<User> userQuery = _context.Users;
            var user_db = await userQuery.SingleOrDefaultAsync(m => m.ID == id);
            user.Password = user_db.Password;

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
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

        // POST: api/User
        [HttpPost]
        public async Task<IActionResult> PostUser([FromBody] User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            IQueryable<User> userQuery = _context.Users;
            var u = await userQuery.SingleOrDefaultAsync(m => m.Username == user.Username);
            if (u != null)
            {
                return StatusCode(409);
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.ID }, user);
        }

        //GET: api/User/Token
        [HttpGet, Route("Token")]
        public IActionResult PostToken()
        {
            string validChars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?_-";
            Random random = new Random();

            int length = 24;
            char[] chars = new char[length];
            for (int i = 0; i < length; i++)
            {
                chars[i] = validChars[random.Next(0, validChars.Length)];
            }
            key = new string(chars);
            // SHA1 Hash the key
            //var hash = new SHA1Managed().ComputeHash(Encoding.UTF8.GetBytes(key));
            //return Ok(string.Concat(hash.Select(b => b.ToString("x2"))));
            return Ok(key);
        }

        private string GetRandomString(int length)
        {
            string validChars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?_-";
            Random random = new Random();

            char[] chars = new char[length];
            for (int i = 0; i < length; i++)
            {
                chars[i] = validChars[random.Next(0, validChars.Length)];
            }
            key = new string(chars);
            return key;
        }

        //POST: api/User/login
        [HttpPost, Route("Login")]
        public async Task<IActionResult> PostLogin([FromBody] User user)
        {
            IQueryable<User> userQuery = _context.Users;
            userQuery = userQuery.Include(r => r.Reports)
                .ThenInclude(i => i.Images);
            var u = await userQuery.SingleOrDefaultAsync(m => m.Username == user.Username);
            if (u == null)
            {
                return NotFound();
            }
            else if (u.Password == user.Password)
            {
                u.Password = GetRandomString(64);
                var reportList = new List<ListReport>();
                foreach (var report in u.Reports)
                {
                    // By default, display the first image
                    var bestImage = report.Images.FirstOrDefault();
                    var bestConfidence = double.MinValue;

                    // By default, display the GPS coordinates of the last image with GPS coordinates
                    var location = new GeoLocation(0.0, 0.0);

                    // Select the image, which is from an overview category, that has the best confidence
                    foreach (var image in report.Images)
                    {
                        // Check if this image is the best overview image
                        foreach (var ic in image.ImageCategories)
                        {
                            if (ic.Category.OverviewCategory && ic.Confidence > bestConfidence)
                            {
                                bestConfidence = ic.Confidence;
                                bestImage = image;
                            }
                        }

                        // Check if this image has GPS coordinates
                        if (image.HasGpsCoordinates())
                        {
                            location = image.GetGeoLocation();
                        }
                    }
                    reportList.Add(ListReport.FromReport(report, report.Images.Count(), bestImage, location));
                }

                var loginUser = new LoginUser(
                u.ID, u.Username, u.Password,
                    u.Firstname, u.Middlename, u.Lastname,
                    u.Institution, u.Lastlogin,
                    reportList, u.ReportCollections);

                return Ok(loginUser);
            }
            else
            {
                return Unauthorized();
            }
        }

        // DELETE: api/User/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.SingleOrDefaultAsync(m => m.ID == id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.ID == id);
        }
    }
}