using System.ComponentModel.DataAnnotations;

namespace ARIO.Models
{
    public class BridgeImageCategory
    {
        public int ImageId { get; set; }
        public BridgeImage Image { get; set; }
        public int CategoryId { get; set; }
        public BridgeCategory Category { get; set; }
        [Required] public double Confidence { get; set; }
    }
}
