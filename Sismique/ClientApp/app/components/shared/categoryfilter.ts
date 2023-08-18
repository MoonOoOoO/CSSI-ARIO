export enum CategoryFilterMode {
    Union,
    Intersection,
}

export class CategoryFilter {
    private categoryIds: number[];
    private filterMode: CategoryFilterMode;

    constructor() {
        this.reset();
    }

    hasCategory(categoryId: number): boolean {
        // If the filter contains no category, all categories are selected
        if (this.categoryIds.length === 0) {
            return true;
        } else {
            // If the filter contains at least one category, then we search if categoryId is selected
            return this.categoryIds.indexOf(categoryId) > -1;
        }
    }

    reset(): void {
        this.categoryIds = [];
        this.filterMode = CategoryFilterMode.Union;
    }

    setFilterMode(mode: CategoryFilterMode): void {
        this.filterMode = mode;
    }

    toggleCategory(categoryId: number): void {
        const index = this.categoryIds.indexOf(categoryId);
        if (index > -1) {
            this.categoryIds.splice(index, 1);
        } else {
            this.categoryIds.push(categoryId);
        }
    }

    addCategory(categoryId: number): void {
        if (!this.hasCategory(categoryId)) {
            this.categoryIds.push(categoryId);
        }
    }

    removeCategory(categoryId: number): void {
        const index = this.categoryIds.indexOf(categoryId);
        if (index > -1) {
            this.categoryIds.splice(index, 1);
        }
    }

    // Check if a set of category ids is selected according to this filter
    // According to the filterMode, call either CheckUnion or CheckIntersection
    check(categoryIds: number[]): boolean {
        let value: boolean = false;

        switch (this.filterMode) {
            case CategoryFilterMode.Union:
                value = this.CheckUnion(categoryIds);
                break;
            case CategoryFilterMode.Intersection:
                value = this.CheckIntersection(categoryIds);
                break;
        }

        return value;
    }

    // Check if a set of category ids is selected according to this filter
    // If at least one category in categoryIds is selected by the filter, returns true
    private CheckUnion(categoryIds: number[]): boolean {
        for (let id of categoryIds) {
            if (this.hasCategory(id)) {
                return true;
            }
        }

        return false;
    }

    // Check if a set of category ids is selected according to this filter
    // If all categories in the filter are present in categoryIds, returns true
    private CheckIntersection(categoryIds: number[]): boolean {
        for (let id of this.categoryIds) {
            if (categoryIds.indexOf(id) <= -1) {
                return false;
            }
        }

        return true;
    }
}
