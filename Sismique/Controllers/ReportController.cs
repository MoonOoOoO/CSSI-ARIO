using ARIO.Data;
using ARIO.DTO;
using ARIO.Models;
using ARIO.Services;
using ARIO.Utils;
using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Directory = MetadataExtractor.Directory;

namespace ARIO.Controllers
{
    [Produces("application/json")]
    [Route("api/Report")]
    public class ReportController : Controller
    {
        private readonly SismiqueContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IViewRenderService _viewRenderService;
        private static IConfiguration _configuration;
        private static readonly HttpClient HttpClient = new HttpClient();

        private const int REPORTS_PAGE_SIZE = 16;
        private static readonly string[] AllowedExtensions = { ".gif", ".png", ".jpeg", ".jpg", ".jfif" };
        private const string IMAGES_DIR = "images";
        private const string RAW_IMAGES_DIR = "raw";
        private const string THUMBNAIL_IMAGES_DIR = "thumbnail";
        private const int THUMBNAIL_TARGET_WIDTH = 480;


        private struct ClassificationResult
        {
            public string Category;
            public double Confidence;

            public ClassificationResult(string category, double confidence)
            {
                Category = category;
                Confidence = confidence;
            }
        }

        public ReportController(IHostingEnvironment hostingEnvironment,
                                IViewRenderService viewRenderService,
                                IConfiguration iconfig,
                                SismiqueContext context)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _viewRenderService = viewRenderService;
            _configuration = iconfig;
        }

        // GET: api/Report
        [HttpGet]
        public ReportPaginatedList GetReports(int pageIndex = 1, int pageSize = REPORTS_PAGE_SIZE)
        {
            // If pageSize is less than or equal to zero, there is no size limit
            if (pageSize <= 0)
            {
                pageSize = int.MaxValue;
            }

            // Query the database according to the pagination
            var reportsSource = _context.Reports.Where(r => r.Shared == true)
                .Include(r => r.Images)
                .ThenInclude(i => i.ImageCategories)
                .ThenInclude(ic => ic.Category)
                .OrderByDescending(r => r.Date);


            // How many reports in total
            var reportsCount = reportsSource.Count();
            // Compute the index of the last page, and clamp pageIndex
            var totalPages = (int)Math.Ceiling((double)reportsCount / pageSize);
            pageIndex = Math.Clamp(pageIndex, 1, Math.Max(totalPages, 1));

            var reports = reportsSource.Skip((pageIndex - 1) * pageSize)
                                       .Take(pageSize);

            var reportList = new List<ListReport>();
            foreach (var report in reports)
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

            var reportPaginatedList = new ReportPaginatedList(reportList, reportsCount, pageIndex, pageSize);
            return reportPaginatedList;
        }

        // GET: api/Report/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReport([FromRoute] int id, bool includeImages = true)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            IQueryable<Report> reportQuery = _context.Reports;
            if (includeImages)
            {
                reportQuery = reportQuery.Include(r => r.Images)
                                         .ThenInclude(i => i.ImageCategories);
            }
            reportQuery = reportQuery.Include(u => u.User);
            reportQuery = reportQuery.Include(r => r.ReportDescription);

            var report = await reportQuery.SingleOrDefaultAsync(m => m.ID == id);
            if (report == null)
            {
                return NotFound();
            }
            return Ok(report);
        }

        // GET: api/Report/5/archive
        [HttpGet("{id}/archive")]
        public async Task<IActionResult> ExportZipReport([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var report = await _context.Reports.SingleOrDefaultAsync(m => m.ID == id);

            if (report == null)
            {
                return NotFound("Report not found");
            }

            string fileName = report.ID + "_report_archive.zip";
            string filePath = Path.Combine(_hostingEnvironment.WebRootPath, "images/archives/" + fileName);
            string returnFileName = report.Name + "_report.zip";

            if (System.IO.File.Exists(filePath))
            {
                return File(new FileStream(filePath, FileMode.Open), "application/zip", returnFileName);
            }
            else
            {
                return NotFound();
            }
        }

        /**
         * 
         * Method to automatic zip the report after image uploading
         */
        // GET: api/Report/5/file
        [HttpGet("{id}/file")]
        public async Task<IActionResult> CompressReportFile([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var report = await _context.Reports.Include(r => r.Images)
                                   .ThenInclude(i => i.ImageCategories)
                                   .SingleOrDefaultAsync(m => m.ID == id);

            //var report = await _context.Reports.SingleOrDefaultAsync(m => m.ID == id);

            if (report == null)
            {
                return NotFound("Report not found");
            }

            string fileName = report.ID + "_report_archive.zip";
            string filePath = Path.Combine(_hostingEnvironment.WebRootPath, "images/archives/" + fileName);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // It is very important to export before loading categories in the Entity Framework
            // It prevents the JSON exporter from exporting all the DB with many circular references
            var jsonReport = JsonConvert.SerializeObject(report, Formatting.Indented, new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            });

            IEnumerable<Category> categories = await _context.Categories.OrderBy(c => c.Order).ToListAsync();
            if (categories == null)
            {
                return NotFound("No category in the database");
            }

            var watch = new System.Diagnostics.Stopwatch();
            using (var fileStream = new FileStream(filePath, FileMode.OpenOrCreate, FileAccess.Write))
            {
                using (var zipArchive = new ZipArchive(fileStream, ZipArchiveMode.Create, true))
                {
                    // Console.WriteLine("Start compress file");
                    // watch.Start();

                    // Export each image in the report
                    foreach (var image in report.Images)
                    {
                        // Save raw image
                        var rawImageFile = Path.Combine(_hostingEnvironment.WebRootPath, image.File);
                        ExportFileZip(zipArchive, image.File, rawImageFile);

                        // Save thumbnail image
                        var thumbnailImageFile = Path.Combine(_hostingEnvironment.WebRootPath, image.Thumbnail);
                        ExportFileZip(zipArchive, image.Thumbnail, thumbnailImageFile);
                    }

                    ExportStringZip(zipArchive, "report.json", jsonReport);

                    // Export the report in HTML
                    var exportReport = new ExportReport(categories, report);
                    var htmlReport = await _viewRenderService.RenderToStringAsync("Report/Export", exportReport);
                    ExportStringZip(zipArchive, "report.html", htmlReport);

                    // Export the necessary CSS and Javascript files
                    var bootstrapCssFile = Path.Combine("css", "bootstrap.min.css");
                    var bootstrapCssFilePath = Path.Combine(_hostingEnvironment.WebRootPath, "export", "css", "bootstrap.min.css");
                    ExportFileZip(zipArchive, bootstrapCssFile, bootstrapCssFilePath);
                }
                fileStream.Close();

                // watch.Stop();
                // Console.WriteLine($"Execution Time: {watch.ElapsedMilliseconds} ms");

                return Ok();
            }
        }

        private static void ExportFileZip(ZipArchive zipArchive, string zipFilePath, string filePath)
        {
            var entry = zipArchive.CreateEntry(zipFilePath, CompressionLevel.Fastest);
            using (var fileStream = new FileStream(filePath, FileMode.Open))
            {
                using (var entryStream = entry.Open())
                {
                    fileStream.CopyTo(entryStream);
                }
            }
        }

        private static void ExportStringZip(ZipArchive zipArchive, string zipFilePath, string fileContent)
        {
            var entry = zipArchive.CreateEntry(zipFilePath, CompressionLevel.Fastest);
            using (var entryStream = entry.Open())
            {
                using (var streamWriter = new StreamWriter(entryStream))
                {
                    streamWriter.Write(fileContent);
                }
            }
        }

        // PUT: api/Report/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReport([FromRoute] int id, [FromBody] Report report)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != report.ID)
            {
                return BadRequest();
            }

            _context.Entry(report).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReportExists(id))
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

        // POST: api/Report
        [HttpPost]
        public async Task<IActionResult> PostReport([FromBody] Report report)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetReport", new { id = report.ID }, report);
        }

        // DELETE: api/Report/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReport([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var report = await _context.Reports.SingleOrDefaultAsync(m => m.ID == id);
            if (report == null)
            {
                return NotFound();
            }

            string fileName = report.ID + "_report_archive.zip";
            string filePath = Path.Combine(_hostingEnvironment.WebRootPath, "images/" + report.ID);
            string archivePath = Path.Combine(_hostingEnvironment.WebRootPath, "images/archives/" + fileName);

            if (System.IO.Directory.Exists(filePath))
            {
                try
                {
                    System.IO.Directory.Delete(filePath, true);
                    Console.WriteLine("Successfully delete file directory");
                }
                catch (Exception e)
                {
                    Console.WriteLine("Error when remove directory" + e.Message);
                }
            }
            if (System.IO.File.Exists(archivePath))
            {
                try
                {
                    System.IO.File.Delete(archivePath);
                    Console.WriteLine("Successfully delete archive file");
                }
                catch (Exception e)
                {
                    Console.WriteLine("Error when delete archive file" + e.Message);
                }
            }

            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // POST: api/Report/5/images
        [HttpPost, DisableRequestSizeLimit, Route("{id}/images")]
        public async Task<IActionResult> PostImage([FromRoute] int id, IFormFile file)
        {
            var report = await _context.Reports
                .Include(r => r.ReportDescription)
                .SingleOrDefaultAsync(m => m.ID == id);

            // Check if the report exists
            if (report == null)
            {
                return NotFound("The report does not exist: id=" + id);
            }

            // Check file length and extension
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (file.Length <= 0 || !AllowedExtensions.Contains(fileExtension))
            {
                return BadRequest("The file is empty or is not an image");
            }

            var fileNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
            var fileName = string.Concat(fileNameWithoutExt, '_', Guid.NewGuid().ToString(), fileExtension);

            var rawImageDir = Path.Combine(_hostingEnvironment.WebRootPath, IMAGES_DIR, id.ToString(), RAW_IMAGES_DIR);
            var thumbnailImageDir = Path.Combine(_hostingEnvironment.WebRootPath, IMAGES_DIR, id.ToString(), THUMBNAIL_IMAGES_DIR);

            var absoluteRawFilePath = Path.Combine(rawImageDir, fileName);
            var absoluteThumbnailFilePath = Path.Combine(thumbnailImageDir, fileName);

            var relativeRawFilePath = Path.Combine(IMAGES_DIR, id.ToString(), RAW_IMAGES_DIR, fileName);
            var relativeThumbnailFilePath = Path.Combine(IMAGES_DIR, id.ToString(), THUMBNAIL_IMAGES_DIR, fileName);

            // Create the directories if they don't exist
            if (!System.IO.Directory.Exists(rawImageDir))
            {
                System.IO.Directory.CreateDirectory(rawImageDir);
            }
            if (!System.IO.Directory.Exists(thumbnailImageDir))
            {
                System.IO.Directory.CreateDirectory(thumbnailImageDir);
            }

            // Copy the raw image in the directory
            using (var stream = new FileStream(absoluteRawFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Extract metadata from the raw image
            var directories = ImageMetadataReader.ReadMetadata(file.OpenReadStream());
            var imageDate = ReadImageDate(directories, DateTime.Now);
            var imageLocation = ReadImageLocation(directories, new GeoLocation(0.0, 0.0));
            var imageExifOrientation = ReadExifOrientation(directories, 1); // Exif normal orientation (Horizontal) is 1

            // Generate a thumbnail, classify it and save it
            List<ClassificationResult> thumbnailClassificationResults;
            using (var rawImage = System.Drawing.Image.FromStream(file.OpenReadStream()))
            {
                const int thumbnailWidth = THUMBNAIL_TARGET_WIDTH;
                var thumbnailHeight = ImageUtils.ImageHeightKeepingRatio(rawImage.Width, rawImage.Height, thumbnailWidth);
                using (var thumbnail = ImageUtils.ResizeImage(rawImage, thumbnailWidth, thumbnailHeight))
                {
                    // Rotate the thumbnail according to the original image orientation
                    ImageUtils.RotateImage(thumbnail, imageExifOrientation);
                    // Save the rotated thumbnail, the raw image is not rotated. Simply its Exif contains the orientation information
                    ImageUtils.SaveImage(thumbnail, absoluteThumbnailFilePath);
                    // Determine the category of the thumbnail image
                    thumbnailClassificationResults = await PredictImage(thumbnail);

                    //Zhiwei: Predict result from the raw image
                    // thumbnailClassificationResults = await PredictRawImage(absoluteRawFilePath);
                }
            }

            // Create image
            var image = new Image
            {
                File = relativeRawFilePath,
                Thumbnail = relativeThumbnailFilePath,
                Date = imageDate,
                Latitude = imageLocation.Latitude,
                Longitude = imageLocation.Longitude,
                ReportId = id,
                Report = report
            };

            // Contain all image categories as returned by the classifier
            var allImageCategories = new List<ImageCategory>();
            // Contain the highest confidence of all categories from a category type
            // Thus, when adding a category, we can check if it's the one with the highest confidence for its group
            var highestConfidencePerCategoryType = new Dictionary<int, double>();
            // Transform the classification results in image categories
            foreach (var result in thumbnailClassificationResults)
            {
                // Find the category in the database
                var category = await _context.Categories.SingleOrDefaultAsync(c => c.ClassifierName == result.Category);

                if (category == null)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "Category does not exist: " + result.Category);
                }

                // Create the ImageCategory corresponding to this classification result
                allImageCategories.Add(new ImageCategory
                {
                    Category = category,
                    CategoryId = category.ID,
                    Confidence = result.Confidence
                });

                // Update the highest confidence per category type
                if (highestConfidencePerCategoryType.ContainsKey(category.CategoryTypeId))
                {
                    // If a category within the same category type group already exists, simply take the maximum
                    var currentValue = highestConfidencePerCategoryType[category.CategoryTypeId];
                    highestConfidencePerCategoryType[category.CategoryTypeId] = Math.Max(currentValue, result.Confidence);
                }
                else
                {
                    // No category with the same category type group already exists, simply take the maximum
                    highestConfidencePerCategoryType.Add(category.CategoryTypeId, result.Confidence);
                }
            }

            foreach (var imageCategory in allImageCategories)
            {
                var categoryType = imageCategory.Category.CategoryTypeId;

                // Make sure this image category is the one with the highest confidence in its group
                if (highestConfidencePerCategoryType.ContainsKey(categoryType))
                //&& Math.Abs(imageCategory.Confidence - highestConfidencePerCategoryType[categoryType]) < 1e-6)
                {
                    // Liaison between the two objects
                    image.ImageCategories.Add(imageCategory);
                    imageCategory.Image = image;
                    _context.ImageCategories.Add(imageCategory);
                }
            }

            _context.Images.Add(image);

            // Update report generation date
            report.Date = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                System.IO.File.Delete(absoluteRawFilePath);
                System.IO.File.Delete(absoluteThumbnailFilePath);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            return CreatedAtAction("GetImage", new { id = image.ID }, image);
        }

        private static int ReadExifOrientation(IReadOnlyList<Directory> directories, int defaultExifOrientation = 1)
        {
            var imageExifOrientation = defaultExifOrientation;

            // Find the so-called Exif "IFD0" directory, in which is the orientation information
            var ifd0Directory = directories.OfType<ExifIfd0Directory>().FirstOrDefault();
            if (ifd0Directory != null)
            {
                if (ifd0Directory.TryGetUInt16(ExifDirectoryBase.TagOrientation, out var orientation))
                {
                    imageExifOrientation = orientation;
                }
            }

            return imageExifOrientation;
        }

        private static GeoLocation ReadImageLocation(IReadOnlyList<Directory> directories, GeoLocation defaultImageLocation)
        {
            var imageLocation = defaultImageLocation;

            // Find the GPS Exif directory
            var gpsDirectory = directories.OfType<GpsDirectory>().FirstOrDefault();
            if (gpsDirectory?.GetGeoLocation() != null)
            {
                // Read image GPS location
                imageLocation = gpsDirectory.GetGeoLocation();
            }

            return imageLocation;
        }

        private static DateTime ReadImageDate(IReadOnlyList<Directory> directories, DateTime defaultImageDate)
        {
            var imageDate = defaultImageDate;

            // Find the so-called Exif "SubIFD"
            var subIfdDirectory = directories.OfType<ExifSubIfdDirectory>().FirstOrDefault();

            if (subIfdDirectory != null)
            {
                // Read image time taken if available
                if (subIfdDirectory.TryGetDateTime(ExifDirectoryBase.TagDateTimeOriginal, out var date))
                {
                    imageDate = date;
                }
            }

            return imageDate;
        }

        private bool ReportExists(int id)
        {
            return _context.Reports.Any(e => e.ID == id);
        }

        // Zhiwei: Predict raw image using image path
        private static async Task<List<ClassificationResult>> PredictRawImage(string imagePath)
        {
            var results = new List<ClassificationResult>();
            var fileStream = new FileStream(imagePath, FileMode.Open);
            var multiContent = new MultipartFormDataContent
            {
                { new StreamContent(fileStream), "file", "image.bmp" }
            };

            var response = await HttpClient.PostAsync(_configuration["ClassifierAPI"], multiContent);

            if (response.IsSuccessStatusCode)
            {
                // Extract the response in JSON
                var responseString = await response.Content.ReadAsStringAsync();

                dynamic responseJson = JsonConvert.DeserializeObject(responseString);

                if (responseJson.success.Value)
                {
                    foreach (var result in responseJson.results)
                    {
                        string label = result.label.Value;
                        double probability = result.probability.Value;
                        results.Add(new ClassificationResult(label, probability));
                    }
                }
            }
            return results;
        }

        private static async Task<List<ClassificationResult>> PredictImage(System.Drawing.Bitmap image)
        {
            var results = new List<ClassificationResult>();

            var bytes = ImageUtils.ConvertFile(image);

            var multiContent = new MultipartFormDataContent
            {
                { bytes, "file", "image.bmp" }
            };

            var response = await HttpClient.PostAsync(_configuration["ClassifierAPI"], multiContent);

            if (response.IsSuccessStatusCode)
            {
                // Extract the response in JSON
                var responseString = await response.Content.ReadAsStringAsync();

                dynamic responseJson = JsonConvert.DeserializeObject(responseString);

                if (responseJson.success.Value)
                {
                    foreach (var result in responseJson.results)
                    {
                        string label = result.label.Value;
                        double probability = result.probability.Value;
                        results.Add(new ClassificationResult(label, probability));
                    }
                }
            }

            return results;
        }
    }
}