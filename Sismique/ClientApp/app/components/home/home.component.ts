import { Component, OnInit } from "@angular/core";

@Component({
    selector: "home",
    templateUrl: "./home.component.html",
    styleUrls: ["home.component.css"],
})
export class HomeComponent implements OnInit {
    ngOnInit(): void {
        if (!localStorage.getItem("isLogin")) {
            localStorage.setItem("isLogin", "false");
        }
    }
}