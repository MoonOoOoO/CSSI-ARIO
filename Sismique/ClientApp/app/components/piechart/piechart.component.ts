import { Component, ViewEncapsulation, OnInit, Input } from "@angular/core";
import { CategoryFilterService } from "../shared/categoryfilter.service";
import * as d3 from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Shape from "d3-shape";

@Component({
    selector: "app-piechart",
    encapsulation: ViewEncapsulation.None,
    templateUrl: "./piechart.component.html",
    styleUrls: ["./piechart.component.css"],
})
/** piechart component*/
export class PiechartComponent implements OnInit {
    @Input() STATISTICS: any[] = [];
    @Input() ID: string = "";
    private margin = { top: 40, right: 30, bottom: 30, left: 30 };
    private width: number = 0;
    private height: number = 0;
    private radius: number = 0;

    private arc: any;
    private outerArc: any;
    private pie: any;
    private color: any;
    private svg: any;
    private g: any;
    private total: number = 0;
    private filterService: any;

    constructor(filterService: CategoryFilterService) {
        this.filterService = filterService;
        window.addEventListener("resize", () => {
            let el = document.getElementById(this.ID);
            if (el) {
                let fc = el.firstChild;
                if (fc) {
                    while (fc.firstChild) {
                        fc.removeChild(fc.firstChild);
                    }
                }
            }
            this.initSvg();
            this.drawPie();
            this.drawLegend();
        });
    }

    ngOnInit() {
        for (var i in this.STATISTICS) {
            this.total += this.STATISTICS[i].frequency;
        }
        this.initSvg();
        this.drawPie();
        this.drawLegend();
    }

    private initSvg() {
        this.svg = d3.select("#" + this.ID + ">svg");
        this.width = +this.svg.node().getBoundingClientRect().width - this.margin.left - this.margin.right;
        this.height = +this.svg.node().getBoundingClientRect().height - this.margin.top - this.margin.bottom;
        this.radius = Math.min(this.width, this.height) / 2;
        this.color = d3Scale.scaleOrdinal().range(["#142850", "#27496d", "#0c7b93", "#00a8cc", "#88b7dc", "#b0d0e8", "#ebf3f9"]);
        this.arc = d3Shape
            .arc()
            .outerRadius(this.radius * 0.85)
            .innerRadius(this.radius * 0.55);
        this.outerArc = d3Shape
            .arc()
            .outerRadius(this.radius)
            .innerRadius(this.radius * 0.88);
        this.pie = d3Shape
            .pie()
            .sort(null)
            .value((d: any) => d.frequency);
        this.g = this.svg.append("g").attr("transform", "translate(" + (this.width / 2 + this.margin.left) + "," + (this.height / 2 + this.margin.top * 2) + ")");
        this.g.append("text").attr("text-anchor", "middle").attr("y", -5).html(this.total);
        this.g.append("text").attr("text-anchor", "middle").attr("y", 10).html("Total images");
    }

    private drawPie() {
        let g = this.g.selectAll(".arc").data(this.pie(this.STATISTICS)).enter().append("g").attr("class", "arc");

        var div = d3.select("body").append("div").attr("class", "tooltip");

        g.append("path")
            .attr("d", this.outerArc)
            .style("fill", (d: any) => this.color(d.data.category))
            .style("opacity", "0")
            .attr("id", (d: any) => "outerCategory" + d.data.id);

        g.append("path")
            .attr("d", this.arc)
            .style("fill", (d: any) => this.color(d.data.category))
            .attr("id", (d: any) => "category" + d.data.id)
            .on("mouseover", function (d: any) {
                div.style("opacity", "1");
                div.html("<span style='font-weight: bold;font-size: 14px'>" + d.data.category + "</span><br />" + d.data.percentage + "%<br />" + d.data.frequency + " images")
                    .style("left", d3.event.pageX + 10 + "px")
                    .style("top", d3.event.pageY - 15 + "px")
                    .style("width", 150 + "px")
                    .style("display", "block");
            })
            .on("mouseout", () => div.style("opacity", "0").style("display", "none"))
            .on("click", (d: any) => (this.filterService.toggleCategory(d.data.id), this.filterService.togglePieCategory(d.data.id)));
    }

    private drawLegend() {
        var selected = false;
        var legendG = this.svg
            .selectAll(".legend")
            .data(this.pie(this.STATISTICS))
            .enter()
            .append("g")
            .attr("transform", (d: any, i: number) => "translate(" + 0 + "," + i * 20 + ")")
            .attr("class", "legend");

        legendG
            .append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", (d: any) => this.color(d.data.category))
            .style("opacity", 1);

        legendG
            .append("text")
            .text((d: any) => d.data.category)
            .style("font-size", 16)
            .style("font-family", '"Helvetica Neue", Helvetica, Arial, sans-serif')
            .attr("id", (d: any) => "legendCategory" + d.data.id)
            .attr("x", 20)
            .attr("y", 10);
        //.on('click', (d: any) => (
        //    this.filterService.toggleCategory(d.data.id),
        //    d3.select("#legendCategory" + d.data.id).style("font-weight", function (d: any) {
        //        if (!selected) {
        //            selected = !selected;
        //            return "bold";
        //        }
        //        else {
        //            selected = !selected;
        //            return "normal";
        //        }
        //    }),
        //    d3.select("#outerCategory" + d.data.id).style("opacity", function () {
        //        if (!selected)
        //            return "0.7"
        //        else
        //            return "0"
        //    }),
        //    d3.select("#legendCategory" + d.data.id).style("font-weight", function () {
        //        if (!selected)
        //            return "bold"
        //        else
        //            return "normal"
        //    })
        //))
        //.on('mouseover', function (d: any) {
        //    d3.select("#category" + d.data.id).style("opacity", "1");
        //    d3.select("#outerCategory" + d.data.id).style("opacity", "0.7");
        //    d3.select("#outerCategory" + d.data.id).style("transition-duration", "0.3s");
        //    d3.select("#legendCategory" + d.data.id).style("font-weight", "bold");
        //})
        //.on('mouseout', function (d: any) {
        //    d3.select("#outerCategory" + d.data.id).style("opacity", "0");
        //    d3.select("#outerCategory" + d.data.id).style("transition-duration", "0.3s");
        //    d3.select("#legendCategory" + d.data.id).style("font-weight", "normal");
        //});
    }
}
