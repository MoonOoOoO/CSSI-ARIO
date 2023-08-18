import { Component, OnInit } from "@angular/core";
import { ListReport } from "../shared/listreport";
import { ReportService } from "../shared/report.service";

@Component({
    selector: "reportsmap",
    templateUrl: "./reportsmap.component.html",
    styleUrls: ["reportsmap.component.css"],
})
export class ReportsMapComponent implements OnInit {
    reportList: ListReport[];

    constructor(private readonly reportService: ReportService) {
        this.reportList = [];
    }

    ngOnInit(): void {
        // Load all reports with GPS coordinates
        // Ask for the first page, with a page size of infinity
        this.reportService.getReportList(1, 0).then((results) => {
            for (let report of results.reports) {
                if (report.hasGpsCoordinates()) {
                    this.reportList.push(report);
                }
            }
        });
    }
}
