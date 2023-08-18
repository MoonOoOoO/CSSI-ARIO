export interface IBridgeCategoryProperties {
    id: number;
    name: string;
    level: number;
}

export class BridgeCategory {
    id: number;
    name: string;
    level: number;

    deserialize(input: IBridgeCategoryProperties): BridgeCategory {
        this.id = input.id;
        this.name = input.name;
        this.level = input.level;
        return this;
    }
}
