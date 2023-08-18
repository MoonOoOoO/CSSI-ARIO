//using System;
//using System.IO;
//using System.Linq;
//using System.Net.Http;
//using System.Threading.Tasks;
//using System.Collections.Generic;
//using Microsoft.AspNetCore.Hosting;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using Newtonsoft.Json;
//using Sismique.Data;
//using Sismique.Models;
//using Sismique.Services;
//using MetadataExtractor.Formats.Exif;
//using MetadataExtractor;
//using Directory = MetadataExtractor.Directory;

//namespace Sismique.Controllers
//{
//    [Produces("application/json")]
//    [Route("api/BridgeImage")]
//    public class BridgeImageController : Controller
//    {
//        private readonly SismiqueContext _context;
//        private static readonly HttpClient HttpClient = new HttpClient();
//        private readonly IViewRenderService _viewRenderService;
//        private readonly Dictionary<String, String> labels;
//        private const string BRIDGE_CLASSIFICATION_API = "http://localhost:16001/predict";

//        private const string IMAGES_DIR = "images/bridges";
//        private readonly IHostingEnvironment _hostingEnvironment;

//        private struct ClassificationResult
//        {
//            public string Category;
//            public double Confidence;

//            public ClassificationResult(string category, double confidence)
//            {
//                Category = category;
//                Confidence = confidence;
//            }
//        }

//        private static async Task<List<ClassificationResult>> PredictRawImage(string imagePath)
//        {
//            var results = new List<ClassificationResult>();
//            var fileStream = new FileStream(imagePath, FileMode.Open);
//            var multiContent = new MultipartFormDataContent
//            {
//                { new StreamContent(fileStream), "file", "image.bmp" }
//            };

//            var response = await HttpClient.PostAsync(BRIDGE_CLASSIFICATION_API, multiContent);

//            if (response.IsSuccessStatusCode)
//            {
//                // Extract the response in JSON
//                var responseString = await response.Content.ReadAsStringAsync();

//                dynamic responseJson = JsonConvert.DeserializeObject(responseString);

//                if (responseJson.success.Value)
//                {
//                    foreach (var result in responseJson.results)
//                    {
//                        string label = result.label.Value;
//                        double probability = result.probability.Value;
//                        results.Add(new ClassificationResult(label, probability));
//                    }
//                }
//            }
//            return results;
//        }

//        public BridgeImageController(
//            IHostingEnvironment hostingEnvironment,
//            IViewRenderService viewRenderService,
//            SismiqueContext context)
//        {
//            _context = context;
//            _hostingEnvironment = hostingEnvironment;
//            _viewRenderService = viewRenderService;

//            labels = new Dictionary<string, string>
//            {
//                { "OVW", "Bridge Overview" },
//                { "DECK", "Deck" },
//                { "SUPS", "Superstructure" },
//                { "SUBS", "Substructure" },
//                { "RAIL", "Railing" },
//                { "DETAIL", "Detail" },
//                { "DOV", "Deck Overview" },
//                { "JOINTS", "Joints" },
//                { "DPA", "Deck Part" },
//                { "SOVW", "Overview" },
//                { "PART", "Part" },
//                { "BEAR", "Bearing" },
//                { "POV", "Pier Overview" },
//                { "PPA", "Pier Part" },
//                { "AOV", "Abutment Overview" },
//                { "APA", "Abutment Part" },
//                { "OTH", "Other" }
//            };
//        }

//        // POST: api/BridgeImage/upload
//        [HttpPost, DisableRequestSizeLimit, Route("upload")]
//        public async Task<IActionResult> UploadImage(IFormFile file)
//        {
//            // Check file length and extension
//            var fileExtension = Path.GetExtension(file.FileName).ToLower();
//            if (file.Length <= 0)
//            {
//                return BadRequest("The file is empty or is not an image");
//            }

//            var fileNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
//            var fileName = string.Concat(fileNameWithoutExt, '_', Guid.NewGuid().ToString(), fileExtension);

//            var bridgeImageDir = Path.Combine(_hostingEnvironment.WebRootPath, IMAGES_DIR);
//            var absoluteRawFilePath = Path.Combine(bridgeImageDir, fileName);
//            var relativeRawFilePath = Path.Combine(IMAGES_DIR, fileName);

//            if (!System.IO.Directory.Exists(bridgeImageDir))
//            {
//                System.IO.Directory.CreateDirectory(bridgeImageDir);
//            }

//            // Copy the image in the directory
//            using (var stream = new FileStream(absoluteRawFilePath, FileMode.Create))
//            {
//                await file.CopyToAsync(stream);
//            }

//            var directories = ImageMetadataReader.ReadMetadata(file.OpenReadStream());
//            var bridgeImageDate = ReadImageDate(directories, DateTime.Now);
//            var results = await PredictRawImage(absoluteRawFilePath);

//            var bridgeImage = new BridgeImage
//            {
//                File = relativeRawFilePath,
//                Date = bridgeImageDate
//            };

//            foreach (var pred in results)
//            {
//                var category = await _context.BridgeCategories.SingleOrDefaultAsync(c => c.ClassifierName == pred.Category);

//                if (category == null)
//                {
//                    return StatusCode(StatusCodes.Status500InternalServerError, "Brdige Category does not exist: " + pred.Category);
//                }
//                // Create the ImageCategory corresponding to this classification result
//                var bridgeImageCategory = new BridgeImageCategory
//                {
//                    Image = bridgeImage,
//                    Category = category,
//                    CategoryId = category.ID,
//                    Confidence = pred.Confidence
//                };
//                bridgeImage.BridgeImageCategories.Add(bridgeImageCategory);
//                _context.BridgeImageCategories.Add(bridgeImageCategory);
//            }

//            _context.BridgeImage.Add(bridgeImage);
//            await _context.SaveChangesAsync();
//            return CreatedAtAction("GetBridgeImage", new { id = bridgeImage.ID }, bridgeImage);
//        }

//        // GET: api/BridgeImage
//        [HttpGet]
//        public IEnumerable<BridgeImage> GetBridgeImage(string categoryName = "")
//        {
//            if (categoryName != "")
//            {
//                var images = new List<BridgeImage>();
//                var query = _context.BridgeImageCategories
//                    .Include(ic => ic.Image)
//                    .Where(c => c.Category.Name == categoryName)
//                    .OrderBy(c => c.Image.Date);

//                foreach (var ic in query)
//                {
//                    images.Add(ic.Image);
//                }
//                return images;
//            }
//            else
//            {
//                return _context.BridgeImage
//                    .Include(i => i.BridgeImageCategories)
//                    .ThenInclude(c => c.Category);
//            }
//        }

//        // PUT: api/BridgeImage/5
//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutBridgeImage([FromRoute] int id, [FromBody] BridgeImage bridgeImage)
//        {
//            if (!ModelState.IsValid)
//            {
//                return BadRequest(ModelState);
//            }

//            if (id != bridgeImage.ID)
//            {
//                return BadRequest();
//            }

//            _context.Entry(bridgeImage).State = EntityState.Modified;

//            try
//            {
//                await _context.SaveChangesAsync();
//            }
//            catch (DbUpdateConcurrencyException)
//            {
//                if (!BridgeImageExists(id))
//                {
//                    return NotFound();
//                }
//                else
//                {
//                    throw;
//                }
//            }

//            return NoContent();
//        }

//        // POST: api/BridgeImage
//        [HttpPost]
//        public async Task<IActionResult> PostBridgeImage([FromBody] BridgeImage bridgeImage)
//        {
//            if (!ModelState.IsValid)
//            {
//                return BadRequest(ModelState);
//            }

//            _context.BridgeImage.Add(bridgeImage);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction("GetBridgeImage", new { id = bridgeImage.ID }, bridgeImage);
//        }

//        // DELETE: api/BridgeImage/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteBridgeImage([FromRoute] int id)
//        {
//            if (!ModelState.IsValid)
//            {
//                return BadRequest(ModelState);
//            }

//            var bridgeImage = await _context.BridgeImage.SingleOrDefaultAsync(m => m.ID == id);
//            if (bridgeImage == null)
//            {
//                return NotFound();
//            }

//            _context.BridgeImage.Remove(bridgeImage);
//            await _context.SaveChangesAsync();

//            return Ok(bridgeImage);
//        }

//        private static DateTime ReadImageDate(IReadOnlyList<Directory> directories, DateTime defaultImageDate)
//        {
//            var imageDate = defaultImageDate;

//            // Find the so-called Exif "SubIFD"
//            var subIfdDirectory = directories.OfType<ExifSubIfdDirectory>().FirstOrDefault();

//            if (subIfdDirectory != null)
//            {
//                // Read image time taken if available
//                if (subIfdDirectory.TryGetDateTime(ExifDirectoryBase.TagDateTimeOriginal, out var date))
//                {
//                    imageDate = date;
//                }
//            }

//            return imageDate;
//        }

//        private bool BridgeImageExists(int id)
//        {
//            return _context.BridgeImage.Any(e => e.ID == id);
//        }
//    }
//}