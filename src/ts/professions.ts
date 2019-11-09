import * as d3 from "d3";
import { BaseType } from "d3";
import COLORS from "../colors";

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

  //console.log(data);

  const root = d3
    .stratify()
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .id(d => d.profession)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .parentId(d => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      if (d.profession != "Root") return "Root";
      else return "";
    })(data)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .sum(d => d.count)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .sort((a, b) => b.count - a.count);

  const circlePack = d3
    .pack()
    .size([svgWidth, svgHeight])
    .padding(3)(root);

  //console.log(circlePack)

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

  nodes
    .append("text")
    .attr("text-align", "center")
    .attr("vertical-align", "center")
    .attr("fill", COLORS.LIGHT_GREY)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .text(d => d.data.profession);
}
