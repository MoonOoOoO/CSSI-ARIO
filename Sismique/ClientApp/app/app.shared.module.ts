import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { MomentModule } from "angular2-moment";
import { AgmCoreModule } from "@agm/core";

import { AppComponent } from "./components/app/app.component";
import { AnnouncementComponent } from "./components/announcement/announcement.component";
import { NavMenuComponent } from "./components/navmenu/navmenu.component";
import { HomeComponent } from "./components/home/home.component";
import { ReportsComponent } from "./components/reports/reports.component";
import { ReportsMapComponent } from "./components/reportsmap/reportsmap.component";
import { ReportComponent } from "./components/report/report.component";
import { NewReportComponent } from "./components/newreport/newreport.component";
import { UploadImageComponent } from "./components/uploadimage/uploadimage.component";
import { GoogleMapComponent } from "./components/googlemap/googlemap.component";
import { CategoriesComponent } from "./components/categories/categories.component";
import { CategoryComponent } from "./components/category/category.component";
import { CategoryFilterComponent } from "./components/categoryfilter/categoryfilter.component";
import { TutorialComponent } from "./components/tutorial/tutorial.component";
import { UserComponent } from "./components/user/user.component";
import { ConfirmComponent } from "./components/confirm/confirm.component";
import { RefreshComponent } from "./components/refresh/refresh.component";
import { PiechartComponent } from "./components/piechart/piechart.component";
import { BarchartComponent } from "./components/barchart/barchart.component";
import { BridgeImageComponent } from "./components/bridgeimage/bridgeimage.component";
import { BridgeimagecomparisonComponent } from "./components/bridgeimagecomparison/bridgeimagecomparison.component";

import { UserService } from "./components/shared/user.service";
import { ImageService } from "./components/shared/image.service";
import { ReportService } from "./components/shared/report.service";
import { ReportDescriptionService } from "./components/shared/reportdescription.service";
import { ReportCollectionService } from "./components/shared/reportcollection.service";
import { CategoryService } from "./components/shared/category.service";
import { CategoryTypeService } from "./components/shared/categorytype.service";
import { CategoryFilterService } from "./components/shared/categoryfilter.service";
import { EncrDecrService } from "./components/shared/encr-decr.service";
import { ReportResolver } from "./components/shared/report.resolver";
import { CategoriesResolver } from "./components/shared/categories.resolver";
import { CategoryResolver } from "./components/shared/category.resolver";
import { CategoryTypesResolver } from "./components/shared/categorytypes.resolver";
import { ReportslistComponent } from "./components/reportslist/reportslist.component";
import { BridgeImageService } from "./components/shared/bridgeimage.service";

@NgModule({
    declarations: [
        AppComponent,
        AnnouncementComponent,
        NavMenuComponent,
        HomeComponent,
        ReportComponent,
        ReportsComponent,
        ReportslistComponent,
        ReportsMapComponent,
        NewReportComponent,
        UploadImageComponent,
        GoogleMapComponent,
        CategoriesComponent,
        CategoryComponent,
        CategoryFilterComponent,
        TutorialComponent,
        UserComponent,
        ConfirmComponent,
        RefreshComponent,
        PiechartComponent,
        BarchartComponent,
        BridgeImageComponent,
        BridgeimagecomparisonComponent,
    ],
    providers: [
        UserService,
        ImageService,
        ReportService,
        ReportDescriptionService,
        ReportCollectionService,
        EncrDecrService,
        CategoryService,
        CategoryTypeService,
        CategoryFilterService,
        ReportResolver,
        CategoriesResolver,
        CategoryResolver,
        CategoryTypesResolver,
        FormBuilder,
        BridgeImageService,
    ],
    imports: [
        CommonModule,
        HttpModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MomentModule,
        FormsModule,
        AgmCoreModule.forRoot({
            apiKey: "", // put google map API key here
            libraries: ["places"],
        }),
        RouterModule.forRoot([
            { path: "", redirectTo: "home", pathMatch: "full" },
            { path: "home", component: HomeComponent },
            {
                path: "reports",
                children: [
                    { path: "", component: ReportsComponent },
                    { path: "", outlet: "side-panel", component: ReportslistComponent },
                ],
            },
            { path: "reportsmap", component: ReportsMapComponent },
            {
                path: "report/:id",
                children: [
                    { path: "", component: ReportComponent, resolve: { categories: CategoriesResolver, report: ReportResolver } },
                    { path: "", outlet: "side-panel", component: CategoryFilterComponent, resolve: { categoryTypes: CategoryTypesResolver } },
                ],
            },
            { path: "announcement", component: AnnouncementComponent },
            { path: "newreport", component: NewReportComponent },
            { path: "categories", component: CategoriesComponent, resolve: { categoryTypes: CategoryTypesResolver } },
            { path: "category/:id", component: CategoryComponent, resolve: { category: CategoryResolver } },
            { path: "tutorial", component: TutorialComponent },
            { path: "user", component: UserComponent },
            { path: "confirm/:id", component: ConfirmComponent, resolve: { report: ReportResolver, categories: CategoriesResolver, categoryTypes: CategoryTypesResolver } },
            { path: "refresh", component: RefreshComponent },
            { path: "bridge", component: BridgeImageComponent },
            { path: "bridgecomparison", component: BridgeimagecomparisonComponent },
            { path: "**", redirectTo: "home" },
        ]),
    ],
})
export class AppModuleShared {}
