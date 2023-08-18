using ARIO.Models;
using MetadataExtractor;
using System;

namespace ARIO.DTO
{
    public class ListReport
    {
        public int ID { get; set; }

        public string Name { get; set; }

        public DateTime Date { get; set; }

        public int NumberImages { get; set; }

        public string Thumbnail { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }
        public bool Shared { get; set; }
        public static ListReport FromReport(Report report, int numberImages, Image thumbnailImage, GeoLocation location)
        {
            return new ListReport
            {
                ID = report.ID,
                Name = report.Name,
                Date = report.Date,
                Shared = report.Shared,
                NumberImages = numberImages,
                Thumbnail = thumbnailImage?.Thumbnail,
                Latitude = location.Latitude,
                Longitude = location.Longitude
            };
        }

        public bool HasGpsCoordinates()
        {
            return Latitude != 0 && Longitude != 0;
        }
    }
}
