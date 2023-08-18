using ARIO.Models;
using System.Linq;

namespace ARIO.Data
{
    public class DbInitializer
    {
        public static void Initialize(SismiqueContext context)
        {
            context.Database.EnsureCreated();

            // Look for any entities
            if (context.Reports.Any() || context.Images.Any()
                || context.CategoryTypes.Any() || context.Categories.Any()
                || context.ImageCategories.Any() || context.ReportCollections.Any()
                || context.ReportDescriptions.Any() || context.Users.Any())
            {
                return;   // DB has been seeded
            }

            // CategoryTypes
            var categoryTypes = new CategoryType[]
            {
                new CategoryType{Name = "Image Location", Order = 10},
                new CategoryType{Name = "Overview Image", Order = 20},
                new CategoryType{Name = "Building Overall Damage Level", Order = 30},
                new CategoryType{Name = "Building Component Damage Level", Order = 40},
                new CategoryType{Name = "Building Component Type", Order = 50},
                new CategoryType{Name = "Metadata", Order = 60},
                new CategoryType{Name = "Miscellaneous", Order = 70}
            };

            // Categories
            var categories = new Category[]
            {
                // Image Location
                new Category{ClassifierName="LOCEX", Name="Building exterior", Order=10, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[0]},
                new Category{ClassifierName="LOCIN", Name="Building interior", Order=10, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[0]},

                // Overview Image
                new Category{ClassifierName="OVCAN", Name="Canonical view", Order=20, OverviewCategory=true, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[1]},
                new Category{ClassifierName="OVFRT", Name="Front view", Order=20, OverviewCategory=true, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[1]},

                // Building Overview Damage Level
                new Category{ClassifierName="ODM", Name="Overall moderate damage", Order=30, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[2]},
                new Category{ClassifierName="ODS", Name="Overall severe damage", Order=30, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[2]},
                //new Category{ClassifierName="OD0", Name="Overall Damage 0", Order=50, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[2]},
                //new Category{ClassifierName="OD1", Name="Overall Damage 1", Order=60, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[2]},
                //new Category{ClassifierName="OD2", Name="Overall Damage 2", Order=70, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[2]},

                // Building Component Damage Level
                new Category{ClassifierName="CD0", Name="Component damage 0", Order=40, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[3]},
                new Category{ClassifierName="CD1", Name="Component damage 1", Order=40, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[3]},
                new Category{ClassifierName="CDR", Name="Concrete damage", Order=40, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[3]},
                new Category{ClassifierName="CDM", Name="Masonry damage", Order=40, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[3]},
                //new Category{ClassifierName="CD", Name="Component damage", Order=80, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[3]},
                //new Category{ClassifierName="CDR2", Name="Concrete damage 2", Order=90, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[3]},
                //new Category{ClassifierName="CDR3", Name="Concrete damage 3", Order=100, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[3]},
                //new Category{ClassifierName="CDM", Name="Masonry damage", Order=110, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[3]},
                
                // Building Component Type
                new Category{ClassifierName="CPCOL", Name="Column", Order=50, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[4]},
                //new Category{ClassifierName="CPBEAM", Name="Beam", Order=130, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[4]},
                new Category{ClassifierName="CPWAL", Name="Wall", Order=50, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[4]},
                
                // Metadata
                new Category{ClassifierName="GPS", Name="GPS", Order=60, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[5]},
                new Category{ClassifierName="DWG", Name="Drawing", Order=60, OverviewCategory=false, DrawingCategory=true, Visible=true, CategoryType = categoryTypes[5]},
                new Category{ClassifierName="WAT", Name="Watch", Order=60, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[5]},
                new Category{ClassifierName="SGN", Name="Sign", Order=60, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[5]},
                new Category{ClassifierName="MEAS", Name="Measurement", Order=60, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[5]},

                // Miscellaneous
                new Category{ClassifierName="NON", Name="Non-building components", Order=70, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[6]},
                new Category{ClassifierName="IRR", Name="Irrelevant images", Order=70, OverviewCategory=false, DrawingCategory=false, Visible=true, CategoryType = categoryTypes[6]},
            };

            // bridge functionality =========================================================
            //var bridgeCategories = new BridgeCategory[]
            //{
            //    new BridgeCategory{ClassifierName="OVW", Name="Bridge Overview", Level=1},
            //    new BridgeCategory{ClassifierName="DECK", Name="Deck", Level=1},
            //    new BridgeCategory{ClassifierName="SUPS", Name="Superstructure", Level=1},
            //    new BridgeCategory{ClassifierName="SUBS", Name="Substructure", Level=1},
            //    new BridgeCategory{ClassifierName="RAIL", Name="Railing", Level=1},
            //    new BridgeCategory{ClassifierName="DETAIL", Name="Detail", Level=1},
            //    new BridgeCategory{ClassifierName="OTH", Name="Other", Level=1},
            //    new BridgeCategory{ClassifierName="DOV", Name="Deck Overview", Level=2},
            //    new BridgeCategory{ClassifierName="JOINTS", Name="Joints", Level=2},
            //    new BridgeCategory{ClassifierName="DPA", Name="Deck Part", Level=2},
            //    new BridgeCategory{ClassifierName="SOVW", Name="Overview", Level=2},
            //    new BridgeCategory{ClassifierName="PART", Name="Part", Level=2},
            //    new BridgeCategory{ClassifierName="BEAR", Name="Bearing", Level=2},
            //    new BridgeCategory{ClassifierName="POV", Name="Pier Overview", Level=2},
            //    new BridgeCategory{ClassifierName="PPA", Name="Pier Part", Level=2},
            //    new BridgeCategory{ClassifierName="AOV", Name="Abutment Overview", Level=2},
            //    new BridgeCategory{ClassifierName="APA", Name="Abutment Part", Level=2}
            //};
            // bridge functionality =========================================================

            foreach (var c in categories)
            {
                c.CategoryType.Categories.Add(c);
                context.Categories.Add(c);
            }

            foreach (var ct in categoryTypes)
            {
                context.CategoryTypes.Add(ct);
            }

            // uncomment for using bridge function
            //foreach (var bc in bridgeCategories)
            //{
            //    context.BridgeCategories.Add(bc);
            //}
            context.SaveChanges();
        }
    }
}
