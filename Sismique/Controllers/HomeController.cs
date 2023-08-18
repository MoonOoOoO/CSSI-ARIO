using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;



namespace ARIO.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }

        //// GET: api/Report/5/archive
        //[HttpGet("{id}/archive")]
        //public FileStreamResult DownloadSample([FromRoute] int id)
        //{
        //    var filePath = MapPath("");
        //    return File(new FileStream("/home/test.zip", FileMode.Open), "application/zip");
        //}
    }
}
