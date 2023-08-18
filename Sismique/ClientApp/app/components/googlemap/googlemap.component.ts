import { Component, Input } from "@angular/core";
import { GeoLocation } from "../shared/geolocation";

@Component({
    selector: "googlemap",
    templateUrl: "./googlemap.component.html",
    styleUrls: ["googlemap.component.css"],
})
export class GoogleMapComponent {
    @Input() coordinates: GeoLocation;
}
