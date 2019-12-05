import * as d3 from "d3";
import COLORS from "../colors";

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
  svg.attr("width", svgWidth);
  svg.attr("height", svgHeight);
  // svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  // Inner group
  const g = svg.append("g");
  g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Get min and max year
  const yearRange = d3.extent(data, d => parseInt(d["year"], 10));
  //console.log(yearRange);

  // X axis
  const x = d3
    .scaleLinear()
    .domain(yearRange)
    .range([0, width]);

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  // set the parameters for the histogram
  const histogram = d3
    .histogram()
    .domain(x.domain()) // Type assertion. x.domain() returns number[], but d3.histogram().domain() expects [number, number]
    .thresholds(x.ticks(yearRange[1] - yearRange[0]));

  // Get histogram data in Number type.
  const yearList = data.map(talk => parseInt(talk["year"], 10));
  //console.log(yearList);

  // Use histogram() to compute bins
  const bins = histogram(yearList);

  // Compute y axis now that we have counts
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([height, 0]);
  g.append("g").call(d3.axisLeft(y));

  // Append rectangles
  g.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("x", 1)
    .attr("transform", function(d) {
      return "translate(" + x(d.x0) + "," + y(d.length) + ")";
    })
    .attr("width", function(d) {
      return x(d.x1) - x(d.x0) - 1;
    })
    .attr("height", function(d) {
      return height - y(d.length);
    })
    .style("fill", COLORS.TED_RED);

  // Append axis labels
  g.append("text")
    .attr("transform", "translate(-50, 250) rotate(-90)")
    .attr("fill", COLORS.TITLE_WHITE)
    .text("Number of talks");
  g.append("text")
    .attr("transform", "translate(320, 450)")
    .attr("fill", COLORS.TITLE_WHITE)
    .text("Year");
}
