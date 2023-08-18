import { Component, OnInit } from "@angular/core";
import { User } from "../shared/user";
import { UserService } from "../shared/user.service";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { ReportService } from "../shared/report.service";
import { ReportCollectionService } from "../shared/reportcollection.service";
import { ReportDescriptionService } from "../shared/reportdescription.service";
import { Report } from "../shared/report";
import { EncrDecrService } from "../shared/encr-decr.service";

@Component({
    selector: "app-user",
    templateUrl: "./user.component.html",
    styleUrls: ["./user.component.css"],
})
/** user component*/
export class UserComponent implements OnInit {
    private greeting: string = "";
    private now: number = 0;
    public islogin: boolean = false;
    private user: User = new User();
    private key: string = "";

    regForm = this.fb.group({
        username: "",
        password: "",
        firstname: "",
        middlename: "",
        lastname: "",
        institution: "",
        lastlogin: new Date(),
    });

    constructor(
        private router: Router,
        private location: Location,
        private fb: FormBuilder,
        private userService: UserService,
        private reportService: ReportService,
        private reportCollectionService: ReportCollectionService,
        private reportDescriptionService: ReportDescriptionService,
        private encrdecrService: EncrDecrService
    ) {
        this.user.username = "";
        this.user.password = "";
    }

    ngOnInit() {
        if (!localStorage.getItem("isLogin")) {
            localStorage.setItem("isLogin", "false");
        }
        this.now = new Date().getHours();
        if (this.now < 5) {
            this.greeting = "night";
        } else if (this.now < 12) {
            this.greeting = "morning";
        } else if (this.now < 18) {
            this.greeting = "afternoon";
        } else {
            this.greeting = "night";
        }
        if (localStorage.getItem("isLogin") == "true") {
            this.islogin = true;
            let json = localStorage.getItem("user");
            if (json) {
                this.getUserInfo(JSON.parse(json)["id"]);
            }
        } else {
            this.islogin = false;
            localStorage.clear();
        }
    }

    register(): void {
        const u = new User();
        u.username = this.regForm.value["username"];
        u.password = this.encrdecrService.encrypt(this.regForm.value["password"]);
        u.firstname = this.regForm.value["firstname"];
        if (this.regForm.value["middlename"]) {
            u.middlename = this.regForm.value["middlename"];
        } else {
            u.middlename = "";
        }
        u.lastname = this.regForm.value["lastname"];
        u.institution = this.regForm.value["institution"];
        u.lastlogin = new Date();
        this.userService.addUser(u).subscribe(
            (res) => {
                // register success
                if (res.status == 201) {
                    var ele = document.getElementById("userExists");
                    if (ele) {
                        ele.style.display = "none";
                    }
                    var element = document.getElementById("registerSuccess");
                    var bg = document.getElementById("bg");
                    if (element && bg) {
                        element.className = element.className.replace("hidden", "");
                        bg.style.display = "block";
                    }
                    this.regForm.reset();
                }
            },
            (err) => {
                // username already exists
                var ele = document.getElementById("userExists");
                if (ele) {
                    ele.style.display = "block";
                }
            }
        );
    }

    login() {
        const login_user = new User();
        login_user.username = this.user.username;
        login_user.password = this.encrdecrService.encrypt(this.user.password);
        console.log(login_user);
        this.userService.userLogin(login_user).subscribe(
            (res) => {
                if (res.status == 200) {
                    // login success
                    localStorage.setItem("user", JSON.stringify(res.body));
                    localStorage.setItem("isLogin", "true");
                    let json = localStorage.getItem("user");
                    if (json) {
                        this.user = JSON.parse(json);
                    }
                    // success prompt
                    var element = document.getElementById("loginSuccess");
                    var bg = document.getElementById("bg");
                    if (element && bg) {
                        element.className = element.className.replace("hidden", "");
                        bg.style.display = "block";
                    }
                    setTimeout(() => this.refresh(), 1500);
                }
            },
            (err) => {
                // login fail prompt
                var element = document.getElementById("loginAlert");
                var bg = document.getElementById("bg");
                if (element && bg) {
                    element.className = element.className.replace("hidden", "");
                    bg.style.display = "block";
                }
            }
        );
    }

    hideAlert(id: string) {
        var element = document.getElementById(id);
        var bg = document.getElementById("bg");
        if (element && bg) {
            element.classList.add("hidden");
            bg.style.display = "none";
        }
        if (id == "registerSuccess" || id == "logoutAlert") {
            this.refresh();
        }
    }

    logout() {
        var element = document.getElementById("logoutAlert");
        var bg = document.getElementById("bg");
        if (element && bg) {
            element.className = element.className.replace("hidden", "");
            bg.style.display = "block";
        }
        localStorage.setItem("isLogin", "false");
        localStorage.removeItem("user");
        localStorage.clear();
        this.user.lastlogin = new Date();
        this.userService.updateUser(this.user.id, this.user);
    }

    deleteReport(id: number, rdid: number, name: string) {
        if (window.confirm(`Are you sure to delete report ` + name)) {
            this.reportService.deleteReport(id).then(() => {
                this.reportDescriptionService.deleteReportDescription(rdid).then(() => {
                    var elem = document.getElementById("report-" + id);
                    if (elem) {
                        fade(elem);
                        this.getUserInfo(this.user.id);
                    }
                });
            });
        } else {
            return;
        }

        function fade(element: any) {
            var op = 1; // initial opacity
            var timer = setInterval(function () {
                if (op <= 0.1) {
                    clearInterval(timer);
                    element.style.display = "none";
                }
                element.style.opacity = op;
                element.style.filter = "alpha(opacity=" + op * 100 + ")";
                op -= op * 0.1;
            }, 30);
        }
    }

    removeReportFromCollection(reportId: number, reportName: string) {
        if (window.confirm("Remove report " + reportName + " from my collection?")) {
            this.reportCollectionService.removeReport(reportId, this.user.id).then(() => {
                var elem = document.getElementById("collection-report-" + reportId);
                if (elem) {
                    fade(elem);
                }
            });
        } else {
            return;
        }

        function fade(element: any) {
            var op = 1; // initial opacity
            var timer = setInterval(function () {
                if (op <= 0.1) {
                    clearInterval(timer);
                    element.style.display = "none";
                }
                element.style.opacity = op;
                element.style.filter = "alpha(opacity=" + op * 100 + ")";
                op -= op * 0.1;
            }, 30);
        }
    }

    toggleShare(id: number, report: Report) {
        if (report.shared) {
            report.shared = false;
        } else {
            report.shared = true;
        }
        this.reportService.updateReport(id, report);
    }

    private async getUserInfo(id: number) {
        const response = await fetch("api/User/" + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
        });
        if (response.status === 200) {
            response.json().then((data) => {
                localStorage.setItem("user", JSON.stringify(data));
                let json = localStorage.getItem("user");
                if (json) {
                    this.user = JSON.parse(json);
                }
            });
        }
    }

    private totalImages(): number {
        let total = 0;
        for (let report of this.user.reports) {
            total += report.numberImages;
        }
        return total;
    }

    private sharedTotal(): number {
        let sharedNum = 0;
        for (let report of this.user.reports) {
            if (report.shared) {
                sharedNum++;
            }
        }
        return sharedNum;
    }

    private async refresh() {
        this.router.navigateByUrl("/refresh", { skipLocationChange: true }).then((_) => {
            this.router.navigate([decodeURI(this.location.path())]);
        });
    }
}
