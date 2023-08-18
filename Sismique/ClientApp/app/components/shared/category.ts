import { ImageCategory, IImageCategoryProperties } from "./imagecategory";

export interface ICategoryProperties {
    id: number;
    name: string;
    order: number;
    overviewCategory: boolean;
    drawingCategory: boolean;
    visible: boolean;
    imageCategories: IImageCategoryProperties[];
}

export class Category {
    id: number;
    name: string;
    order: number;
    overviewCategory: boolean;
    drawingCategory: boolean;
    visible: boolean;
    imageCategories: ImageCategory[];

    deserialize(input: ICategoryProperties): Category {
        this.id = input.id;
        this.name = input.name;
        this.order = input.order;
        this.overviewCategory = input.overviewCategory;
        this.drawingCategory = input.drawingCategory;
        this.visible = input.visible;

        this.imageCategories = [];
        if (input.imageCategories != null) {
            for (let ic of input.imageCategories) {
                const imageCategories = new ImageCategory();
                imageCategories.deserialize(ic);
                this.imageCategories.push(imageCategories);
            }
        }
        return this;
    }
}
