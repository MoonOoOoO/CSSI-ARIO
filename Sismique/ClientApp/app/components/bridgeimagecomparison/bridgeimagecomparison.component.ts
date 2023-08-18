import { Component, OnInit } from "@angular/core";
import { BridgeImageService } from "../shared/bridgeimage.service";
import { BridgeImage, IBridgeImageProperties } from "../shared/bridgeimage";

@Component({
    selector: "app-bridgeimagecomparison",
    templateUrl: "./bridgeimagecomparison.component.html",
    styleUrls: ["./bridgeimagecomparison.component.css"],
})
/** bridgeimagecomparison component*/
export class BridgeimagecomparisonComponent implements OnInit {
    bridgeImages: BridgeImage[] = [];
    listOfYears: number[] = [];

    /** bridgeimagecomparison ctor */
    constructor(private bridgeImageService: BridgeImageService) {}
    ngOnInit(): void {
        this.bridgeImageService.getBridgeImagesByCategory("Bridge Overview").then((res) => {
            this.bridgeImages = res;
            this.updateYearList();
        });
    }

    updateImageListByCategory(categoryName: string) {
        this.bridgeImageService.getBridgeImagesByCategory(categoryName).then((res) => {
            this.bridgeImages = res;
            this.updateYearList();
        });
    }

    updateYearList() {
        for (let img of this.bridgeImages) {
            img.year = img.date.getUTCFullYear();
            if (this.listOfYears.indexOf(img.year) == -1) {
                this.listOfYears.push(img.year);
            }
        }
    }
}
