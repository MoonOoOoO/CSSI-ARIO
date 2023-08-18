using System;
using System.Collections.Generic;

namespace ARIO.DTO
{
    public class ReportPaginatedList
    {
        public List<ListReport> Reports { get; private set; }
        public int PageIndex { get; private set; }
        public int TotalPages { get; private set; }

        public ReportPaginatedList(List<ListReport> reports, int count, int pageIndex, int pageSize)
        {
            Reports = reports;
            PageIndex = pageIndex;
            TotalPages = (int)Math.Ceiling((double)count / pageSize);
        }
    }
}
