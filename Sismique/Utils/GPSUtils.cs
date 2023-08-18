using ARIO.Models;
using MetadataExtractor;
using System;
using System.Collections.Generic;

namespace ARIO.Utils
{
    public class GPSUtils
    {
        private static double DegreeToRadian(double angle)
        {
            return Math.PI * angle / 180.0;
        }

        public static double Distance(double latA, double lngA, double latB, double lngB)
        {
            // Equirectangular approximation
            const double R = 6371000;
            var x = (DegreeToRadian(lngB) - DegreeToRadian(lngA)) * Math.Cos((DegreeToRadian(latA) + DegreeToRadian(latB)) / 2.0);
            var y = DegreeToRadian(latB) - DegreeToRadian(latA);
            return Math.Sqrt(x * x + y * y) * R;
        }

        public static GeoLocation ComputeGPSMedoid(IList<Image> images)
        {
            // Medoid of all GPS coordinates
            var medoid = new GeoLocation(0.0, 0.0);
            var distMedoid = double.MaxValue;

            // Array of total distance for each possible medoid.
            var dist = new double[images.Count];
            for (var i = 0; i < images.Count; i++)
            {
                if (images[i].HasGpsCoordinates())
                {
                    // If the image has GPS coordinates, dist = 0
                    dist[i] = 0.0;
                }
                else
                {
                    // Otherwise, dist = MaxValue
                    dist[i] = double.MaxValue;
                }
            }

            // Compute all distances between GPS coordinates
            for (var i = 0; i < images.Count; i++)
            {
                if (images[i].HasGpsCoordinates())
                {
                    for (var j = i + 1; j < images.Count; j++)
                    {
                        if (images[j].HasGpsCoordinates())
                        {
                            var d = Distance(images[i].Latitude, images[i].Longitude, images[j].Latitude, images[j].Longitude);

                            // Update distance for both images.
                            dist[i] += d;
                            dist[j] += d;
                        }
                    }
                }
            }

            // Find the medoid
            for (var i = 0; i < images.Count; i++)
            {
                if (dist[i] < distMedoid)
                {
                    distMedoid = dist[i];
                    medoid = new GeoLocation(images[i].Latitude, images[i].Longitude);
                }
            }

            return medoid;
        }
    }
}
