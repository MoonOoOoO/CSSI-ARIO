import { Component, OnInit, ViewChild, ElementRef, NgZone } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EventManager } from "@angular/platform-browser";
import { Category } from "../shared/category";
import { CategoryFilter } from "../shared/categoryfilter";
import { ImageCategory } from "../shared/imagecategory";
import { GeoLocation } from "../shared/geolocation";
import { Image } from "../shared/image";
import { Report } from "../shared/report";
import { ReportService } from "../shared/report.service";
import { ImageService } from "../shared/image.service";
import { ReportCollectionService } from "../shared/reportcollection.service";
import { ReportDescriptionService } from "../shared/reportdescription.service";
import { CategoryFilterService } from "../shared/categoryfilter.service";
import "rxjs/add/operator/switchMap";
import { MapsAPILoader, MouseEvent } from "@agm/core";

@Component({
    selector: "report",
    templateUrl: "./report.component.html",
    styleUrls: ["./report.component.css"],
    providers: [],
})
export class ReportComponent implements OnInit {
    report: Report = new Report();
    categories: Category[] = [];
    display_labels: {
        imageId: number;
        categories: {
            categoryId: number;
            categoryName: string;
            confidence: number;
            order: number;
        }[];
    }[] = [];

    authorized: boolean = false;
    editing: boolean = false;
    islogin: boolean = false;
    refreshform: string = "";
    added: boolean = false;

    latitude: string = "0.00000";
    longitude: string = "0.00000";

    gmap_latitude: number;
    gmap_longitude: number;
    zoom: number;
    private geoCoder: any;

    @ViewChild("search")
    public searchElementRef: ElementRef;

    minimumImageDate: Date | null;
    maximumImageDate: Date | null;

    sortedImages: any[] = [];

    filter: CategoryFilter;
    readyForDownload: boolean = false;
    reportSummary: any[] = [
        {
            category: "Image Location",
            detail: [
                { category: "Building exterior", frequency: 0 },
                { category: "Building interior", frequency: 0 },
            ],
            frequency: 0,
        },
        {
            category: "Overview Image",
            detail: [
                { category: "Canonical view", frequency: 0 },
                { category: "Front view", frequency: 0 },
            ],
            frequency: 0,
        },
        {
            category: "Overall Damamge Level",
            detail: [
                { category: "Overall moderate damage", frequency: 0 },
                { category: "Overall severe damage", frequency: 0 },
            ],
            frequency: 0,
        },
        {
            category: "Component Damage Level",
            detail: [
                { category: "Component damage 0", frequency: 0 },
                { category: "Component damage 1", frequency: 0 },
                { category: "Concrete damage", frequency: 0 },
                { category: "Masonry damage", frequency: 0 },
            ],
            frequency: 0,
        },
        {
            category: "Component Type",
            detail: [
                { category: "Column", frequency: 0 },
                { category: "Beam", frequency: 0 },
                { category: "Wall", frequency: 0 },
            ],
            frequency: 0,
        },
        {
            category: "Metadata",
            detail: [
                { category: "GPS", frequency: 0 },
                { category: "Drawing", frequency: 0 },
                { category: "Watch", frequency: 0 },
                { category: "Sign", frequency: 0 },
                { category: "Measurement", frequency: 0 },
            ],
            frequency: 0,
        },
        {
            category: "Miscellaneous",
            detail: [
                { category: "Non-building components", frequency: 0 },
                { category: "Irrelevant images", frequency: 0 },
            ],
            frequency: 0,
        },
    ];
    componentTypeSummary: any[] = [
        { category: "Column", frequency: 0 },
        { category: "Beam", frequency: 0 },
        { category: "Wall", frequency: 0 },
    ];
    locationSummary: any[] = [
        { category: "Building exterior", frequency: 0 },
        { category: "Building interior", frequency: 0 },
    ];
    componentDamageSummary: any[] = [
        { category: "Component damage 0", frequency: 0 },
        { category: "Component damage 1", frequency: 0 },
        { category: "Concrete damage", frequency: 0 },
        { category: "Masonry damage", frequency: 0 },
    ];
    overallDamageSummary: any[] = [
        { category: "Overall moderate damage", frequency: 0 },
        { category: "Overall severe damage", frequency: 0 },
    ];

    //reportSummary: any[] = [];

    constructor(
        private mapsAPILoader: MapsAPILoader,
        private ngZone: NgZone,
        private readonly route: ActivatedRoute,
        private router: Router,
        private readonly reportService: ReportService,
        private readonly imageService: ImageService,
        private readonly reportCollectionService: ReportCollectionService,
        private readonly reportDescriptionService: ReportDescriptionService,
        private filterService: CategoryFilterService,
        private eventManager: EventManager
    ) {
        this.minimumImageDate = null;
        this.maximumImageDate = null;
        this.filter = new CategoryFilter();
        document.oncontextmenu = function () {
            return false;
        };
        this.report = this.route.snapshot.data.report as Report;
        this.categories = this.route.snapshot.data.categories as Category[];
    }

    ngOnInit(): void {
        // Update images in categories
        for (let image of this.report.images) {
            this.AddImageToCategory(image);
            this.UpdateMinMaxImageDates(image);
        }

        // Sort all images by date
        this.SortAllImages();
        this.categorizeImagesDate();
        if (this.report.images.length == 0) {
            this.readyForDownload = false;
        } else {
            this.readyForDownload = true;
        }

        if (!localStorage.getItem("isLogin")) {
            localStorage.setItem("isLogin", "false");
        }

        if (localStorage.getItem("isLogin") == "true") {
            this.islogin = true;
        }

        let json = localStorage.getItem("user");
        if (json) {
            // check if the login user is the creator of this report, which is authorized to modify
            if (this.report.userId.toString() == JSON.parse(json)["id"]) {
                this.authorized = true;
            }

            // chekc if the login user saved this report
            var user = JSON.parse(json);
            for (let rc of user.reportCollections) {
                if (rc.reportID == this.report.id) {
                    this.added = true;
                }
            }
        }

        this.generateDisplayLabels();
        //this.reportSummary = this.reportSummary_init.slice(); // not working
        this.getReportSummary();

        let geo = this.representativeGeoLocation();
        this.latitude = geo.latitude.toFixed(5);
        this.longitude = geo.longitude.toFixed(5);
        this.gmap_latitude = geo.latitude;
        this.gmap_longitude = geo.longitude;

        this.eventManager.addGlobalEventListener("window", "keydown", (event: any) => {
            if (event.keyCode === 116) {
                if (event.preventDefault) {
                    event.preventDefault();
                    this.refresh();
                } else {
                    event.keyCode = 0;
                    event.cancelBubble = true;
                    return false;
                }
            }
        });

        this.mapsAPILoader.load().then(() => {
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
                    this.gmap_latitude = place.geometry.location.lat();
                    this.gmap_longitude = place.geometry.location.lng();
                    this.zoom = 18;
                    let map = document.getElementById("agm-map");
                    if (map) {
                        map.style.height = "300px";
                    }
                    if (place.formatted_address) {
                        this.report.reportDescription.location = place.formatted_address.toString();
                    }
                });
            });
        });
    }

    removeImage(image: Image, element: any) {
        this.imageService.deleteImage(image.id).then(() => {
            const index = this.report.images.indexOf(image);
            if (index > -1) {
                this.report.images.splice(index, 1);
                this.refresh();

                // partial update the report information currently is not working
                //this.reportSummary = this.reportSummary_init;
                //this.getReportSummary();
                //fade(element);
            }
        });

        function fade(element: any) {
            var op = 1; // initial opacity
            var timer = setInterval(function () {
                if (op <= 0.1) {
                    clearInterval(timer);
                    element.style.display = "none";
                }
                element.style.opacity = op;
                element.style.filter = "alpha(opacity=" + op * 100 + ")";
                op -= op * 0.1;
            }, 100);
        }
    }

    markerDragEnd($event: MouseEvent) {
        this.gmap_latitude = $event.coords.lat;
        this.gmap_longitude = $event.coords.lng;
        this.getAddress(this.gmap_latitude, this.gmap_longitude);
    }

    getAddress(gmap_latitude: number, gmap_longitude: number) {
        this.mapsAPILoader.load().then(() => {
            this.geoCoder = new google.maps.Geocoder();
            this.geoCoder.geocode({ location: { lat: gmap_latitude, lng: gmap_longitude } }, (results: any, status: any) => {
                if (status === "OK") {
                    if (results[0]) {
                        this.zoom = 12;
                        this.report.reportDescription.location = results[0].formatted_address;
                    } else {
                        window.alert("No results found");
                    }
                } else {
                    window.alert("Geocoder failed due to: " + status);
                }
            });
        });
    }

    editReportDescription(event: Event): void {
        var btn = event.target as Element;
        var btn_txt = btn.textContent;
        if (btn_txt == "Edit") {
            btn.setAttribute("class", "btn btn-primary");
            var ul = document.getElementById("reportDescription");
            if (ul) {
                var inputs = ul.getElementsByTagName("input")
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].removeAttribute("disabled");
                    inputs[i].style.border = "1px solid #cccccc";
                    inputs[i].style.borderRadius = "4px";
                }
            }
            btn.innerHTML = "Update";
            this.editing = true;
        }
        if (btn_txt == "Update") {
            var ul = document.getElementById("reportDescription");
            if (ul) {
                var inputs = ul.getElementsByTagName("input");
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].setAttribute("disabled", "true");
                    inputs[i].style.border = "1px solid white";
                }
            }
            var taggingOption = <HTMLInputElement>document.querySelector('input[name="tagging"]:checked')
            if (taggingOption) {
                this.report.reportDescription.tagging = taggingOption.value
            }
            this.reportDescriptionService.updateReportDescription(this.report.reportDescriptionId, this.report.reportDescription)
                .then(() => {
                    btn.innerHTML = "Edit";
                    btn.setAttribute("class", "btn btn-default");
                    let map = document.getElementById("agm-map");
                    if (map) {
                        map.style.height = "0";
                    }
                    this.editing = false;
                })
        }
    }

    generateDisplayLabels(): void {
        let report_ic = [];
        // group the categories by their orders
        for (let img of this.report.images) {
            let cat_organized = [
                { order: 10, categories: <any>[] },
                { order: 20, categories: <any>[] },
                { order: 30, categories: <any>[] },
                { order: 40, categories: <any>[] },
                { order: 50, categories: <any>[] },
                { order: 60, categories: <any>[] },
                { order: 70, categories: <any>[] },
            ];
            for (let ic of img.imageCategories) {
                for (let i = 0; i < cat_organized.length; i++) {
                    if (cat_organized[i]["order"] == ic.category.order) {
                        cat_organized[i]["categories"].push({
                            categoryId: ic.categoryId,
                            categoryName: ic.category.name,
                            confidence: ic.confidence,
                            order: ic.category.order,
                        });
                    }
                }
            }
            report_ic.push({ imageId: img.id, categories_organized: cat_organized });
        }

        // loop all the images
        for (let i = 0; i < report_ic.length; i++) {
            let temp_display_cat = [];
            // loop all category groups of one images
            for (let j = 0; j < report_ic[i]["categories_organized"].length; j++) {
                // loop all the categories with the same order number
                let contain_user_defined = false;
                for (let k = 0; k < report_ic[i]["categories_organized"][j]["categories"].length; k++) {
                    let temp = report_ic[i]["categories_organized"][j]["categories"][k];
                    if (temp["confidence"] == 999) {
                        contain_user_defined = true;
                        temp_display_cat.push(temp);
                    }
                }
                if (!contain_user_defined) {
                    for (let k = 0; k < report_ic[i]["categories_organized"][j]["categories"].length; k++) {
                        temp_display_cat.push(report_ic[i]["categories_organized"][j]["categories"][k]);
                    }
                }
            }
            this.display_labels.push({ imageId: report_ic[i]["imageId"], categories: temp_display_cat });
        }
    }

    // Return the duration (ms) between minimum and maximum date of the images
    getDuration(): number {
        let duration = 0;

        if (this.minimumImageDate !== null && this.maximumImageDate !== null) {
            duration = this.maximumImageDate.getTime() - this.minimumImageDate.getTime();
        }

        return duration;
    }

    // Return the time between a date and the minimum image date
    getTimeSinceBeginning(date: Date | null): number {
        let duration = 0;

        if (date !== null && this.minimumImageDate !== null) {
            duration = date.getTime() - this.minimumImageDate.getTime();
        }

        return duration;
    }

    // get report statistics, count the frequency of each category
    getReportSummary(): void {
        for (let image of this.display_labels) {
            for (let ic of image.categories) {
                for (var i in this.reportSummary) {
                    for (var j in this.reportSummary[i]["detail"]) {
                        if (this.reportSummary[i]["detail"][j]["category"] == ic["categoryName"]) {
                            this.reportSummary[i]["detail"][j]["frequency"] += 1;
                            this.reportSummary[i]["frequency"] += 1;
                        }
                    }
                }

                this.locationSummary = this.reportSummary[0]["detail"];
                this.overallDamageSummary = this.reportSummary[2]["detail"];
                this.componentDamageSummary = this.reportSummary[3]["detail"];
                this.componentTypeSummary = this.reportSummary[4]["detail"];
            }
        }
        // filter out 0 values
        this.componentTypeSummary = this.componentTypeSummary.filter((c) => c.frequency != 0);
        this.componentDamageSummary = this.componentDamageSummary.filter((c) => c.frequency != 0);
        this.overallDamageSummary = this.overallDamageSummary.filter((c) => c.frequency != 0);
        this.locationSummary = this.locationSummary.filter((c) => c.frequency != 0);

        // calculate the percentage of each category in summary
        this.calPercentage(this.componentTypeSummary);
        this.calPercentage(this.componentDamageSummary);
        this.calPercentage(this.overallDamageSummary);
        this.calPercentage(this.locationSummary);

        // add category id to summaries
        this.appendCategoryId(this.componentTypeSummary);
        this.appendCategoryId(this.componentDamageSummary);
        this.appendCategoryId(this.overallDamageSummary);
        this.appendCategoryId(this.locationSummary);
    }

    private calPercentage(array: any[]) {
        var sum = 0;
        for (var i in array) {
            sum += array[i].frequency;
        }
        for (var i in array) {
            var percentage = ((100 * array[i].frequency) / sum).toFixed(2);
            array[i]["percentage"] = percentage;
        }
    }

    private appendCategoryId(array: any[]) {
        for (let c of this.categories) {
            for (var i in array) {
                if (array[i].category == c.name) {
                    array[i]["id"] = c.id;
                    continue;
                }
            }
        }
    }

    // Return k best confidence images in overview categories
    getOverviewImages(k: number): Image[] {
        const imageCategories: ImageCategory[] = [];

        for (let category of this.categories) {
            if (category.overviewCategory && category.imageCategories !== null && category.imageCategories.length > 0) {
                // For each image in an overview category
                for (let ic of category.imageCategories) {
                    if (imageCategories.length >= k) {
                        // Find the min confidence element in images
                        let minConfIndex = 0;
                        for (let i = 0; i < imageCategories.length; i++) {
                            if (imageCategories[i].confidence < imageCategories[minConfIndex].confidence) {
                                minConfIndex = i;
                            }
                        }
                        // Replace it, if necessary
                        if (ic.confidence > imageCategories[minConfIndex].confidence) {
                            imageCategories[minConfIndex] = ic;
                        }
                    } else {
                        imageCategories.push(ic);
                    }
                }
            }
        }
        // Sort images by decreasing confidence
        this.SortImageCategoriesByConfidence(imageCategories);
        imageCategories.reverse();
        // Transform ImageCategory[] to Image[]
        const images: Image[] = [];
        for (let ic of imageCategories) {
            images.push(ic.image);
        }
        return images;
    }

    // Return true if the report contains at least one drawing image
    hasDrawingImages(): boolean {
        for (let image of this.report.images) {
            for (let imageCategory of image.imageCategories) {
                if (imageCategory.category !== null && imageCategory.category.drawingCategory) {
                    return true;
                }
            }
        }
        return false;
    }

    // Return true if the report contains at least one Gps image
    hasGpsImages(): boolean {
        for (let image of this.report.images) {
            if (image.hasGpsCoordinates()) {
                return true;
            }
        }
        return false;
    }

    // Return GPS coordinates that are representative of the report
    // If no GPS coordinates are defined for the report, return (0, 0)
    representativeGeoLocation(): GeoLocation {
        // The medoid of all points
        let medoid = new GeoLocation(0, 0);
        let dist_medoid = Number.POSITIVE_INFINITY;

        // Array of total distance for each possible medoid.
        const dist: number[] = [];
        for (let image of this.report.images) {
            if (image.hasGpsCoordinates()) {
                // If the image has GPS coordinates, dist = 0
                dist.push(0);
            } else {
                // Otherwise, dist = INF
                dist.push(Number.POSITIVE_INFINITY);
            }
        }

        // Compute all distances between GPS coordinates
        for (let i = 0; i < this.report.images.length; i++) {
            const image_i = this.report.images[i];
            if (image_i.hasGpsCoordinates()) {
                for (let j = i + 1; j < this.report.images.length; j++) {
                    const image_j = this.report.images[j];
                    if (image_j.hasGpsCoordinates()) {
                        const d = image_i.getGeoLocation().distanceTo(image_j.getGeoLocation());

                        // Update distance for both images.
                        dist[i] += d;
                        dist[j] += d;
                    }
                }
            }
        }

        // Find the medoid
        for (let i = 0; i < dist.length; i++) {
            if (dist[i] < dist_medoid) {
                dist_medoid = dist[i];
                medoid = this.report.images[i].getGeoLocation();
            }
        }
        return medoid;
    }

    downloadReport(): void {
        if (this.report.images.length === 0) {
            window.alert("Please upload images first.");
        } else {
            window.open(this.reportService.getReportDownloadLink(this.report.id));
        }
    }

    downloadLabelsCSV(): void {
        var csv = "filename,categories\n";
        var csv_data = [];
        // extract original file name and store in csv_fn
        for (let image of this.report.images) {
            var filename = image.file.split("\\").pop();
            var csv_fn = "";
            if (filename) {
                var filename_list = filename.split(".");
                if (filename_list) {
                    var file_ext = "." + filename_list.pop();
                    var filename_before_strim = filename_list.pop();
                    if (filename_before_strim) {
                        var filename_words = filename_before_strim.split("_");
                        var word_length = filename_words.length;
                        for (let i = 0; i < word_length - 2; i++) {
                            csv_fn += filename_words[i] + "_";
                        }
                        csv_fn += filename_words[word_length - 2] + file_ext;
                        // commment this line if want to save original file name
                        csv_fn = filename;
                    }
                }
            }

            // extract classified categories, and store as ["c1","c2"]
            let csv_categories = "[";
            if (image.imageCategories.length != 0) {
                for (let i = image.imageCategories.length; i > 0; i--) {
                    if (image.imageCategories[i - 1].confidence != 999) {
                        csv_categories += '"' + image.imageCategories[i - 1].category.name + '";';
                    }
                }
            } else {
                csv_categories += " ";
            }

            csv_categories = csv_categories.slice(0, -1) + "]";
            csv_data.push([csv_fn, csv_categories]);
        }
        //merge the data with CSV
        csv_data.forEach(function (row) {
            csv += row.join(",");
            csv += "\n";
        });

        var hiddenElement = document.createElement("a");
        hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
        hiddenElement.target = "_blank";

        //provide the name for the CSV file to be downloaded
        hiddenElement.download = this.report.name + "_labels.csv";
        //console.log(csv)
        hiddenElement.onclick = function () {
            return confirm("Download automatically classified labels?");
        };
        hiddenElement.click();
    }

    // Called when all images have been uploaded
    uploadFinished(): void {
        // navigate to confirmation page
        //this.router.navigateByUrl("/confirm" + "/" + this.report.id)

        //Update the report
        this.reportService.getReport(this.report.id, false).then(() => {
            // Reuse images from the older version of the report
            //report.images = this.report.images;
            //this.report = report;
            this.reportService.getCompressReport(this.report.id);
            this.readyForDownload = true;
            this.refresh();
        });
    }

    //zhiwei delete report function 04/05
    deleteReport(): void {
        this.reportService.deleteReport(this.report.id).then(() => {
            this.reportDescriptionService.deleteReportDescription(this.report.reportDescriptionId).then(() => {
                var e = document.getElementById("deleteAlert");
                var bg = document.getElementById("bg");
                if (e && bg) {
                    e.className = e.className.replace("hidden", "");
                    bg.style.display = "block";
                }
            });
        });
    }

    //add(remove) report to(from) my collection if the report has been(not been) added to my collection
    toggleCollection() {
        let json = localStorage.getItem("user");
        if (json) {
            var user = JSON.parse(json);
        }
        if (!this.added) {
            this.reportCollectionService.addNewCollection(this.report.id, user.id).then((_) => {
                window.alert("Saved to your collection!");
                this.getUserInfo(user.id);
                this.refresh();
            });
        } else {
            if (window.confirm("Remove report " + this.report.name + " from my collection?")) {
                this.reportCollectionService.removeReport(this.report.id, user.id).then(() => {
                    alert("Successfully removed report " + this.report.name);
                    this.getUserInfo(user.id);
                    this.refresh();
                });
            } else {
                return;
            }
        }
    }

    toggleShare() {
        //TODO temporarily create a temp report to update the report, becuase of the report json is not usable
        let rep = new Report();
        rep.id = this.report.id;
        rep.reportDescriptionId = this.report.reportDescriptionId;
        rep.name = this.report.name;
        rep.date = this.report.date;
        rep.shared = this.report.shared;
        rep.userId = this.report.userId;
        var bg = document.getElementById("bg");
        if (bg) {
            bg.style.display = "block";
        }
        if (this.report.shared) {
            rep.shared = false;
            var e = document.getElementById("unShareAlert");
            if (e && bg) {
                e.className = e.className.replace("hidden", "");
            }
        } else {
            rep.shared = true;
            var element = document.getElementById("shareAlert");
            if (element) {
                element.className = element.className.replace("hidden", "");
            }
        }
        this.reportService.updateReport(rep.id, rep);
    }

    hideAlert(id: string) {
        var element = document.getElementById(id);
        var bg = document.getElementById("bg");
        if (element && bg) {
            element.classList.add("hidden");
            bg.style.display = "none";
        }
        if (id == "deleteAlert") {
            this.router.navigateByUrl("/reports");
        } else {
            this.refresh();
        }
    }

    // Add an image
    addImage(image: Image): void {
        this.AddImageToReport(image);
        this.AddImageToCategory(image);
        this.UpdateMinMaxImageDates(image);

        // Sort all images by date
        this.SortAllImages();
    }

    // Returns true if the image is selected according to the current filters
    filterIsImageSelected(image: Image): boolean {
        const categoryIds: number[] = [];

        for (let img of this.display_labels) {
            if (img["imageId"] == image.id) {
                for (let ic of img["categories"]) {
                    categoryIds.push(ic.categoryId);
                }
            }
        }

        // previous code, before the user define label function is added
        //for (let imageCategory of image.imageCategories) {
        //    categoryIds.push(imageCategory.categoryId);
        //}

        // Return true if at least one of the imageCategories is included in filterCategoryId
        return this.filterService.categoryFilter.check(categoryIds);
    }

    // Add an image to its category in the array this.category
    private AddImageToCategory(image: Image): void {
        for (let ic of image.imageCategories) {
            const category = this.categories.find((c) => c.id === ic.categoryId);

            if (category !== undefined && category !== null) {
                // If images is not initialized
                if (category.imageCategories == null) {
                    category.imageCategories = [];
                }
                if (category.imageCategories.find((c) => c.imageId === ic.imageId)) {
                    return;
                }
                category.imageCategories.push(ic);
                ic.category = category;
                ic.image = image;
            }
        }
    }

    // Add an image to the current report
    private AddImageToReport(image: Image): void {
        if (image.reportId === this.report.id) {
            // If images is not initialized
            if (this.report.images == null) {
                this.report.images = [];
            }
            this.report.images.push(image);
        }
    }

    // Update minimumImageDate and maximumImageDate
    private UpdateMinMaxImageDates(image: Image): void {
        if (image.date !== null) {
            if (this.maximumImageDate === null || image.date.getTime() > this.maximumImageDate.getTime()) {
                this.maximumImageDate = image.date;
            }

            if (this.minimumImageDate === null || image.date.getTime() < this.minimumImageDate.getTime()) {
                this.minimumImageDate = image.date;
            }
        }
    }

    //categorize images by uploading date
    private categorizeImagesDate(): void {
        // TODO optimize the sort algorithm
        var dateString;
        var allDates = [],
            images = [];
        for (let img of this.report.images) {
            dateString = img.date.getFullYear().toString() + "-" + (img.date.getMonth() + 1).toString() + "-" + img.date.getDate().toString();
            if (allDates.indexOf(dateString) == -1) {
                allDates.push(dateString);
            }
        }
        for (let d of allDates) {
            images = [];
            for (let img of this.report.images) {
                dateString = img.date.getFullYear().toString() + "-" + (img.date.getMonth() + 1).toString() + "-" + img.date.getDate().toString();
                if (dateString == d) {
                    images.push(img);
                }
            }
            this.sortedImages.push({
                date: d,
                images: images,
            });
        }
    }

    // Sort all images in the report
    private SortAllImages(): void {
        this.SortImagesByDate(this.report.images);

        for (let category of this.categories) {
            if (category.imageCategories !== null) {
                this.SortImageCategoriesByDate(category.imageCategories);
            }
        }
    }

    // Sort an array of images by date
    private SortImagesByDate(images: Image[]): void {
        images.sort((lhs, rhs) => {
            if (lhs.date.getTime() > rhs.date.getTime()) return -1;
            if (lhs.date.getTime() < rhs.date.getTime()) return 1;
            return 0;
        });
    }

    // Sort an array of imageCategories by date
    private SortImageCategoriesByDate(imageCategories: ImageCategory[]): void {
        imageCategories.sort((lhs, rhs) => {
            if (lhs.image.date.getTime() > rhs.image.date.getTime()) return -1;
            if (lhs.image.date.getTime() < rhs.image.date.getTime()) return 1;
            return 0;
        });
    }

    // Sort an array of images by confidence
    private SortImageCategoriesByConfidence(imageCategories: ImageCategory[]): void {
        imageCategories.sort((lhs, rhs) => {
            if (lhs.confidence < rhs.confidence) return -1;
            if (lhs.confidence > rhs.confidence) return 1;
            return 0;
        });
    }

    private async refresh() {
        this.router.navigateByUrl("/refresh", { skipLocationChange: true }).then((_: any) => {
            //this.router.navigateByUrl("/report" + "/" + this.report.id)
            this.router.navigate(["report", this.report.id]);
        });
    }

    private async getUserInfo(id: string) {
        const response = await fetch("api/User/" + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
        });
        if (response.status === 200) {
            response.json().then((data) => {
                localStorage.setItem("user", JSON.stringify(data));
            });
        }
    }
}
