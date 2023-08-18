import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Category } from "../shared/category";
import { CategoryService } from "../shared/category.service";
import { ImagePaginatedList } from "../shared/imagepaginatedlist";

@Component({
    selector: "category",
    templateUrl: "./category.component.html",
})
export class CategoryComponent implements OnInit {
    category: Category;
    paginatedList: ImagePaginatedList;

    constructor(private readonly route: ActivatedRoute, private readonly categoryService: CategoryService) {
        this.paginatedList = new ImagePaginatedList();
        this.paginatedList.images = [];
    }

    ngOnInit(): void {
        this.category = this.route.snapshot.data.category as Category;
        this.categoryService.getCategoryImages(this.category.id).then((results) => (this.paginatedList = results));
    }

    goToPage(pageIndex: number): void {
        this.categoryService.getCategoryImages(this.category.id, pageIndex).then((results) => (this.paginatedList = results));
    }
}
