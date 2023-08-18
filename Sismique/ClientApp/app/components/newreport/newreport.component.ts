import { Component, OnInit, ViewChild, ElementRef, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { Report } from "../shared/report";
import { ReportDescription } from "../shared/reportdescription";
import { ReportService } from "../shared/report.service";
import { ReportDescriptionService } from "../shared/reportdescription.service";
import { MapsAPILoader, MouseEvent } from "@agm/core";

@Component({
    selector: "new-report",
    templateUrl: "./newreport.component.html",
    styleUrls: ["./newreport.component.css"],
    providers: [ReportService, ReportDescriptionService],
})
export class NewReportComponent implements OnInit {
    report: Report;
    reportDescription: ReportDescription;

    latitude: number;
    longitude: number;
    zoom: number;
    private geoCoder: any;

    years: number[] = [];

    @ViewChild("search")
    public searchElementRef: ElementRef;

    constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private readonly router: Router, private readonly reportService: ReportService) {
        // Init the report
        this.report = new Report();
        this.report.name = "";
        this.report.date = new Date();
        this.report.images = [];
        this.report.shared = false;

        // Init the report description
        this.reportDescription = new ReportDescription();
        this.reportDescription.reportDetail = "";
        this.reportDescription.hazard = "";
        this.reportDescription.magnitude = "";
        this.reportDescription.year = "";
        this.reportDescription.location = "";
        this.reportDescription.source = "";
        this.reportDescription.collector = "";
        this.reportDescription.buildingStories = "N/A";
        this.reportDescription.tagging = "N/A"
        this.report.reportDescription = this.reportDescription;

        let json = localStorage.getItem("user");
        if (json) {
            this.report.userId = JSON.parse(json)["id"];
        }

        for (let i = 2030; i >= 1950; i--) {
            this.years.push(i);
        }
    }

    ngOnInit() {
        this.mapsAPILoader.load().then(() => {
            //this.setCurrentLocation();

            let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
            autocomplete.addListener("place_changed", () => {
                this.ngZone.run(() => {
                    //get the place result
                    let place: google.maps.places.PlaceResult = autocomplete.getPlace();
                    //verify result
                    if (place.geometry === undefined || place.geometry === null) {
                        return;
                    }
                    //set latitude, longitude and zoom
                    this.latitude = place.geometry.location.lat();
                    this.longitude = place.geometry.location.lng();
                    this.zoom = 18;
                    let map = document.getElementById("agm-map");
                    if (map) {
                        map.style.height = "300px";
                    }
                    if (place.formatted_address) {
                        this.reportDescription.location = place.formatted_address.toString();
                    }
                });
            });
        });
    }

    private setCurrentLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                this.zoom = 8;
                this.getAddress(this.latitude, this.longitude);
            });
        }
    }

    markerDragEnd($event: MouseEvent) {
        this.latitude = $event.coords.lat;
        this.longitude = $event.coords.lng;
        this.getAddress(this.latitude, this.longitude);
    }

    getAddress(latitude: number, longitude: number) {
        this.mapsAPILoader.load().then(() => {
            this.geoCoder = new google.maps.Geocoder();
            this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any, status: any) => {
                if (status === "OK") {
                    if (results[0]) {
                        this.zoom = 12;
                        this.reportDescription.location = results[0].formatted_address;
                    } else {
                        window.alert("No results found");
                    }
                } else {
                    window.alert("Geocoder failed due to: " + status);
                }
            });
        });
    }

    // Create a new report
    newReport(): void {
        this.reportService
            .createReport(this.report)
            .then((report: Report) => {
                this.router.navigate(["/report", report.id]);
            })
            .catch(() => {
                // Display error message
                console.log("An error has occurred when saving.");
            });
    }

    // Change the date (format: 'yyyy-MM-dd') of the report
    // If newDateStr is invalid, select the current date (now)
    changeDate(newDateStr: string): void {
        const newDate = moment(newDateStr);
        if (newDate.isValid()) {
            this.report.date = newDate.toDate();
        } else {
            this.report.date = new Date();
        }
    }
}
