using System.ComponentModel.DataAnnotations;

namespace ARIO.Models
{
    public class ImageCategory
    {
        public int ImageId { get; set; }
        public Image Image { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        [Required] public double Confidence { get; set; }
    }
}