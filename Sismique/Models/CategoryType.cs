using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ARIO.Models
{
    public class CategoryType
    {
        public int ID { get; set; }

        [Required] public string Name { get; set; }

        [Required] public int Order { get; set; }

        public ICollection<Category> Categories { get; set; } = new List<Category>();
    }
}