using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ARIO.Models
{
    public class BridgeCategory
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        [Required] public string ClassifierName { get; set; }
        [Required] public string Name { get; set; }
        [Required] public int Level { get; set; }
    }
}
