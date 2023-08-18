import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import "rxjs/add/operator/switchMap";
import { Category } from "../shared/category";
import { CategoryType } from "../shared/categorytype";
import { ImageCategory } from "../shared/imagecategory";
import { Image } from "../shared/image";
import { Report } from "../shared/report";
import { ImageService } from "../shared/image.service";

@Component({
    selector: "app-confirm",
    templateUrl: "./confirm.component.html",
    styleUrls: ["./confirm.component.css"],
})
/** confirm component*/
export class ConfirmComponent implements OnInit {
    report: Report;
    categories: Category[] = [];
    categoryTypes: CategoryType[];
    display_categories: any[];
    /*
     display_categories = [{
        imageId: Number, 
        categories: [{categoryId: Number, confidence: Number}]
        }]
     */

    minimumImageDate: Date | null;
    maximumImageDate: Date | null;

    /** confirm ctor */
    constructor(private readonly imageService: ImageService, private readonly route: ActivatedRoute, private router: Router) {
        this.minimumImageDate = null;
        this.maximumImageDate = null;
        this.categories = [];
        this.categoryTypes = [];
        this.display_categories = [];
    }

    ngOnInit(): void {
        this.report = this.route.snapshot.data.report as Report;
        this.categories = this.route.snapshot.data.categories as Category[];
        this.categoryTypes = this.route.snapshot.data.categoryTypes as CategoryType[];

        // Update images in categories
        for (let image of this.report.images) {
            this.AddImageToCategory(image);
            this.UpdateMinMaxImageDates(image);
        }

        // Sort all images by date
        this.SortAllImages();
        this.generateDisplayLabels();
    }

    // update labels
    async updateLabels() {
        let modified_category: { image_id: number; categories_organized: { order: number; categories: any }[] }[] = [];
        let prev_category = [];
        for (let img of this.report.images) {
            var temp_categories = [
                { order: 10, categories: <any>[] },
                { order: 20, categories: <any>[] },
                { order: 30, categories: <any>[] },
                { order: 40, categories: <any>[] },
                { order: 50, categories: <any>[] },
                { order: 60, categories: <any>[] },
                { order: 70, categories: <any>[] },
            ];
            var prev_categories = [
                { order: 10, categories: <any>[] },
                { order: 20, categories: <any>[] },
                { order: 30, categories: <any>[] },
                { order: 40, categories: <any>[] },
                { order: 50, categories: <any>[] },
                { order: 60, categories: <any>[] },
                { order: 70, categories: <any>[] },
            ];
            var image_labels = document.getElementById(String(img.id));
            if (image_labels) {
                var list = image_labels.getElementsByTagName("select");
                if (list) {
                    for (let i = 0; i < list.length; i++) {
                        var temp_cat_id = parseInt(list[i].value);
                        var temp_cat_con = 999;
                        var temp_cat_order = this.getCategoryOrder(temp_cat_id);
                        for (let ic of img.imageCategories) {
                            if (temp_cat_id == ic.categoryId) {
                                temp_cat_con = ic.confidence;
                            }
                        }
                        for (let i = 0; i < temp_categories.length; i++) {
                            if (temp_categories[i]["order"] == temp_cat_order) {
                                temp_categories[i]["categories"].push({ categoryId: temp_cat_id, confidence: temp_cat_con });
                            }
                        }
                    }
                }
            }
            for (let ic of img.imageCategories) {
                for (let i = 0; i < prev_categories.length; i++) {
                    if (prev_categories[i]["order"] == ic.category.order) {
                        prev_categories[i]["categories"].push({ categoryId: ic.categoryId, confidence: ic.confidence });
                    }
                }
            }
            modified_category.push({ image_id: img.id, categories_organized: temp_categories });
            prev_category.push({ image_id: img.id, categories_organized: prev_categories });
        }

        for (let pc of prev_category) {
            for (let pc_cat_org of pc.categories_organized) {
                for (let pc_cat of pc_cat_org.categories) {
                    if (pc_cat["confidence"] == 999) {
                        // remove the previous added user label
                        await this.imageService.deleteCategory(pc.image_id, pc_cat["categoryId"]);
                    }
                }
            }
            for (let mc of modified_category) {
                if (mc.image_id == pc.image_id) {
                    for (let mc_cat_org of mc.categories_organized) {
                        for (let mc_cat of mc_cat_org.categories) {
                            // add the new category into database
                            if (mc_cat["confidence"] == 999) {
                                await this.imageService.addCategory(mc.image_id, mc_cat["categoryId"], mc_cat["confidence"]);
                            }
                        }
                    }
                }
            }
        }

        this.router.navigateByUrl("/report" + "/" + this.report.id);
    }

    resetLabels(): void {
        let prev_category = [];
        for (let img of this.report.images) {
            var prev_categories = [
                { order: 10, categories: <any>[] },
                { order: 20, categories: <any>[] },
                { order: 30, categories: <any>[] },
                { order: 40, categories: <any>[] },
                { order: 50, categories: <any>[] },
                { order: 60, categories: <any>[] },
                { order: 70, categories: <any>[] },
            ];
            for (let ic of img.imageCategories) {
                for (let i = 0; i < prev_categories.length; i++) {
                    if (prev_categories[i]["order"] == ic.category.order) {
                        prev_categories[i]["categories"].push({ categoryId: ic.categoryId, confidence: ic.confidence });
                    }
                }
            }
            prev_category.push({ image_id: img.id, categories_organized: prev_categories });
        }
        for (let pc of prev_category) {
            for (let pc_cat_org of pc.categories_organized) {
                for (let pc_cat of pc_cat_org.categories) {
                    if (pc_cat["confidence"] == 999) {
                        // remove the previous added user label
                        this.imageService.deleteCategory(pc.image_id, pc_cat["categoryId"]);
                    }
                }
            }
        }
        this.router.navigate(["/report/", this.report.id]);
    }

    // generate display labels
    private generateDisplayLabels(): void {
        let report_ic = [];
        // group the categories by their orders
        for (let img of this.report.images) {
            let cat_organized = [
                { order: 10, categories: <any>[] },
                { order: 20, categories: <any>[] },
                { order: 30, categories: <any>[] },
                { order: 40, categories: <any>[] },
                { order: 50, categories: <any>[] },
                { order: 60, categories: <any>[] },
                { order: 70, categories: <any>[] },
            ];
            for (let ic of img.imageCategories) {
                for (let i = 0; i < cat_organized.length; i++) {
                    if (cat_organized[i]["order"] == ic.category.order) {
                        cat_organized[i]["categories"].push({ categoryId: ic.categoryId, confidence: ic.confidence });
                    }
                }
            }
            report_ic.push({ imageId: img.id, categories_organized: cat_organized });
        }

        // loop all the images
        for (let i = 0; i < report_ic.length; i++) {
            let temp_display_cat = [];
            // loop all category groups of one images
            for (let j = 0; j < report_ic[i]["categories_organized"].length; j++) {
                // loop all the categories with the same order number
                let contain_user_defined = false;
                for (let k = 0; k < report_ic[i]["categories_organized"][j]["categories"].length; k++) {
                    let temp = report_ic[i]["categories_organized"][j]["categories"][k];
                    if (temp["confidence"] == 999) {
                        contain_user_defined = true;
                        temp_display_cat.push(temp);
                    }
                }
                if (!contain_user_defined) {
                    for (let k = 0; k < report_ic[i]["categories_organized"][j]["categories"].length; k++) {
                        temp_display_cat.push(report_ic[i]["categories_organized"][j]["categories"][k]);
                    }
                }
            }
            this.display_categories.push({ imageId: report_ic[i]["imageId"], categories: temp_display_cat });
        }
    }

    private getCategoryOrder(id: number): number {
        let order = -1;
        for (let c of this.categories) {
            if (id == c.id) {
                order = c.order;
            }
        }
        return order;
    }

    // Update minimumImageDate and maximumImageDate
    private UpdateMinMaxImageDates(image: Image): void {
        if (image.date !== null) {
            if (this.maximumImageDate === null || image.date.getTime() > this.maximumImageDate.getTime()) {
                this.maximumImageDate = image.date;
            }

            if (this.minimumImageDate === null || image.date.getTime() < this.minimumImageDate.getTime()) {
                this.minimumImageDate = image.date;
            }
        }
    }

    // Return the duration (ms) between minimum and maximum date of the images
    getDuration(): number {
        let duration = 0;

        if (this.minimumImageDate !== null && this.maximumImageDate !== null) {
            duration = this.maximumImageDate.getTime() - this.minimumImageDate.getTime();
        }
        return duration;
    }

    // Return true if the report contains at least one drawing image
    hasDrawingImages(): boolean {
        for (let image of this.report.images) {
            for (let imageCategory of image.imageCategories) {
                if (imageCategory.category !== null && imageCategory.category.drawingCategory) {
                    return true;
                }
            }
        }
        return false;
    }

    // Return true if the report contains at least one Gps image
    hasGpsImages(): boolean {
        for (let image of this.report.images) {
            if (image.hasGpsCoordinates()) {
                return true;
            }
        }
        return false;
    }

    // determine whether the category is generated or user-defined
    isGenerated(imageid: number, cid: number): boolean {
        let generated = false;
        for (let image of this.report.images) {
            if (imageid == image.id) {
                for (let ic of image.imageCategories) {
                    if (cid == ic.categoryId) {
                        if (ic.confidence == 999) {
                            generated = false;
                        } else {
                            generated = true;
                        }
                    }
                }
            }
        }
        return generated;
    }

    // Add an image to its category in the array this.category
    private AddImageToCategory(image: Image): void {
        for (let ic of image.imageCategories) {
            const category = this.categories.find((c) => c.id === ic.categoryId);

            if (category !== undefined && category !== null) {
                // If images is not initialized
                if (category.imageCategories == null) {
                    category.imageCategories = [];
                }
                category.imageCategories.push(ic);
                ic.category = category;
                ic.image = image;
            }
        }
    }

    // Sort all images in the report
    private SortAllImages(): void {
        this.SortImagesByDate(this.report.images);

        for (let category of this.categories) {
            if (category.imageCategories !== null) {
                this.SortImageCategoriesByDate(category.imageCategories);
            }
        }
    }

    // Sort an array of images by date
    private SortImagesByDate(images: Image[]): void {
        images.sort((lhs, rhs) => {
            if (lhs.date.getTime() > rhs.date.getTime()) return -1;
            if (lhs.date.getTime() < rhs.date.getTime()) return 1;
            return 0;
        });
    }

    // Sort an array of imageCategories by date
    private SortImageCategoriesByDate(imageCategories: ImageCategory[]): void {
        imageCategories.sort((lhs, rhs) => {
            if (lhs.image.date.getTime() > rhs.image.date.getTime()) return -1;
            if (lhs.image.date.getTime() < rhs.image.date.getTime()) return 1;
            return 0;
        });
    }
}
