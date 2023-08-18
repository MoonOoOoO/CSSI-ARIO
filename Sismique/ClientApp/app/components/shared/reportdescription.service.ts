import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { ReportDescription, IReportDescriptionProperties } from "./reportdescription";

@Injectable()
export class ReportDescriptionService {
    private headers = new Headers({ "Content-Type": "application/json" });
    private reportDescriptionApiUrl = "/api/ReportDescription";

    constructor(private readonly http: Http) { }

    createReportDescription(reportDescription: ReportDescription): Promise<ReportDescription> {
        return this.http
            .post(this.reportDescriptionApiUrl, JSON.stringify(reportDescription), { headers: this.headers })
            .toPromise()
            .then((response) => this.transformReportDescription(response.json() as IReportDescriptionProperties))
            .catch(this.handleError);
    }

    deleteReportDescription(id: number): Promise<ReportDescription> {
        return this.http
            .delete(this.reportDescriptionApiUrl + "/" + id, { headers: this.headers })
            .toPromise()
            .catch(this.handleError);
    }

    updateReportDescription(id: number, reportDescription: ReportDescription): Promise<ReportDescription> {
        return this.http
            .put(this.reportDescriptionApiUrl + "/" + id, JSON.stringify(reportDescription), { headers: this.headers })
            .toPromise()
            //.then((response) => this.transformReportDescription(response.json() as IReportDescriptionProperties))
            .catch(this.handleError);
    }

    private transformReportDescription(members: IReportDescriptionProperties): ReportDescription {
        const reportDescription = new ReportDescription();
        reportDescription.deserialize(members);
        return reportDescription;
    }

    private handleError(error: any): Promise<any> {
        console.error("An error occurred", error);
        return Promise.reject(error.message || error);
    }
}
