import * as d3 from "d3";
import { BaseType } from "d3";
import COLORS from "../colors";
import imageSelector from "./imageSelector";

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
  const barHeight = svgWidth / 30;
  const iconHeight = barHeight * 0.8;
  const iconOffset = (barHeight - iconHeight) / 2;

  function updateChart(): void {
    // Get ratings for selected talk or talks
    const dropdown = d3.select("#talkSelector");
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const selectedTalkName = dropdown._groups[0][0].options[dropdown._groups[0][0].selectedIndex].value;

    console.log(selectedTalkName);

    // Find selected row
    let selectedRow = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i]["name"] == selectedTalkName) {
        selectedRow = i;
        break;
      }
    }

    // Get ratings at selected row
    const rawString = data[selectedRow]["ratings"];
    const ratingsString = rawString.replace(/'/g, '"');
    const ratings = JSON.parse(ratingsString);
    ratings.sort(function(a: { [x: string]: number }, b: { [x: string]: number }) {
      return +b["count"] - +a["count"];
    });
    const numRatingCategories = ratings.length;
    const ratingsSpacing = (svgWidth - iconHeight * numRatingCategories) / (numRatingCategories + 1);
    const ratingDomain = d3.extent(ratings, d => +(d as NodeData)["count"]);
    const barG = d3.select("#ratingsIconBarGroup");
    const yScale = d3
      .scaleLinear()
      .domain([0, ratingDomain[1]])
      .range([iconHeight / 2, svgHeight - margin.bottom - iconHeight / 2]);
    console.log(ratings);

    // Add bars
    const ratingBars = barG.selectAll(".ratingBar").data(ratings, d => (d as NodeData)["name"]);

    const ratingBarsEnter = ratingBars
      .enter()
      .insert("rect", "#iconBar")
      .attr("class", "ratingBar")
      .attr("width", iconHeight)
      .attr("height", d => yScale(+(d as NodeData)["count"]))
      .attr("rx", barHeight / 6)
      .attr("fill", function(d): string {
        switch ((d as NodeData)["name"].toLowerCase()) {
          case "confusing":
          case "longwinded":
          case "unconvincing":
            return COLORS.BRIGHT_RED;
          case "obnoxious":
          case "ok":
            return COLORS.BRIGHT_ORANGE;
          default:
            return COLORS.BRIGHT_GREEN;
        }
      });

    ratingBars
      .merge(ratingBarsEnter)
      .transition()
      .duration(750)
      .attr("transform", (d, i) => "translate(" + (ratingsSpacing * (i + 1) + iconHeight * i) + "," + -(yScale(+(d as NodeData)["count"]) - iconHeight / 2) + ")")
      .attr("height", d => yScale(+(d as NodeData)["count"]));

    // Add icons
    const icons = barG.selectAll(".icons").data(ratings, d => (d as NodeData)["name"]);
    const iconsEnter = icons
      .enter()
      .append("image")
      .attr("href", d => imageSelector((d as NodeData)["name"]))
      .attr("class", "icons")
      .attr("width", iconHeight)
      .attr("height", iconHeight);

    icons
      .merge(iconsEnter)
      .transition()
      .duration(750)
      .attr("transform", (d, i) => "translate(" + (ratingsSpacing * (i + 1) + iconHeight * i) + "," + iconOffset + ")");
    console.log(icons);
  }

  // Set vis title
  div.append("h2").text("Talk Ratings");
  div.append("hr").attr("color", COLORS.LIGHT_GREY);

  // Add talk selector
  const talkSelector = div
    .append("select")
    .attr("id", "talkSelector")
    .style("width", width + "px");
  for (let i = 0; i < data.length; i++) {
    talkSelector
      .append("option")
      .attr("value", data[i]["name"])
      .text(data[i]["name"]);
  }
  talkSelector.on("change", updateChart);

  // Create svg
  const svg = div.append("svg").attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  // Create blank ratings bar
  const bar = svg
    .append("g")
    .attr("id", "ratingsIconBarGroup")
    .attr("transform", "translate(0," + (svgHeight - margin.bottom) + ")");
  bar
    .append("rect")
    .attr("id", "iconBar")
    .attr("width", svgWidth)
    .attr("height", barHeight)
    .attr("fill", COLORS.LIGHT_GREY)
    .attr("rx", barHeight / 6);

  updateChart();
}
