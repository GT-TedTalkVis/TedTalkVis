const d3plus = require('d3plus-plot');

// Accepts a d3.Selection as a parameter and modifies it.
// This function expects the d3.Selection to be an SVG.
export default function(svg, data) {
  // console.log(data);

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
  svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  const bumpFig = new d3plus.BumpChart()
    .data(data)
    .groupBy("tag")
    .select("#bumpViz")
    .height(svgHeight)
    .label(function(d) {
        return d.tag;
      })
    .x("year")
    .y("rank")
    .render();

  // console.log(bumpFig);

}