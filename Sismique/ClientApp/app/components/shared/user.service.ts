import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { User, IUserProperties } from "./user";
import { Observable } from "rxjs";

@Injectable()
export class UserService {
    private headers = new Headers({ "Content-Type": "application/json" });
    private userApiUrl = "/api/User";

    constructor(private readonly http: Http, private readonly httpClient: HttpClient) {}

    getUserList(): Promise<User> {
        return this.http
            .get(this.userApiUrl)
            .toPromise()
            .then((response) => {
                const user = new User();
                user.deserialize(response.json() as IUserProperties);
                return user;
            })
            .catch(this.handleError);
    }

    getUser(id: number): Promise<User> {
        return this.http
            .get(this.userApiUrl + "/" + id)
            .toPromise()
            .then((response) => {
                const user = new User();
                user.deserialize(response.json() as IUserProperties);
                return user;
            })
            .catch(this.handleError);
    }

    addUser(user: User): Observable<Response> {
        return this.httpClient
            .post(this.userApiUrl, user, {
                observe: "response",
                headers: new HttpHeaders({ "Content-Type": "application/json" }),
            })
            .catch(this.handleError);
    }

    updateUser(id: number, user: User): Promise<User> {
        return this.http
            .put(this.userApiUrl + "/" + id, JSON.stringify(user), { headers: this.headers })
            .toPromise()
            .catch(this.handleError);
    }

    userLogin(user: User): Observable<Response> {
        return this.httpClient
            .post(this.userApiUrl + "/Login", user, {
                observe: "response",
                headers: new HttpHeaders({ "Content-Type": "application/json" }),
            })
            .catch(this.handleError);
    }

    private transformUser(members: IUserProperties): User {
        const user = new User();
        user.deserialize(members);
        return user;
    }

    private handleError(error: any): Promise<any> {
        console.error("An error occurred", error);
        return Promise.reject(error.message || error);
    }
}
