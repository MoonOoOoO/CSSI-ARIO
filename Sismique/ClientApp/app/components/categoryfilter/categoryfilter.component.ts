import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CategoryType } from "../shared/categorytype";
import { CategoryFilterService } from "../shared/categoryfilter.service";

@Component({
    selector: "category-filter",
    templateUrl: "./categoryfilter.component.html",
    styleUrls: ["./categoryfilter.component.css"],
})
export class CategoryFilterComponent implements OnInit {
    categoryTypes: CategoryType[];

    constructor(private readonly route: ActivatedRoute, private filterService: CategoryFilterService) {
        this.categoryTypes = [];
    }

    ngOnInit(): void {
        this.categoryTypes = this.route.snapshot.data.categoryTypes as CategoryType[];
    }

    // Disable all filters
    resetFilters(): void {
        this.filterService.reset();
        this.filterService.resetPieCategory();
    }

    changeToUnionFilterMode(): void {
        this.filterService.changeToUnionFilterMode();
    }

    changeToIntersectionFilterMode(): void {
        this.filterService.changeToIntersectionFilterMode();
    }

    // Toggle the use of a category in the filter
    toggleCategory(categoryId: number): void {
        this.filterService.toggleCategory(categoryId);
        this.filterService.togglePieCategory(categoryId);
    }

    // Return true if the Category, which id is categoryId, is selected
    isCategorySelected(categoryId: number): boolean {
        return this.filterService.categoryFilter.hasCategory(categoryId);
    }
}
