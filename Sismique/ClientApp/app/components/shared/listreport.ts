export interface IListReportProperties {
    id: number;
    name: string;
    date: Date;
    shared: boolean;
    numberImages: number;
    thumbnail: string;
    latitude: number;
    longitude: number;
}

export class ListReport {
    id: number;
    name: string;
    date: Date;
    shared: boolean;
    numberImages: number;
    thumbnail: string;
    latitude: number;
    longitude: number;

    deserialize(input: IListReportProperties): ListReport {
        this.id = input.id;
        this.name = input.name;
        this.date = new Date(input.date);
        this.shared = input.shared;
        this.numberImages = input.numberImages;
        this.thumbnail = input.thumbnail;
        this.latitude = input.latitude;
        this.longitude = input.longitude;

        return this;
    }

    hasGpsCoordinates(): boolean {
        return this.latitude !== 0.0 && this.longitude !== 0.0;
    }
}
