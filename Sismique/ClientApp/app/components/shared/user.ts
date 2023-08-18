import { Report, IReportProperties } from "./report";
import { ListReport, IListReportProperties } from "./listreport";
import { ReportCollection, IReportCollectionProperties } from "./reportcollection";

export interface IUserProperties {
    id: number;
    username: string;
    firstname: string;
    middlename: string;
    lastname: string;
    institution: string;
    lastlogin: Date;
    reports: IListReportProperties[];
    reportCollections: IReportCollectionProperties[];
}

export class User {
    id: number;
    username: string;
    password: string;
    firstname: string;
    middlename: string;
    lastname: string;
    institution: string;
    lastlogin: Date;
    reports: ListReport[] = [];
    reportCollections: ReportCollection[] = [];

    deserialize(input: IUserProperties): User {
        this.id = input.id;
        this.username = input.username;
        this.firstname = input.firstname;
        this.middlename = input.middlename;
        this.lastname = input.lastname;
        this.institution = input.institution;
        this.lastlogin = new Date(input.lastlogin);
        //this.password = input.password;
        if (input.reports != null) {
            for (let ic of input.reports) {
                const listReport = new ListReport();
                listReport.deserialize(ic);
                this.reports.push(listReport);
            }
        }
        if (input.reportCollections != null) {
            for (let ir of input.reportCollections) {
                const rc = new ReportCollection();
                rc.deserialize(ir);
                this.reportCollections.push(rc);
            }
        }
        return this;
    }
}
