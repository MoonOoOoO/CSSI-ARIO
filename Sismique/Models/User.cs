using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ARIO.Models
{
    public class User
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        [Required] public string Username { get; set; }
        [Required] public string Password { get; set; }
        [Required] public string Firstname { get; set; }
        public string Middlename { get; set; }
        [Required] public string Lastname { get; set; }
        [Required] public string Institution { get; set; }
        [Required] public DateTime Lastlogin { get; set; }
        public ICollection<Report> Reports { get; } = new List<Report>();
        public ICollection<ReportCollection> ReportCollections { get; } = new List<ReportCollection>();
    }
}
