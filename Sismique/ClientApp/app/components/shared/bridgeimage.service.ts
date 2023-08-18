import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from "@angular/common/http";
import "rxjs/add/operator/map";
import { Observable } from "rxjs";
import { BridgeImage, IBridgeImageProperties } from "./bridgeimage";

@Injectable()
export class BridgeImageService {
    private bridgeImageApiUrl = "./api/BridgeImage";
    httpOptions = {
        headers: new HttpHeaders({ "Content-Type": "application/json" }),
    };

    constructor(private readonly http: Http, private readonly httpClient: HttpClient) {}

    getAllBridgeImages(): Promise<BridgeImage[]> {
        return this.http
            .get(this.bridgeImageApiUrl)
            .toPromise()
            .then((response) => this.transformImages(response.json() as IBridgeImageProperties[]))
            .catch(this.handleError);
    }

    getBridgeImagesByCategory(categoryName: string): Promise<BridgeImage[]> {
        const params = new URLSearchParams();
        params.set("categoryName", categoryName);
        const requestOptions = new RequestOptions({ params: params });
        return this.http
            .get(this.bridgeImageApiUrl, requestOptions)
            .toPromise()
            .then((response) => this.transformImages(response.json() as IBridgeImageProperties[]))
            .catch(this.handleError);
    }

    uploadBridgeImage(file: File): Observable<HttpEvent<BridgeImage>> {
        const formData = new FormData();
        formData.append("file", file);
        const req = new HttpRequest<FormData>("POST", this.bridgeImageApiUrl + "/upload", formData, { reportProgress: true });
        return this.httpClient.request(req);
    }

    private transformImages(members: IBridgeImageProperties[]): BridgeImage[] {
        const bridgeImages: BridgeImage[] = [];
        for (let m of members) {
            bridgeImages.push(new BridgeImage().deserialize(m));
        }
        return bridgeImages;
    }

    private handleError(error: any): Promise<any> {
        console.error("An error occurred", error);
        return Promise.reject(error.message || error);
    }
}
