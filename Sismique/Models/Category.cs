using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ARIO.Models
{
    public class Category
    {
        public int ID { get; set; }

        // Name as reported by the classifier
        [Required] public string ClassifierName { get; set; }

        [Required] public string Name { get; set; }

        [Required] public int Order { get; set; }

        [Required] public bool OverviewCategory { get; set; }

        [Required] public bool DrawingCategory { get; set; }

        [Required] public bool Visible { get; set; }

        public int CategoryTypeId { get; set; }

        public CategoryType CategoryType { get; set; }

        public ICollection<ImageCategory> ImageCategories { get; } = new List<ImageCategory>();
    }
}