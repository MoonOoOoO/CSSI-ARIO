using ARIO.Models;
using Microsoft.EntityFrameworkCore;

namespace ARIO.Data
{
    public class SismiqueContext : DbContext
    {
        public SismiqueContext(DbContextOptions<SismiqueContext> options) : base(options)
        {
        }

        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportDescription> ReportDescriptions { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<CategoryType> CategoryTypes { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ImageCategory> ImageCategories { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ReportCollection> ReportCollections { get; set; }
        // bridge (extra) ====================================================
        //public DbSet<BridgeImage> BridgeImage { get; set; }
        //public DbSet<BridgeCategory> BridgeCategories { get; set; }
        //public DbSet<BridgeImageCategory> BridgeImageCategories { get; set; }
        // bridge (extra) ====================================================

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Report>().ToTable("Report");
            modelBuilder.Entity<ReportDescription>().ToTable("ReportDescription");
            modelBuilder.Entity<Image>().ToTable("Image");
            modelBuilder.Entity<CategoryType>().ToTable("CategoryType");
            modelBuilder.Entity<Category>().ToTable("Category");
            modelBuilder.Entity<ImageCategory>().ToTable("ImageCategory");
            modelBuilder.Entity<User>().ToTable("User");
            modelBuilder.Entity<ReportCollection>().ToTable("ReportCollection");

            // bridge (extra) ====================================================
            //modelBuilder.Entity<BridgeImage>().ToTable("BridgeImage");
            //modelBuilder.Entity<BridgeCategory>().ToTable("BridgeCategory");
            //modelBuilder.Entity<BridgeImageCategory>().ToTable("BridgeImageCategory");
            // bridge (extra) ====================================================

            // One Report Many Images
            // Restrict delete if a report has at least one image
            //modelBuilder.Entity<Report>()
            //    .HasMany(b => b.Images)
            //    .WithOne(i => i.Report)
            //    .HasForeignKey(i => i.ReportId)
            //    .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Image>()
                .HasOne(i => i.Report)
                .WithMany(r => r.Images)
                .HasForeignKey(i => i.ReportId)
                .OnDelete(DeleteBehavior.Cascade);

            // Index image date
            modelBuilder.Entity<Image>()
                .HasIndex(i => i.Date);

            // One CategoryType Many Categories
            // Restrict delete if a CategoryType has at least one category
            modelBuilder.Entity<CategoryType>()
                .HasMany(ct => ct.Categories)
                .WithOne(c => c.CategoryType)
                .HasForeignKey(c => c.CategoryTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Many Images Many Categories with confidence
            // Restrict delete if a category has at least one ImageCategory
            modelBuilder.Entity<ImageCategory>()
                .HasOne(ic => ic.Image)
                .WithMany(i => i.ImageCategories)
                .HasForeignKey(ic => ic.ImageId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ImageCategory>()
                .HasOne(ic => ic.Category)
                .WithMany(c => c.ImageCategories)
                .HasForeignKey(ic => ic.CategoryId);

            modelBuilder.Entity<ImageCategory>()
                .HasKey(i => new { i.ImageId, i.CategoryId });

            //bridge images (extra) ===========================================
            //modelBuilder.Entity<BridgeImageCategory>()
            //    .HasOne(ic => ic.Image)
            //    .WithMany(i => i.BridgeImageCategories)
            //    .HasForeignKey(ic => ic.ImageId);

            //modelBuilder.Entity<BridgeImageCategory>()
            //    .HasKey(i => new { i.ImageId, i.CategoryId });
            // ================================================================

            modelBuilder.Entity<ReportCollection>()
                .HasOne(rc => rc.Report)
                .WithMany(s => s.ReportCollections)
                .HasForeignKey(rc => rc.ReportID)
                .OnDelete(DeleteBehavior.ClientSetNull);

            modelBuilder.Entity<ReportCollection>()
                .HasOne(rc => rc.User)
                .WithMany(s => s.ReportCollections)
                .HasForeignKey(rc => rc.UserID)
                .OnDelete(DeleteBehavior.ClientSetNull);

            modelBuilder.Entity<ReportCollection>()
                .HasKey(rc => new { rc.ReportID, rc.UserID });

            modelBuilder.Entity<Report>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reports)
                .HasForeignKey(r => r.UserId);

            //modelBuilder.Entity<Report>()
            //    .HasOne(r => r.ReportDescription)
            //    .WithOne(i => i.Report)
            //    .HasForeignKey<Report>(r => r.ReportDescriptionId)
            //    .OnDelete(DeleteBehavior.Cascade);

            // Index report date
            modelBuilder.Entity<Report>()
                .HasIndex(r => r.Date);
        }
    }
}