import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ReportPaginatedList } from "../shared/reportpaginatedlist";
import { ReportService } from "../shared/report.service";
import { FormBuilder } from "@angular/forms";

@Component({
    selector: "app-reportslist",
    templateUrl: "./reportslist.component.html",
    styleUrls: ["./reportslist.component.css"],
    providers: [ReportService],
})
/** reportslist component*/
export class ReportslistComponent implements OnInit {
    paginatedList: ReportPaginatedList;
    searchForm = this.fb.group({
        searchtext: "",
    });

    constructor(private readonly route: ActivatedRoute, private reportService: ReportService, private fb: FormBuilder) {
        this.paginatedList = new ReportPaginatedList();
        this.paginatedList.reports = [];
    }

    ngOnInit() {
        this.reportService.getReportList(1, 0).then((results) => (this.paginatedList = results));
    }

    searchFunction() {
        var input = this.searchForm.value["searchtext"];
        var filter = input.toUpperCase();
        var a_list = document.getElementById("reportlist");
        var a;
        if (a_list) {
            a = a_list.getElementsByTagName("a");
        }
        if (a) {
            for (var i = 0; i < a.length; i++) {
                var report_name = a[i].getElementsByTagName("span");
                console.log(report_name[1]);
                if (report_name[1].innerHTML.toUpperCase().indexOf(filter) > -1) {
                    fadein(a[i]);
                } else {
                    fadeout(a[i]);
                }
            }
        }

        function fadein(element: any) {
            //var op = 0.1;  // initial opacity
            //var timer = setInterval(function () {
            //    if (op >= 0.9) {
            //        clearInterval(timer);
            //        element.style.display = '';
            //    }
            //    element.style.opacity = op;
            //    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            //    op += op * 0.1;
            //}, 0);
            element.style.display = "";
        }

        function fadeout(element: any) {
            //    var op = 1;  // initial opacity
            //    var timer = setInterval(function () {
            //        if (op <= 0.1) {
            //            clearInterval(timer);
            //            element.style.display = 'none';
            //        }
            //        element.style.opacity = op;
            //        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            //        op -= op * 0.1;
            //    }, 0);
            element.style.display = "none";
        }
    }
}
