import { Injectable } from "@angular/core";
import { Headers, Http, RequestOptions, URLSearchParams } from "@angular/http";
import "rxjs/add/operator/toPromise";
import { IReportProperties, Report } from "./report";
import { IReportPaginatedListProperties, ReportPaginatedList } from "./reportpaginatedlist";

@Injectable()
export class ReportService {
    private headers = new Headers({ "Content-Type": "application/json" });
    private reportApiUrl = "/api/Report";

    constructor(private readonly http: Http) {}

    getReportList(pageIndex: number = 1, pageSize: number = 16): Promise<ReportPaginatedList> {
        const params = new URLSearchParams();
        params.set("pageIndex", pageIndex.toString());
        params.set("pageSize", pageSize.toString());
        const requestOptions = new RequestOptions({ params: params });

        return this.http
            .get(this.reportApiUrl, requestOptions)
            .toPromise()
            .then((response) => this.transformListReportPaginatedList(response.json() as IReportPaginatedListProperties))
            .catch(this.handleError);
    }

    getReport(id: number, includeImages: boolean = true): Promise<Report> {
        const params = new URLSearchParams();
        params.set("includeImages", includeImages ? "true" : "false");
        const requestOptions = new RequestOptions({ params: params });

        return this.http
            .get(this.reportApiUrl + "/" + id, requestOptions)
            .toPromise()
            .then((response) => this.transformReport(response.json() as IReportProperties))
            .catch(this.handleError);
    }

    createReport(report: Report): Promise<Report> {
        return this.http
            .post(this.reportApiUrl, JSON.stringify(report), { headers: this.headers })
            .toPromise()
            .then((response) => this.transformReport(response.json() as IReportProperties))
            .catch(this.handleError);
    }

    // Zhiwei update report
    updateReport(id: number, report: Report): Promise<Report> {
        return this.http
            .put(this.reportApiUrl + "/" + id, JSON.stringify(report), { headers: this.headers })
            .toPromise()
            .catch(this.handleError);
    }

    // Zhiwei 04/05
    deleteReport(id: number): Promise<Report> {
        return this.http
            .delete(this.reportApiUrl + "/" + id, { headers: this.headers })
            .toPromise()
            .catch(this.handleError);
    }

    getReportDownloadLink(id: number): string {
        return this.reportApiUrl + "/" + id + "/archive";
    }

    getCompressReport(id: number): Promise<boolean> {
        return this.http
            .get(this.reportApiUrl + "/" + id + "/file")
            .toPromise()
            .catch(this.handleError);
        // var boo = false;
        // fetch(this.reportApiUrl + "/" + id + "/file").then((response) => {
        //     if (response.status == 200) {
        //         boo = true;
        //     } else {
        //         boo = false;
        //     }
        // });
        // return boo;
    }

    private transformReport(members: IReportProperties): Report {
        const report = new Report();
        report.deserialize(members);
        return report;
    }

    private transformListReportPaginatedList(members: IReportPaginatedListProperties): ReportPaginatedList {
        const reportPaginatedList = new ReportPaginatedList();
        reportPaginatedList.deserialize(members);
        return reportPaginatedList;
    }

    private handleError(error: any): Promise<any> {
        console.error("An error occurred", error);
        return Promise.reject(error.message || error);
    }
}
