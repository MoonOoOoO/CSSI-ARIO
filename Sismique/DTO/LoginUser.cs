using ARIO.Models;
using System;
using System.Collections.Generic;

namespace ARIO.DTO
{
    public class LoginUser
    {
        public int ID { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Firstname { get; set; }
        public string Middlename { get; set; }
        public string Lastname { get; set; }
        public string Institution { get; set; }
        public DateTime Lastlogin { get; set; }
        public List<ListReport> Reports { get; private set; }
        public ICollection<ReportCollection> ReportCollections { get; private set; }
        public LoginUser(int iD, string username, string password, string firstname, string middlename, string lastname, string institution, DateTime lastlogin, List<ListReport> reports, ICollection<ReportCollection> reportCollections)
        {
            ID = iD;
            Username = username;
            Password = password;
            Firstname = firstname;
            Middlename = middlename;
            Lastname = lastname;
            Institution = institution;
            Lastlogin = lastlogin;
            Reports = reports;
            ReportCollections = reportCollections;
        }
    }
}
