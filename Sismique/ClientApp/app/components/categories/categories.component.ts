import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CategoryType } from "../shared/categorytype";

@Component({
    selector: "categories",
    templateUrl: "./categories.component.html",
    styleUrls: ["./categories.component.css"],
})
export class CategoriesComponent implements OnInit {
    categoryTypes: CategoryType[];

    constructor(private readonly route: ActivatedRoute, private readonly location: Location) {
        this.categoryTypes = [];
    }

    ngOnInit(): void {
        this.categoryTypes = this.route.snapshot.data.categoryTypes as CategoryType[];
    }
}
