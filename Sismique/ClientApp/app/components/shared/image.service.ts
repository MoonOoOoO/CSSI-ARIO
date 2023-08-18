import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";
import { Image } from "./image";

@Injectable()
export class ImageService {
    private reportApiUrl = "/api/Report";
    private imageApiUrl = "/api/Images";
    private imageCategoryApiUrl = "/api/ImageCategory";

    httpOptions = {
        headers: new HttpHeaders({ "Content-Type": "application/json" }),
    };

    constructor(private readonly http: HttpClient) {}

    uploadImage(reportId: number, file: File): Observable<HttpEvent<Image>> {
        const formData = new FormData();
        formData.append("file", file);
        const req = new HttpRequest<FormData>("POST", this.reportApiUrl + "/" + reportId + "/images", formData, { reportProgress: true });
        return this.http.request(req);
    }

    //zhiwei delete image
    deleteImage(id: number): Promise<any> {
        return this.http
            .delete(this.imageApiUrl + "/" + id, this.httpOptions)
            .toPromise()
            .catch(this.handleError);
    }

    // insert user defined category
    addCategory(imageId: number, categoryId: number, confidence: number): Promise<any> {
        return this.http
            .post(this.imageCategoryApiUrl, JSON.stringify({ ImageId: imageId, categoryId: categoryId, confidence: confidence }), this.httpOptions)
            .toPromise()
            .catch(this.handleError);
    }

    // delete one image category
    deleteCategory(imageId: number, categoryId: number): Promise<any> {
        return this.http
            .post(this.imageCategoryApiUrl + "/delete", JSON.stringify({ ImageId: imageId, categoryId: categoryId }), this.httpOptions)
            .toPromise()
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error("An error occurred", error);
        return Promise.reject(error.message || error);
    }
}
