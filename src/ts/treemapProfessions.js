import * as d3 from "d3";
import COLORS from "../colors";

// Accepts a d3.Selection as a parameter and modifies it.
// This function expects the d3.Selection to be an SVG.
export default function treemapProfessions(svg, root, width, height) {
  // Calculate circle packing data
  const treemap = d3
    .treemap()
    .size([width, height])
    .padding(3)(root);

  const nodes = svg
    .selectAll(".treemapNode")
    .data(treemap.leaves())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x0 + 1},${d.y0 + 1})`)
    .attr("class", "treemapNode")
    .style("opacity", "0");

  nodes
    .append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", COLORS.LIGHT_GREY)
    .attr("stroke", COLORS.LIGHTER_BG)
    .attr("stroke-weight", 5);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getSize(d) {
    const bbox = this.getBBox(),
      cbbox = this.parentNode.getBBox();
    d.data["scale"] = Math.min(cbbox.width / bbox.width, cbbox.height / bbox.height);
  }

  nodes
    .append("text")
    .text(d => d.data.profession)
    .style("font-size", "1px")
    .each(getSize)
    .style("font-size", function(d) {
      return d.data["scale"] + "px";
    })
    .attr("fill", COLORS.DARK_BG)
    .attr("transform", d => "translate(" + (d.x1 - d.x0) / 2 + "," + (d.y1 - d.y0) / 2 + ")")
    .attr("class", "professionLabel");

  return nodes;
}
