import { ListReport, IListReportProperties } from "./listreport";

export interface IReportPaginatedListProperties {
    reports: IListReportProperties[];
    pageIndex: number;
    totalPages: number;
}

export class ReportPaginatedList {
    reports: ListReport[];
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

    deserialize(input: IReportPaginatedListProperties): ReportPaginatedList {
        this.pageIndex = input.pageIndex;
        this.totalPages = input.totalPages;

        this.reports = [];
        if (input.reports != null) {
            for (let ic of input.reports) {
                const listReport = new ListReport();
                listReport.deserialize(ic);
                this.reports.push(listReport);
            }
        }

        return this;
    }
}
