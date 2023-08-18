using ARIO.Models;
using System;
using System.Collections.Generic;

namespace ARIO.DTO
{
    public class ImagePaginatedList
    {
        public List<Image> Images { get; private set; }
        public int PageIndex { get; private set; }
        public int TotalPages { get; private set; }

        public ImagePaginatedList(List<Image> images, int count, int pageIndex, int pageSize)
        {
            Images = images;
            PageIndex = pageIndex;
            TotalPages = (int)Math.Ceiling((double)count / pageSize);
        }
    }
}
