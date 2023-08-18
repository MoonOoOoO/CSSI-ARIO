import { Image, IImageProperties } from "./image";
import { User, IUserProperties } from "./user";
import { ReportDescription, IReportDescriptionProperties } from "./reportdescription";

export interface IReportProperties {
    id: number;
    name: string;
    date: Date;
    userId: number;
    shared: boolean;
    user: IUserProperties;
    images: IImageProperties[];
    reportDescriptionId: number;
    reportDescription: IReportDescriptionProperties;
}

export class Report {
    id: number;
    name: string;
    date: Date;
    userId: number;
    shared: boolean;
    user: User;
    images: Image[];
    reportDescriptionId: number;
    reportDescription: ReportDescription;

    deserialize(input: IReportProperties): Report {
        this.id = input.id;
        this.name = input.name;
        this.date = new Date(input.date);
        this.userId = input.userId;
        this.reportDescriptionId = input.reportDescriptionId;
        this.shared = input.shared;

        if (input.user != null) {
            this.user = new User();
            this.user.deserialize(input.user);
        }

        this.images = [];
        if (input.images != null) {
            for (let ip of input.images) {
                const image = new Image();
                image.deserialize(ip);
                this.images.push(image);
            }
        }
        this.reportDescription = new ReportDescription();
        this.reportDescription.deserialize(input.reportDescription);
        return this;
    }
}
