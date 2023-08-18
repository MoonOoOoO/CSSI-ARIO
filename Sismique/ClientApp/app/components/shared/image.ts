import { GeoLocation } from "./geolocation";
import { IImageCategoryProperties, ImageCategory } from "./imagecategory";
import { IReportProperties, Report } from "./report";

export interface IImageProperties {
    id: number;
    file: string;
    thumbnail: string;
    date: Date;
    latitude: number;
    longitude: number;
    reportId: number;
    report: IReportProperties;
    imageCategories: IImageCategoryProperties[];
}

export class Image {
    id: number;
    file: string;
    thumbnail: string;
    date: Date;
    latitude: number;
    longitude: number;
    reportId: number;
    report: Report;
    imageCategories: ImageCategory[];

    deserialize(input: IImageProperties): Image {
        this.id = input.id;
        this.file = input.file;
        this.thumbnail = input.thumbnail;
        this.date = new Date(input.date);
        this.latitude = input.latitude;
        this.longitude = input.longitude;
        this.reportId = input.reportId;

        if (input.report != null) {
            this.report = new Report();
            this.report.deserialize(input.report);
        }

        this.imageCategories = [];
        if (input.imageCategories != null) {
            for (let ic of input.imageCategories) {
                const imageCategories = new ImageCategory();
                imageCategories.deserialize(ic);
                this.imageCategories.push(imageCategories);
            }
        }

        return this;
    }

    hasGpsCoordinates(): boolean {
        return this.latitude !== 0.0 && this.longitude !== 0.0;
    }

    getGeoLocation(): GeoLocation {
        return new GeoLocation(this.latitude, this.longitude);
    }
}
