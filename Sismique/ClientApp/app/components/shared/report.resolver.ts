import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Report } from "../shared/report";
import { ReportService } from "../shared/report.service";

@Injectable()
export class ReportResolver implements Resolve<Report> {
    constructor(private readonly reportService: ReportService) {}

    resolve(route: ActivatedRouteSnapshot) {
        return this.reportService.getReport(Number(route.paramMap.get("id")), true);
    }
}
