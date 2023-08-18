import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Category } from "../shared/category";
import { CategoryService } from "../shared/category.service";

@Injectable()
export class CategoriesResolver implements Resolve<Category[]> {
    constructor(private readonly categoryService: CategoryService) {}

    resolve() {
        return this.categoryService.getCategories();
    }
}
