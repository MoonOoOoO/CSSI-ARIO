import { Image, IImageProperties } from "./image";

export interface IImagePaginatedListProperties {
    images: IImageProperties[];
    pageIndex: number;
    totalPages: number;
}

export class ImagePaginatedList {
    images: Image[];
    pageIndex: number;
    totalPages: number;

    hasPreviousPage(): boolean {
        return this.pageIndex > 1;
    }

    hasNextPage(): boolean {
        return this.pageIndex < this.totalPages;
    }

    previousPage(): number {
        return Math.max(this.pageIndex - 1, 1);
    }

    nextPage(): number {
        return Math.min(this.pageIndex + 1, this.totalPages);
    }

    getPages(): number[] {
        const pages: number[] = [];

        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }

        return pages;
    }

    isCurrentPage(page: number): boolean {
        return page === this.pageIndex;
    }

    deserialize(input: IImagePaginatedListProperties): ImagePaginatedList {
        this.pageIndex = input.pageIndex;
        this.totalPages = input.totalPages;

        this.images = [];
        if (input.images != null) {
            for (let ic of input.images) {
                const image = new Image();
                image.deserialize(ic);
                this.images.push(image);
            }
        }

        return this;
    }
}
