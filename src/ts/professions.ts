import * as d3 from "d3";
import { BaseType } from "d3";
import COLORS from "../colors";
import circlePackProfessions from "./circlePackProfessions";
import treemapProfessions from "./treemapProfessions";

type NodeData = {
  [prop: string]: string;
};

// Accepts a d3.Selection as a parameter and modifies it.
// This function expects the d3.Selection to be a div.
export default function(div: d3.Selection<BaseType, unknown, HTMLElement, unknown>, data: d3.DSVRowArray<string>): void {
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

  // Set vis title
  div.append("h2").text("What Do TED Talkers Do For a Living?");
  div.append("hr").attr("color", COLORS.LIGHT_GREY);

  // Enables the dropdown menu to change the view.
  function onProfessionViewChanged(): void {
    const dropdown = d3.select("#viewSelect");

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const category = dropdown._groups[0][0].options[dropdown._groups[0][0].selectedIndex].value;

    console.log(category);

    if (category == "Circle Packing") {
      d3.selectAll(".circlePackNode").style("opacity", "1");
      d3.selectAll(".treemapNode").style("opacity", "0");
    } else {
      d3.selectAll(".circlePackNode").style("opacity", "0");
      d3.selectAll(".treemapNode").style("opacity", "1");
    }
  }

  // Add view selector
  const viewSelector = div.append("select").attr("id", "viewSelect");
  viewSelector
    .append("option")
    .text("Circle Packing")
    .attr("value", "Circle Packing");
  viewSelector
    .append("option")
    .text("Treemap")
    .attr("value", "Treemap");
  viewSelector.on("change", onProfessionViewChanged);

  const svg = div.append("svg").attr("id", "professionsView");

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

  // Add both the circle packing and treemap plots to the svg
  circlePackProfessions(svg, root, svgWidth, svgHeight - margin.top * 2);
  treemapProfessions(svg, root, width, height);
}
