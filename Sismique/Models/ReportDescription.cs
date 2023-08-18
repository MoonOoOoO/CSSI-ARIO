using System.ComponentModel.DataAnnotations.Schema;

namespace ARIO.Models
{
    public class ReportDescription
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string ReportDetail { get; set; }
        public string Hazard { get; set; }
        public string Magnitude { get; set; }
        public string Year { get; set; }
        public string Location { get; set; }
        public string Source { get; set; }
        public string Collector { get; set; }
        public string buildingStories { get; set; }
        public string tagging { get; set; }
        public Report Report { get; set; }
    }
}