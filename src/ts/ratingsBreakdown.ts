import * as d3 from "d3";
import { BaseType } from "d3";
import COLORS from "../colors";

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
  const barHeight = svgWidth / 30;
  const iconHeight = barHeight * 0.8;
  const iconOffset = (barHeight - iconHeight) / 2;

  // Set vis title
  div.append("h2").text("Talk Ratings");
  div.append("hr").attr("color", COLORS.LIGHT_GREY);

  // Create svg
  const svg = div.append("svg").attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  const bar = svg.append("g").attr("id", "ratingsIconBar");

  bar
    .append("rect")
    .attr("width", svgWidth)
    .attr("height", barHeight)
    .attr("fill", COLORS.LIGHT_GREY)
    .attr("rx", barHeight / 6);

  bar
    .append("image")
    .attr("href", "./images/icon_svgs/icon_beautiful.svg")
    .attr("width", iconHeight)
    .attr("height", iconHeight)
    .attr("transform", "translate(" + iconOffset + "," + iconOffset + ")");
}
