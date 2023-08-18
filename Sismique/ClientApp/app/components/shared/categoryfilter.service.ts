import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import * as d3 from "d3-selection";

import { CategoryFilter, CategoryFilterMode } from "./categoryfilter";

@Injectable()
export class CategoryFilterService {
    // BehaviorSubject is used to notify the subscriber when the filters change
    subject: BehaviorSubject<number>;

    categoryFilter: CategoryFilter;

    constructor() {
        this.subject = new BehaviorSubject<number>(-1);
        this.categoryFilter = new CategoryFilter();
    }

    reset(): void {
        this.categoryFilter.reset();
        this.subject.next(-1);
    }

    resetPieCategory(): void {
        d3.selectAll("[id^='outerCategory']").style("opacity", 0).style("transition-duration", "0.3s");
        d3.selectAll("[id^='legendCategory']").style("font-weight", "normal");
    }

    changeToUnionFilterMode(): void {
        this.categoryFilter.setFilterMode(CategoryFilterMode.Union);
        this.subject.next(-1);
    }

    changeToIntersectionFilterMode(): void {
        this.categoryFilter.setFilterMode(CategoryFilterMode.Intersection);
        this.subject.next(-1);
    }

    toggleCategory(categoryId: number): void {
        this.categoryFilter.toggleCategory(categoryId);
        this.subject.next(categoryId);
    }

    togglePieCategory(id: number) {
        d3.select("#outerCategory" + id)
            .style("opacity", d3.select("#outerCategory" + id).style("opacity") == "0.7" ? 0 : 0.7)
            .style("display", "block")
            .style("transition-duration", "0.3s");
        d3.select("#legendCategory" + id).style("font-weight", d3.select("#legendCategory" + id).style("font-weight") == "bold" ? "normal" : "bold");
    }

    addCategory(categoryId: number): void {
        this.categoryFilter.addCategory(categoryId);
        this.subject.next(categoryId);
    }

    removeCategory(categoryId: number): void {
        this.categoryFilter.removeCategory(categoryId);
        this.subject.next(categoryId);
    }
}
