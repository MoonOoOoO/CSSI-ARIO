import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import "rxjs/add/operator/toPromise";
import { CategoryType, ICategoryTypeProperties } from "./categorytype";

@Injectable()
export class CategoryTypeService {
    private categoryTypeApiUrl = "/api/CategoryType";

    constructor(private readonly http: Http) {}

    getCategoryTypes(): Promise<CategoryType[]> {
        return this.http
            .get(this.categoryTypeApiUrl)
            .toPromise()
            .then((response) => this.transformCategoryTypes(response.json() as ICategoryTypeProperties[]))
            .catch(this.handleError);
    }

    private transformCategoryType(members: ICategoryTypeProperties): CategoryType {
        const categoryType = new CategoryType();
        categoryType.deserialize(members);
        return categoryType;
    }

    private transformCategoryTypes(members: ICategoryTypeProperties[]): CategoryType[] {
        const categoryTypes: CategoryType[] = [];

        for (let m of members) {
            categoryTypes.push(this.transformCategoryType(m));
        }

        return categoryTypes;
    }

    private handleError(error: any): Promise<any> {
        console.error("An error occurred", error);
        return Promise.reject(error.message || error);
    }
}
