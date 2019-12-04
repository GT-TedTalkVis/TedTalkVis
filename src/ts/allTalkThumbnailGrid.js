import * as d3 from "d3";
import COLORS from "../colors";

export default function(div, data) {

    // SVG size
    const svgWidth = 1110;
    const svgHeight = 900;

    // Thumbnail aspect ratio
    const thumbnailXRatio = 4;
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
    const rows = 50;
    const cols = data.length / rows;

    // Amount of space between each item
    const offset = 5;

    // Size of each unit
    const unitWidth = (svgWidth - ((cols + 1) * offset)) / cols;
    const unitHeight = unitWidth * thumbnailYRatio / thumbnailXRatio;

    // Gets the row and column from the overall index
    // index is the position in the array
    // returns [col, row]
    function getColRow(index) {
        const row = Math.floor(index / rows);
        const col = index % rows;
        return [col, row];
    }

    // Position scaling function based on row and column
    function scaleX(col) {
        return + offset * (col + 1) + unitWidth * col;
    }
    function scaleY(row) {
        return svgHeight - offset * (row + 1) - unitHeight * (row + 1);
    }

    const svg = div.append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const units = svg.selectAll("image")
        .data(data)
        .enter()
        .append("image")
        .attr("class", "thumbnail")
        .attr("href", (d) => thumbnailDirectory + d["thumbnail_path"])
        .attr("width", unitWidth)
        .attr("height", unitHeight)
        .attr("transform", (d, i) => {
            const pos = getColRow(i);
            const x = scaleX(pos[0]);
            const y = scaleY(pos[1]);
            return "translate(" + x + "," + y + ")";
        });


}