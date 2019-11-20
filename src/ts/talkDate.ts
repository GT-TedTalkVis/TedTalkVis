import * as d3 from "d3";
import { BaseType } from "d3";
import COLORS from "../colors";

// Accepts a d3.Selection as a parameter and modifies it.
// This function expects the d3.Selection to be an SVG.
export default function(svg: d3.Selection<BaseType, unknown, HTMLElement, unknown>, data: d3.DSVRowArray<string>): void {
  // Remove archival talks, which were before 1984.
  // Then, sort talks by year in ascending order.
  const tedData = data.filter(talk => parseInt(talk["year"], 10) >= 1984).sort((a, b) => parseInt(a["year"], 10) - parseInt(b["year"], 10));

  // Set dimensions and margins of svg + graph
  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };
  const svgWidth = 800;
  const svgHeight = 500;
  // Set width and height of svg using the viewBox attribute, which allows for automatic scaling.
  svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  // Set the width and height of the chart, which is another group inside the SVG tags.
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  // Inner group
  const chart = svg.append("g");
  chart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Get min and max year
  const yearRange = d3.extent(data, d => parseInt(d["year"], 10));

  // Calculate the number of years in the range
  console.log(yearRange);
  console.log(yearRange[1] - yearRange[0] + 1);
}
