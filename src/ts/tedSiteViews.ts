import * as d3 from "d3";
import { BaseType } from "d3";
import COLORS from "../colors";

// Accepts a d3.Selection as a parameter and modifies it.
// This function expects the d3.Selection to be an SVG.
export default function(svg: d3.Selection<BaseType, unknown, HTMLElement, unknown>, data: d3.DSVRowArray<string>): void {
  //console.log(data);

  // Set dimensions and margins of svg + graph
  const margin = {
    top: 10,
    right: 30,
    bottom: 80,
    left: 80,
  };
  const svgWidth = 800;
  const svgHeight = 600;
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  // Set width and height of svg
  // svg.attr("width", svgWidth);
  // svg.attr("height", svgHeight);
  svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  // Inner group
  const g = svg.append("g");
  g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Get min and max year
  const dateRange = d3.extent(data, d => +d["film_date"]);
  console.log(dateRange);

  // X axis
  const x = d3
    .scaleLinear()
    .domain(dateRange)
    .range([0, width]);

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  // Compute y axis
  const yExtent = d3.extent(data, d => {
    return +d["views"];
  })

  const y = d3
    .scaleLinear()
    .domain(yExtent)
    .range([height, 0]);
  g.append("g").call(d3.axisLeft(y));

  // Append rectangles
  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("transform", function(d) {
      return "translate(" + x(parseInt(d["film_date"], 10)) + "," + y(+d["views"]) + ")";
    })
    .attr("r", 2)
    .style("fill", COLORS.TEAL);

  // Append axis labels
  g.append("text")
    .attr("transform", "translate(-50, 300) rotate(-90)")
    .attr("fill", COLORS.TITLE_WHITE)
    .text("Number of Views");
  g.append("text")
    .attr("transform", "translate(320, 550)")
    .attr("stroke-width", 0)
    .attr("opacity", "0.5")
    .attr("fill", COLORS.TITLE_WHITE)
    .text("Year");
}
