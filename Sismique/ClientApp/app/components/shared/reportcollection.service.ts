import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { ReportCollection, IReportCollectionProperties } from "./reportcollection";

@Injectable()
export class ReportCollectionService {
    private headers = new Headers({ "Content-Type": "application/json" });
    private reportDescriptionApiUrl = "/api/ReportCollections";

    constructor(private readonly http: Http) {}

    // add a report to the user collection
    addNewCollection(reportId: number, userId: number): Promise<any> {
        return this.http
            .post(
                this.reportDescriptionApiUrl,
                JSON.stringify({
                    reportId: reportId,
                    userId: userId,
                }),
                { headers: this.headers }
            )
            .toPromise()
            .catch(this.handleError);
    }

    // remove report from the user collection
    removeReport(reportId: number, userId: number): Promise<any> {
        return this.http
            .post(
                this.reportDescriptionApiUrl + "/Remove",
                JSON.stringify({
                    reportId: reportId,
                    userId: userId,
                }),
                { headers: this.headers }
            )
            .toPromise()
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error("An error occurred", error);
        return Promise.reject(error.message || error);
    }
}
