import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { ReportPaginatedList } from "../shared/reportpaginatedlist";
import { ReportService } from "../shared/report.service";
import { ReportCollectionService } from "../shared/reportcollection.service";
import { Report } from "../shared/report";

@Component({
    selector: "reports",
    templateUrl: "./reports.component.html",
    styleUrls: ["./reports.component.css"],
    providers: [ReportService],
})
export class ReportsComponent implements OnInit {
    paginatedList: ReportPaginatedList;
    islogin: boolean = false;
    username: string = "";

    constructor(private router: Router, private location: Location, private readonly reportService: ReportService, private readonly reportCollectionService: ReportCollectionService) {
        this.paginatedList = new ReportPaginatedList();
        this.paginatedList.reports = [];
    }

    ngOnInit(): void {
        this.reportService.getReportList().then((results) => (this.paginatedList = results));
        if (localStorage.getItem("isLogin") == "true") {
            this.islogin = true;
            let json = localStorage.getItem("user");
            if (json) {
                var user = JSON.parse(json);
                this.username = user.username;
                this.getUserInfo(user.id);
            }
        } else {
            this.islogin = false;
        }
    }

    goToPage(pageIndex: number): void {
        this.reportService.getReportList(pageIndex).then((results) => (this.paginatedList = results));
    }

    addToCollection(reportId: number): void {
        let json = localStorage.getItem("user");
        if (json) {
            var user = JSON.parse(json);
            this.reportCollectionService.addNewCollection(reportId, user.id).then((_) => {
                this.getUserInfo(user.id);
                var save_btn = document.getElementById("report-save-" + reportId);
                var remove_btn = document.getElementById("report-remove-" + reportId);
                if (save_btn && remove_btn) {
                    save_btn.style.display = "none";
                    remove_btn.style.display = "block";
                }
            });
        }
    }

    removeFromCollection(reportId: number): void {
        let json = localStorage.getItem("user");
        if (json) {
            // chekc if the logged in user saved this report
            var user = JSON.parse(json);
            this.reportCollectionService.removeReport(reportId, user.id).then((_) => {
                this.getUserInfo(user.id);
                var save_btn = document.getElementById("report-save-" + reportId);
                var remove_btn = document.getElementById("report-remove-" + reportId);
                if (save_btn && remove_btn) {
                    save_btn.style.display = "block";
                    remove_btn.style.display = "none";
                }
            });
        }
    }

    isSaved(reportId: number): boolean {
        let json = localStorage.getItem("user");
        let saved = false;
        if (json) {
            // chekc if the logged in user saved this report
            var user = JSON.parse(json);
            for (let rc of user.reportCollections) {
                if (rc.reportID == reportId) {
                    saved = true;
                }
            }
        }
        return saved;
    }

    private async getUserInfo(id: string) {
        const response = await fetch("api/User/" + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
        });
        if (response.status === 200) {
            response.json().then((data) => {
                localStorage.setItem("user", JSON.stringify(data));
            });
        }
    }

    private async refresh() {
        this.router.navigateByUrl("/refresh", { skipLocationChange: true }).then((_) => {
            this.router.navigate([decodeURI(this.location.path())]);
        });
    }
}
