import { Category, ICategoryProperties } from "./category";
import { IImageProperties, Image } from "./image";

export interface IImageCategoryProperties {
    imageId: number;
    image: IImageProperties;
    categoryId: number;
    category: ICategoryProperties;
    confidence: number;
}

export class ImageCategory {
    imageId: number;
    image: Image;
    categoryId: number;
    category: Category;
    confidence: number;

    deserialize(input: IImageCategoryProperties): ImageCategory {
        this.imageId = input.imageId;
        this.categoryId = input.categoryId;
        this.confidence = input.confidence;

        if (input.image != null) {
            this.image = new Image();
            this.image.deserialize(input.image);
        }

        if (input.category != null) {
            this.category = new Category();
            this.category.deserialize(input.category);
        }

        return this;
    }
}
