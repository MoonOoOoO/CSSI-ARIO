import { Category, ICategoryProperties } from "./category";

export interface ICategoryTypeProperties {
    id: number;
    name: string;
    order: number;
    categories: ICategoryProperties[];
}

export class CategoryType {
    id: number;
    name: string;
    order: number;
    categories: Category[];

    deserialize(input: ICategoryTypeProperties): CategoryType {
        this.id = input.id;
        this.name = input.name;
        this.order = input.order;

        this.categories = [];
        if (input.categories != null) {
            for (let c of input.categories) {
                const category = new Category();
                category.deserialize(c);
                this.categories.push(category);
            }
        }

        return this;
    }
}
