import { HttpEventType } from "@angular/common/http";
import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { forkJoin } from "rxjs/observable/forkJoin";
import { IImageProperties, Image } from "../shared/image";
import { ImageService } from "../shared/image.service";
import { Report } from "../shared/report";
import { ReportComponent } from "../report/report.component";

@Component({
    selector: "upload-image",
    templateUrl: "./uploadimage.component.html",
    styleUrls: ["./uploadimage.component.css"],
    providers: [ImageService],
})

export class UploadImageComponent implements OnInit {
    @Input() report: Report;
    @Output() imageUploaded = new EventEmitter<Image>();
    @Output() uploadFinished = new EventEmitter<any>();

    //files: FileList;
    files: File[] = [];

    // State
    selectFiles: boolean = false;
    filesValid: boolean = false;
    uploading: boolean = false;

    // Progress
    total_size: number = 0;
    total_transfer: number = 0;
    file_progress: number[] = [];
    progress: number = 0;

    constructor(private readonly imageService: ImageService,
        private reportComponent: ReportComponent) { }

    ngOnInit() {
        this.ToReadyState();
    }

    onFileChange(files: File[]): void {
        if (files.length > 0) {
            let fileNames = []
            for (let f of this.files) {
                fileNames.push(f.name);
            }
            for (let i = 0; i < files.length; i++) {
                // if the file doesn't exist in the file list
                if (fileNames.indexOf(files[i].name) == -1) {
                    this.files.push(files[i]);
                }
            }
            this.selectFiles = true;
        }
        this.validateFileList();
    }

    validateFile(file: File) {
        var extensions = ["gif", "png", "jpeg", "jpg", "jfif"];
        var file_ext = file.name.split(".").pop();
        var valid = true;
        if (file_ext) {
            file_ext = file_ext.toLowerCase();
            if (extensions.indexOf(file_ext) == -1) {
                valid = false;
            }
            else {
                let preview = document.getElementById("img-" + file.name);
                if (preview && preview.getAttribute("src") == "#") {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        if (preview) {
                            preview.setAttribute("src", String(reader.result));
                        }
                    }
                }
            }
        }
        return valid;
    }

    validateFileList() {
        if (this.files.length == 0) {
            this.filesValid = false;
            return;
        }
        this.filesValid = true;
        for (let i = 0; i < this.files.length; i++) {
            if (this.validateFile(this.files[i]) == false) {
                this.filesValid = false;
            }
        }
    }

    removeImageFromList(file: File, element: any) {
        const index = this.files.indexOf(file);
        if (index > -1) {
            this.files.splice(index, 1);
            element.style.display = "none";
        }
        this.validateFileList();
    }

    resetImageSelection() {
        this.files = [];
        this.selectFiles = false;
        this.filesValid = false;
    }

    private InitProgress(): void {
        this.total_size = 0;
        this.file_progress = [];
        this.progress = 0;
    }

    private UpdateProgress(index: number): void {
        // const sum = this.file_progress.reduce((a, b) => a + b, 0);
        // this.progress = Math.round((100 * sum) / this.total_size);
        this.total_transfer = index + 1;
        this.progress = Math.round((100 * this.total_transfer) / this.files.length);
        this.uploading = true;
    }

    private ToReadyState(): void {
        this.selectFiles = false;
        this.filesValid = false;
        this.reportComponent.readyForDownload = true;
        this.files = [];
        this.progress = 0;
        this.uploading = false;
    }

    onSubmit(): void {
        if (this.files !== undefined && this.files.length > 0) {
            // Start uploading
            this.uploading = true;

            // An array of all uploaded images
            const images: Image[] = [];

            // Prepare all requests
            const requests: Observable<void>[] = [];
            for (let i = 0; i < this.files.length; i++) {
                images.push(new Image());
                // Update total_size and progress with file i
                this.total_size += this.files[i].size;
                this.file_progress.push(0);
                requests.push(
                    this.imageService.uploadImage(this.report.id, this.files[i]).map((event) => {
                        switch (event.type) {
                            case HttpEventType.UploadProgress:
                                // Update progress for this file.
                                this.file_progress[i] = event.loaded;
                                this.UpdateProgress(i);
                                break;
                            case HttpEventType.Response:
                                if (event.ok && event.body !== null) {
                                    images[i].deserialize(event.body as IImageProperties);
                                }
                                break;
                        }
                    })
                );
            }

            // Execute all requests, once all are complete, toggle uploading flag
            forkJoin(requests).subscribe(() => {
                // Emit new image signal for all images
                for (let image of images) {
                    this.imageUploaded.emit(image);
                }
                // Emit a last signal
                this.uploadFinished.emit(null);
                // Finish uploading
                this.ToReadyState();
            });
        }
    }
}
