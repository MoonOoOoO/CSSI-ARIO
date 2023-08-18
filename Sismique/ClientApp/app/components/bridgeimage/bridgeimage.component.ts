import { Component, OnInit } from "@angular/core";
import { BridgeImageService } from "../shared/bridgeimage.service";
import { BridgeImage, IBridgeImageProperties } from "../shared/bridgeimage";
import { Observable } from "rxjs";
import { HttpEventType } from "@angular/common/http";
import { forkJoin } from "rxjs/observable/forkJoin";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: "app-bridgeimage",
    templateUrl: "./bridgeimage.component.html",
    styleUrls: ["./bridgeimage.component.css"],
})
/** bridgeimage component*/
export class BridgeImageComponent implements OnInit {
    files: File[] = [];

    selectedYear: number;
    listOfYears: number[] = [];

    // progress
    total_size: number = 0;
    file_progress: number[] = [];
    progress: number = 0;

    overviewImages: BridgeImage[] = [];
    bridgeImages: BridgeImage[] = [];

    /** bridgeimage ctor */
    constructor(private sanitizer: DomSanitizer, private bridgeImageService: BridgeImageService) {}

    ngOnInit() {
        this.bridgeImageService.getAllBridgeImages().then((res) => {
            this.bridgeImages = res;
            this.updateOrder();
            this.updateYearList();
            this.getOverviewImages(2);

            //function getLevel1Category(img: BridgeImage) {
            //    let category_name = ""
            //    for (let ic of img.bridgeImageCategories) {
            //        if (ic.category.level == 1) {
            //            category_name = ic.category.name;
            //        }
            //    }
            //    return category_name;
            //}

            // sort images by its order (defined by level 1 category)
            for (let i = 0; i < this.bridgeImages.length - 1; i++) {
                for (let j = 0; j < this.bridgeImages.length - i - 1; j++) {
                    if (this.bridgeImages[j].order > this.bridgeImages[j + 1].order) {
                        let tmp_img = this.bridgeImages[j];
                        this.bridgeImages[j] = this.bridgeImages[j + 1];
                        this.bridgeImages[j + 1] = tmp_img;
                    }
                }
            }
        });
    }

    updateOrder() {
        for (let img of this.bridgeImages) {
            for (let bic of img.bridgeImageCategories) {
                if (bic.category.name == "Bridge Overview") {
                    img.order = 1;
                }
                if (bic.category.name == "Deck") {
                    img.order = 2;
                }
                if (bic.category.name == "Superstructure") {
                    img.order = 3;
                }
                if (bic.category.name == "Substructure") {
                    img.order = 4;
                }
                if (bic.category.name == "Railing") {
                    img.order = 5;
                }
                if (bic.category.name == "Detail") {
                    img.order = 6;
                }
                if (bic.category.name == "Other") {
                    img.order = 7;
                }
            }
        }
    }

    updateYearList() {
        for (let img of this.bridgeImages) {
            if (this.listOfYears.indexOf(img.year) == -1) {
                this.listOfYears.push(img.year);
            }
        }
        this.listOfYears.sort((a, b) => b - a);
        this.selectedYear = this.listOfYears[0];
    }

    changeSelectedYear(year: number) {
        this.selectedYear = year;
        this.getOverviewImages(2);
    }

    isSelectedYear(date: Date): boolean {
        let isSelected = false;
        if (date.getUTCFullYear() == this.selectedYear) {
            isSelected = true;
        }
        return isSelected;
    }

    onFileChange(files: File[]): void {
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                this.files.push(files[i]);
            }
        }
    }

    UpdateProgress(): void {
        const sum = this.file_progress.reduce((a, b) => a + b, 0);
        this.progress = Math.round((100 * sum) / this.total_size);
    }

    onSubmit(): void {
        this.bridgeImages = [];
        const requests: Observable<void>[] = [];
        for (let i = 0; i < this.files.length; i++) {
            this.bridgeImages.push(new BridgeImage());
            this.total_size += this.files[i].size;
            this.file_progress.push(0);

            requests.push(
                this.bridgeImageService.uploadBridgeImage(this.files[i]).map((event) => {
                    switch (event.type) {
                        case HttpEventType.UploadProgress:
                            // Update progress for this file.
                            this.file_progress[i] = event.loaded;
                            this.UpdateProgress();
                            break;
                        case HttpEventType.Response:
                            //console.log(event.body);
                            if (event.ok && event.body !== null) {
                                this.bridgeImages[i].deserialize(event.body as IBridgeImageProperties);
                            }
                            break;
                    }
                })
            );
        }
        forkJoin(requests).subscribe(() => {
            this.total_size = 0;
            this.file_progress = [];
            this.progress = 0;
            this.updateYearList();
            this.getOverviewImages(2);
        });
        this.files = [];
    }

    removeImageFromList(file: File, element: any) {
        const index = this.files.indexOf(file);
        if (index > -1) {
            this.files.splice(index, 1);
            fade(element);
        }

        function fade(e: any) {
            var op = 1; // initial opacity
            var timer = setInterval(function () {
                if (op <= 0.1) {
                    clearInterval(timer);
                    e.style.display = "none";
                }
                e.style.opacity = op;
                e.style.filter = "alpha(opacity=" + op * 100 + ")";
                op -= op * 0.1;
            }, 30);
        }
    }

    getObjectURL(file: File): any {
        return this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
    }

    // Return k best confidence images in overview categories
    getOverviewImages(k: number) {
        this.overviewImages = [];
        for (let image of this.bridgeImages) {
            if (k == 0) {
                break;
            }
            if (image.year == this.selectedYear) {
                for (let bic of image.bridgeImageCategories) {
                    if (bic.category.level == 1 && bic.category.name == "Bridge Overview") {
                        this.overviewImages.push(image);
                        k = k - 1;
                    }
                }
            }
        }
    }

    selectCategory(image: BridgeImage, level: number): string {
        let c = "";
        for (let ic of image.bridgeImageCategories) {
            if (ic.category.level == level) {
                c = ic.category.name;
            }
        }
        return c;
    }
}
