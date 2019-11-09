import * as d3 from "d3";
import { BaseType, HierarchyCircularNode } from "d3";
import COLORS from "../colors";

type NodeData = {
  [prop: string]: string;
};

// Accepts a d3.Selection as a parameter and modifies it.
// This function expects the d3.Selection to be an SVG.
export default function(svg: d3.Selection<BaseType, unknown, HTMLElement, unknown>, data: d3.DSVRowArray<string>): void {
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

  // Convert data to hierarchical form
  const root = d3
    .stratify()
    .id(d => (d as NodeData).profession)
    .parentId(d => {
      if ((d as NodeData).profession != "Root") return "Root";
      else return "";
    })(data)
    .sum(d => +(d as NodeData).count)
    .sort((a, b) => +(b.data as NodeData).count - +(a.data as NodeData).count);

  // Calculate circle packing data
  const circlePack = d3
    .pack()
    .size([svgWidth, svgHeight])
    .padding(3)(root);

  const nodes = svg
    .selectAll(".profession")
    .data(circlePack.leaves())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`)
    .attr("class", "profession");

  nodes
    .append("circle")
    .attr("r", d => d.r)
    .attr("fill", COLORS.TED_RED)
    .attr("stroke", COLORS.LIGHT_GREY)
    .attr("stroke-weight", 5);

  function getSize(d: any): void {
    const bbox = this.getBBox(),
      cbbox = this.parentNode.getBBox(),
      scale = Math.min(cbbox.width / bbox.width, cbbox.height / bbox.height);
    d.data["scale"] = scale;
  }

  nodes
    .append("text")
    .text(d => (d.data as NodeData).profession)
    .style("font-size", "1px")
    .each(getSize)
    .style("font-size", function(d) {
      return (d.data as NodeData)["scale"] + "px";
    })
    .attr("fill", COLORS.LIGHT_GREY)
    .attr("class", "professionLabel");
}
