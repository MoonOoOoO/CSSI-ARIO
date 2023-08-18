using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net.Http;

namespace ARIO.Utils
{
    public class ImageUtils
    {
        public static int ImageHeightKeepingRatio(int width, int height, int targetWidth)
        {
            return targetWidth * height / width;
        }

        public static int ImageWidthKeepingRatio(int width, int height, int targetHeight)
        {
            return targetHeight * width / height;
        }

        public static Bitmap ResizeImage(Image image, int width, int height)
        {
            var destRect = new Rectangle(0, 0, width, height);
            var destImage = new Bitmap(width, height);

            // Default resolutions
            var newHorizontalResolution = 96.0f;
            var newVerticalResolution = 96.0f;

            // If resolution is set in the image file
            if (image.HorizontalResolution > 0 && image.VerticalResolution > 0)
            {
                // Assign the same resolution as the image
                newHorizontalResolution = image.HorizontalResolution;
                newVerticalResolution = image.VerticalResolution;
            }

            destImage.SetResolution(newHorizontalResolution, newVerticalResolution);

            using (var graphics = Graphics.FromImage(destImage))
            {
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.CompositingQuality = CompositingQuality.HighQuality;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.SmoothingMode = SmoothingMode.HighQuality;
                graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

                using (var wrapMode = new ImageAttributes())
                {
                    wrapMode.SetWrapMode(WrapMode.TileFlipXY);
                    graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
                }
            }

            return destImage;
        }

        public static void RotateImage(Image image, int orientation)
        {
            var transformType = RotateFlipType.RotateNoneFlipNone;

            // Rotation
            if (orientation == 3 || orientation == 4)
            {
                transformType = RotateFlipType.Rotate180FlipNone;
            }
            else if (orientation == 5 || orientation == 6)
            {
                transformType = RotateFlipType.Rotate90FlipNone;
            }
            else if (orientation == 7 || orientation == 8)
            {
                transformType = RotateFlipType.Rotate270FlipNone;
            }

            // Flip
            if (orientation == 2 || orientation == 4 || orientation == 5 || orientation == 7)
            {
                transformType = transformType | RotateFlipType.RotateNoneFlipX;
            }

            // Transform the image
            if (transformType != RotateFlipType.RotateNoneFlipNone)
            {
                image.RotateFlip(transformType);
            }
        }

        public static void SaveImage(Bitmap image, string outputPath)
        {
            using (var output = File.Open(outputPath, FileMode.Create))
            {
                // Encode in JPEG with quality 90%
                var encoderParameters = new EncoderParameters(1)
                {
                    Param = { [0] = new EncoderParameter(Encoder.Quality, 90L) }
                };

                var codec = ImageCodecInfo.GetImageDecoders().FirstOrDefault(c => c.FormatID == ImageFormat.Jpeg.Guid);
                image.Save(output, codec, encoderParameters);
            }
        }

        public static ByteArrayContent ConvertFile(Bitmap file)
        {
            using (var ms = new MemoryStream())
            {
                file.Save(ms, ImageFormat.Bmp);
                return new ByteArrayContent(ms.ToArray());
            }
        }
    }
}
