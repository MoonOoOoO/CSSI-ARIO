import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Category } from "../shared/category";
import { CategoryService } from "../shared/category.service";

@Injectable()
export class CategoryResolver implements Resolve<Category> {
    constructor(private readonly categoryService: CategoryService) {}

    resolve(route: ActivatedRouteSnapshot) {
        return this.categoryService.getCategory(Number(route.paramMap.get("id")), false);
    }
}
