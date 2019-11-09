import * as d3 from "d3";
import { BaseType, HierarchyCircularNode } from "d3";
import COLORS from "../colors";

type NodeData = {
  [prop: string]: string;
};

// Accepts a d3.Selection as a parameter and modifies it.
// This function expects the d3.Selection to be an SVG.
export default function circlePackProfessions(
  svg: d3.Selection<BaseType, unknown, HTMLElement, unknown>,
  root: d3.HierarchyNode<unknown>,
  width: number,
  height: number,
): d3.Selection<SVGGElement, HierarchyCircularNode<unknown>, BaseType, unknown> {
  // Calculate circle packing data
  const circlePack = d3
    .pack()
    .size([width, height])
    .padding(3)(root);

  const nodes = svg
    .selectAll(".circlePackNode")
    .data(circlePack.leaves())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`)
    .attr("class", "circlePackNode")
    .style("opacity", "1");

  nodes
    .append("circle")
    .attr("r", d => d.r)
    .attr("fill", COLORS.TED_RED)
    .attr("stroke", COLORS.LIGHT_GREY)
    .attr("stroke-weight", 5);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getSize(d: any): void {
    const bbox = this.getBBox(),
      cbbox = this.parentNode.getBBox();
    d.data["scale"] = Math.min(cbbox.width / bbox.width, cbbox.height / bbox.height);
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

  return nodes;
}
