import { Report, IReportProperties } from "./report";

export interface IReportCollectionProperties {
    reportId: number;
    userId: number;
    report: IReportProperties;
}

export class ReportCollection {
    reportId: number;
    userId: number;
    report: Report;

    deserialize(input: IReportCollectionProperties): ReportCollection {
        this.reportId = input.reportId;
        this.userId = input.userId;
        if (input.report != null) {
            this.report = new Report();
            this.report.deserialize(input.report);
        }
        return this;
    }
}
