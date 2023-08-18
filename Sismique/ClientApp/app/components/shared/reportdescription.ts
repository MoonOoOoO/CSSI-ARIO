export interface IReportDescriptionProperties {
    id: number;
    reportDetail: string;
    hazard: string;
    magnitude: string;
    year: string;
    location: string;
    source: string;
    collector: string;
    buildingStories: string;
    tagging: string;
}

export class ReportDescription {
    id: number;
    reportDetail: string;
    hazard: string;
    magnitude: string;
    year: string;
    location: string;
    source: string;
    collector: string;
    buildingStories: string;
    tagging: string;

    deserialize(input: IReportDescriptionProperties): ReportDescription {
        this.id = input.id;
        this.reportDetail = input.reportDetail;
        this.hazard = input.hazard;
        this.magnitude = input.magnitude;
        this.year = input.year;
        this.location = input.location;
        this.source = input.source;
        this.collector = input.collector;
        this.buildingStories = input.buildingStories;
        this.tagging = input.tagging;
        return this;
    }
}
