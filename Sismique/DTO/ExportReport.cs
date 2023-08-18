using ARIO.Models;
using ARIO.Utils;
using MetadataExtractor;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace ARIO.DTO
{
    public class ExportReport
    {
        public ExportReport(IEnumerable<Category> categories, Report report)
        {
            Categories = categories;
            Report = report;

            Location = GPSUtils.ComputeGPSMedoid(report.Images.ToList());
        }

        public IEnumerable<Category> Categories { get; set; }

        public Report Report { get; set; }

        public GeoLocation Location { get; set; }

        public bool HasGPSCoordinates()
        {
            return !Location.IsZero;
        }

        public string GPSString()
        {
            return Location.Latitude.ToString("G9", CultureInfo.InvariantCulture) + ',' + Location.Longitude.ToString("G9", CultureInfo.InvariantCulture);
        }

        /// <summary>
        /// Returns true if the image is of a specific category.
        /// </summary>
        /// <param name="image">The image</param>
        /// <param name="categoryId">Category ID</param>
        /// <returns>True if the image is of the category, false otherwise</returns>
        public bool ImageHasCategory(Image image, int categoryId)
        {
            return image.ImageCategories.Any(ic => ic.CategoryId == categoryId);
        }
    }
}
