import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import "rxjs/add/operator/toPromise";
import { Category, ICategoryProperties } from "./category";
import { ImagePaginatedList, IImagePaginatedListProperties } from "./imagepaginatedlist";

@Injectable()
export class CategoryService {
    private categoryApiUrl = "/api/Category";
    private imageApiUrl = "/api/Images";

    constructor(private readonly http: Http) {}

    getCategories(): Promise<Category[]> {
        return this.http
            .get(this.categoryApiUrl)
            .toPromise()
            .then((response) => this.transformCategories(response.json() as ICategoryProperties[]))
            .catch(this.handleError);
    }

    getCategory(id: number, includeImages: boolean = false): Promise<Category> {
        const params = new URLSearchParams();
        params.set("includeImages", includeImages ? "true" : "false");
        const requestOptions = new RequestOptions({ params: params });

        return this.http
            .get(this.categoryApiUrl + "/" + id, requestOptions)
            .toPromise()
            .then((response) => this.transformCategory(response.json() as ICategoryProperties))
            .catch(this.handleError);
    }

    getCategoryImages(id: number, pageIndex: number = 1, pageSize: number = 24): Promise<ImagePaginatedList> {
        const params = new URLSearchParams();
        params.set("filterCategory", id.toString());
        params.set("pageIndex", pageIndex.toString());
        params.set("pageSize", pageSize.toString());
        const requestOptions = new RequestOptions({ params: params });

        return this.http
            .get(this.imageApiUrl, requestOptions)
            .toPromise()
            .then((response) => this.transformImagePaginatedList(response.json() as IImagePaginatedListProperties))
            .catch(this.handleError);
    }

    private transformImagePaginatedList(members: IImagePaginatedListProperties): ImagePaginatedList {
        const imagePaginatedList = new ImagePaginatedList();
        imagePaginatedList.deserialize(members);
        return imagePaginatedList;
    }

    private transformCategory(members: ICategoryProperties): Category {
        const category = new Category();
        category.deserialize(members);
        return category;
    }

    private transformCategories(members: ICategoryProperties[]): Category[] {
        const categories: Category[] = [];

        for (let m of members) {
            categories.push(this.transformCategory(m));
        }

        return categories;
    }

    private handleError(error: any): Promise<any> {
        console.error("An error occurred", error);
        return Promise.reject(error.message || error);
    }
}
