using MetadataExtractor;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ARIO.Models
{
    public class Image
    {
        public int ID { get; set; }

        [Required] public string File { get; set; }

        [Required] public string Thumbnail { get; set; }

        [Required] public DateTime Date { get; set; }

        [Required] public double Latitude { get; set; }

        [Required] public double Longitude { get; set; }

        public int ReportId { get; set; }

        public Report Report { get; set; }

        public ICollection<ImageCategory> ImageCategories { get; } = new List<ImageCategory>();

        public bool HasGpsCoordinates()
        {
            return Latitude != 0 && Longitude != 0;
        }

        public GeoLocation GetGeoLocation()
        {
            return new GeoLocation(Latitude, Longitude);
        }
    }
}