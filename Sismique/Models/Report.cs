using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ARIO.Models
{
    public class Report
    {
        public int ID { get; set; }

        [Required] public string Name { get; set; }

        [Required] public DateTime Date { get; set; }
        [Required] public bool Shared { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int ReportDescriptionId { get; set; }
        public ReportDescription ReportDescription { get; set; }
        public ICollection<Image> Images { get; } = new List<Image>();
        public ICollection<ReportCollection> ReportCollections { get; } = new List<ReportCollection>();
    }
}