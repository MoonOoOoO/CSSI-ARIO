using System.ComponentModel.DataAnnotations.Schema;

namespace ARIO.Models
{
    public class ReportCollection
    {
        public int ReportID { get; set; }
        public Report Report { get; set; }
        public int UserID { get; set; }
        public User User { get; set; }
    }
}