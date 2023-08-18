import { BridgeImageCategory, IBridgeImageCategoryProperties } from "./bridgeimagecategory";
export interface IBridgeImageProperties {
    id: number;
    file: string;
    date: Date;
    year: number;
    order: number;
    bridgeImageCategories: IBridgeImageCategoryProperties[];
}

export class BridgeImage {
    id: number;
    file: string;
    date: Date;
    year: number;
    order: number;
    bridgeImageCategories: BridgeImageCategory[];

    deserialize(input: IBridgeImageProperties): BridgeImage {
        this.id = input.id;
        this.file = input.file;
        this.date = new Date(input.date);
        this.year = new Date(input.date).getUTCFullYear();

        this.bridgeImageCategories = [];
        if (input.bridgeImageCategories != null) {
            for (let ic of input.bridgeImageCategories) {
                const bic = new BridgeImageCategory();
                bic.deserialize(ic);
                this.bridgeImageCategories.push(bic);
            }
        }
        return this;
    }
}
