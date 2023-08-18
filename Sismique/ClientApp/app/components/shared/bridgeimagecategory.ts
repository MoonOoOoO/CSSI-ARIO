import { BridgeCategory, IBridgeCategoryProperties } from "./bridgecategory";

export interface IBridgeImageCategoryProperties {
    imageId: number;
    categoryId: number;
    category: IBridgeCategoryProperties;
    confidence: number;
}

export class BridgeImageCategory {
    imageId: number;
    categoryId: number;
    category: BridgeCategory;
    confidence: number;

    deserialize(input: IBridgeImageCategoryProperties): BridgeImageCategory {
        this.imageId = input.imageId;
        this.categoryId = input.categoryId;
        this.confidence = input.confidence;

        if (input.category != null) {
            this.category = new BridgeCategory();
            this.category.deserialize(input.category);
        }
        return this;
    }
}
