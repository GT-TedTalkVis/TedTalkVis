import * as d3 from "d3";
import { BaseType } from "d3";
import COLORS from "../colors";
import ToolTip from "./ToolTip";

// Accepts a d3.Selection as a parameter and modifies it.
// This function expects the d3.Selection to be an SVG.
export default function(svg, data) {
  //console.log(data);

  // Set dimensions and margins of svg + graph
  const margin = {
    top: 10,
    right: 30,
    bottom: 80,
    left: 80,
  };
  const svgWidth = 800;
  const svgHeight = 500;
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
  const parseTime = d3.timeParse("%s");
  const dateRange = d3.extent(data, d => parseTime(d["film_date"]));
  //console.log("Date Range: " + dateRange);

  // X axis scale
  const x = d3
    .scaleTime()
    .domain(dateRange)
    .range([0, width]);

  // X axis
  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Compute y axis
  const yExtent = d3.extent(data, d => {
    return +d["views"];
  });

  const y = d3
    .scaleLinear()
    .domain(yExtent)
    .range([height, 0]);
  g.append("g").call(d3.axisLeft(y).tickFormat(d3.format("~s")));

  const tip = ToolTip()
    .attr("class", "d3-tip")
    .html(function(d) {
      return `${d.name}: ${d.views} views`;
    });

  // Append the rectangles
  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("transform", function(d) {
      return "translate(" + x(parseTime(d["film_date"])) + "," + y(+d["views"]) + ")";
    })
    .attr("r", 2)
    .style("opacity", "0.75")
    .style("fill", COLORS.TEAL)
    .call(tip)
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);;

  // Append axis labels
  g.append("text")
    .attr("transform", "translate(-50, 250) rotate(-90)")
    .attr("fill", COLORS.TITLE_WHITE)
    .text("Number of Views");
  g.append("text")
    .attr("transform", "translate(320, 450)")
    .attr("fill", COLORS.TITLE_WHITE)
    .text("Year");
}
