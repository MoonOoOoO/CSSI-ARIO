import { Component, ViewEncapsulation, OnInit, Input } from "@angular/core";
import * as d3 from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";

@Component({
    selector: "app-barchart",
    encapsulation: ViewEncapsulation.None,
    templateUrl: "./barchart.component.html",
    styleUrls: ["./barchart.component.css"],
})
/** barchart component*/
export class BarchartComponent implements OnInit {
    @Input() STATISTICS: any[] = [];
    @Input() ID: string = "";
    private width: number = 0;
    private height: number = 0;
    private margin = { top: 10, right: 20, bottom: 120, left: 60 };
    private input_data: any[] = [];

    private x: any;
    private y: any;
    private svg: any;
    private g: any;

    constructor() {
        window.addEventListener("resize", () => {
            this.redrawBarChart();
        });
    }

    ngOnInit() {
        //this.STATISTICS.sort(function (a, b) {
        //    return a.frequency - b.frequency;
        //});
        this.input_data = Array.from(this.STATISTICS);
        this.initSvg();
        this.initAxis();
        this.drawAxis();
        this.drawBars();
        var sort_btn = document.getElementById("byValue");
        var default_btn = document.getElementById("byDefault");
        if (sort_btn) {
            sort_btn.addEventListener(
                "click",
                () => (
                    this.input_data.sort(function (a, b) {
                        return a.frequency - b.frequency;
                    }),
                    this.redrawBarChart()
                )
            );
        }
        if (default_btn) {
            default_btn.addEventListener("click", () => ((this.input_data = Array.from(this.STATISTICS)), this.redrawBarChart()));
        }
    }

    private redrawBarChart() {
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
        this.initAxis();
        this.drawAxis();
        this.drawBars();
    }

    private initSvg() {
        this.svg = d3.select("#" + this.ID + ">svg");
        this.width = +this.svg.node().getBoundingClientRect().width - this.margin.left - this.margin.right;
        this.height = +this.svg.node().getBoundingClientRect().height - this.margin.top - this.margin.bottom;
        this.g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    }

    private initAxis() {
        this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.4);
        this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
        this.x.domain(this.input_data.map((d) => d.category));
        this.y.domain([0, d3Array.max(this.input_data, (d) => d.frequency)]);
    }

    private drawAxis() {
        this.g
            .append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3Axis.axisBottom(this.x))
            .selectAll("text")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");
        this.g.append("g").attr("class", "axis axis--y").call(d3Axis.axisLeft(this.y).ticks(8)).selectAll("text").attr("font-size", "12px");
    }

    private drawBars() {
        var div = d3.select("body").append("div").attr("class", "bartip").style("display", "block").style("opacity", "0").style("transition-duration", "0.3s");
        var bars = this.g
            .selectAll(".bar")
            .data(this.input_data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d: any) => this.x(d.category))
            .attr("y", (d: any) => this.y(d.frequency))
            .attr("width", this.x.bandwidth())
            .attr("height", (d: any) => this.height - this.y(d.frequency));
        bars.on("mouseover", function (d: any) {
            div.style("opacity", "1");
            //div.html("<span style='font-weight: bold;font-size: 14px'>" + d.category + "</span><br />" + d.frequency + " images")
            div.html(function () {
                var inner = "<span style='font-weight: bold;font-size: 14px'>" + d.category + "</span><br />" + d.frequency + " images<br />";
                for (var i in d.detail) {
                    inner += "<span style='font-weight: bold;font-size: 12px'>" + d.detail[i].category + "</span>: " + d.detail[i].frequency + "<br />";
                }
                return inner;
            })
                .style("left", d3.event.pageX + 10 + "px")
                .style("top", d3.event.pageY - 15 + "px")
                .style("width", 200 + "px")
                .style("display", "block");
        }).on("mouseout", () => div.style("opacity", "0").style("display", "none"));
    }
}
