import * as d3 from "d3";
import COLORS from "../colors";
import ScrollMagic from "scrollmagic";
import d3Tip from "d3-tip";
import { controller } from "../index";

export default function(div, data) {

    // SVG size
    const svgWidth = 580;
    const svgHeight = 900;

    // Thumbnail aspect ratio
    const thumbnailXRatio = 2;
    const thumbnailYRatio = 3;

    // Path to thumbnail images
    const thumbnailDirectory = "./images/thumbnails/";

    // Set dimensions and margins of svg + graph
    const margin = {
        top: 10,
        right: 30,
        bottom: 80,
        left: 80,
    };

    // Rows and columns in the unit vis
    const rows = 60;
    const cols = data.length / rows;

    // Amount of space between each item
    const offset = 3;

    // Size of each unit
    const smallUnitWidth = (svgWidth - ((cols + 1) * offset)) / cols;
    const smallUnitHeight = smallUnitWidth * thumbnailYRatio / thumbnailXRatio;
    const medUnitWidth = svgWidth * 0.75;
    const medUnitHeight = medUnitWidth * thumbnailYRatio / thumbnailXRatio;
    const largeUnitWidth = svgWidth * 0.75;
    const largeUnitHeight = largeUnitWidth * thumbnailYRatio / thumbnailXRatio;

    // Which view to display
    const views = { first: 0, second: 1, third: 2 };
    let currentView = views.third;

    // Tooltip initialization
    const tip = d3Tip()
        .attr("class", "tooltip")
        .html((d) => d.name);

    // Gets the row and column from the overall index
    // index is the position in the array
    // returns [col, row]
    function getColRow(index) {
        if (currentView === views.first) return [0, 0];
        if (currentView === views.second) {

        }
        const row = Math.floor(index / rows);
        const col = index % rows;
        return [col, row];
    }

    // Position scaling function based on row and column
    function scaleX(col) {
        if (currentView === views.first) return offset * (col + 1) + largeUnitWidth * col;
        else if (currentView === views.second) return offset * (col + 1) + medUnitWidth * col;
        else return offset * (col + 1) + smallUnitWidth * col;
    }
    function scaleY(row) {
        if (currentView === views.first) return offset * (row + 1) + largeUnitHeight * row;
        else if (currentView === views.second) return offset * (row + 1) + medUnitHeight * row;
        else return offset * (row + 1) + smallUnitHeight * row;
    }

    // Call this to check which view to show and update the vis accordingly
    function updateChart(newData) {
        const units = svg.selectAll("image").data(newData, d => d["name"]);

        const unitsEnter = units.enter()
            .append("a")
            .attr("href", d => d.url)
            .attr("target", "_blank")
            .attr("rel", "noopener noreferrer")
            .append("image")
            .attr("class", "thumbnail")
            .attr("width", smallUnitWidth)
            .attr("height", smallUnitHeight)
            .attr("transform", (d, i) => {
                const pos = getColRow(i);
                const x = scaleX(pos[0]);
                const y = scaleY(pos[1]);
                return "translate(" + x + "," + y + ")";
            })
            .call(tip)
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);

        units
            .merge(unitsEnter)
            .attr("xlink:href", (d) => {
                if (currentView === views.first || currentView === views.second) {
                    return d["thumbnail_url"];
                }
                else return thumbnailDirectory + d["thumbnail_path"];
            })
            .transition()
            .duration(750)
            .attr("width", function () {
                if (currentView === views.first) return largeUnitWidth;
                else if (currentView === views.second) return medUnitWidth;
                else return smallUnitWidth;
            })
            .attr("height", function () {
                if (currentView === views.first) return largeUnitHeight;
                else if (currentView === views.second) return medUnitHeight;
                else return smallUnitHeight;
            });

        units.exit().remove();
    }

    // Scollytelling

    // Create divs for scrollytelling
    const svg = div.append("div")
        .attr("class", "thumbnailSVG")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Add scenes to controller
    const scenePhase1 = new ScrollMagic.Scene({
        triggerElement: "#thumbnailsPhase1"
    }).on('start', function() {
        currentView = views.first;
        updateChart(data.slice(0, 1));
    }).addTo(controller);

    const scenePhase2 = new ScrollMagic.Scene({
        triggerElement: "#thumbnailsPhase2"
    }).on('start', function() {
        currentView = views.first;
        updateChart(data.slice(0, 4));
    }).addTo(controller);

    const scenePhase3 = new ScrollMagic.Scene({
        triggerElement: "#thumbnailsPhase3"
    }).on('start', function() {
        currentView = views.third;
        updateChart(data);
    }).addTo(controller);
}