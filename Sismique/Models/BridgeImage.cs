using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ARIO.Models
{
    public class BridgeImage
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        [Required]
        public string File { get; set; }
        [Required]
        public DateTime Date { get; set; }
        public ICollection<BridgeImageCategory> BridgeImageCategories { get; } = new List<BridgeImageCategory>();
    }
}
