import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { CategoryType } from "../shared/categorytype";
import { CategoryTypeService } from "../shared/categorytype.service";

@Injectable()
export class CategoryTypesResolver implements Resolve<CategoryType[]> {
    constructor(private readonly categoryTypeService: CategoryTypeService) {}

    resolve() {
        return this.categoryTypeService.getCategoryTypes();
    }
}
