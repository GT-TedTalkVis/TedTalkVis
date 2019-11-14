import * as d3 from "d3";
import { BaseType, ContainerElement } from "d3";
import COLORS from "../colors";
import imageSelector from "./imageSelector";
import ToolTip from "./ToolTip";

type NodeData = {
  [prop: string]: string;
};

// Returns path data for a rectangle with rounded top corners.
// The bottom-left corner is ⟨x,y⟩.
function topRoundedRect(x: number, y: number, width: number, height: number, radius: number): string {
  let path = "M" + x + "," + y + "v" + (-height + radius);
  path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius;
  path += "h" + (width - radius * 2);
  path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius;
  path += "v" + (height - radius) + "z";
  return path;
}

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
  const ratingBarWidth = iconHeight;
  const iconOffset = (barHeight - iconHeight) / 2;
  const pieOuterRadius = height * 0.22;
  const pieInnerRadius = pieOuterRadius * 0.78;

  function updateChart(): void {
    // Get ratings for selected talk or talks
    const dropdown = d3.select("#talkSelector");
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const selectedTalkName = dropdown._groups[0][0].options[dropdown._groups[0][0].selectedIndex].value;

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
      .range([iconHeight / 2, height - iconHeight / 2]);

    const tip = ToolTip()
      .attr("class", "d3-tip")
      .html(function(d: any) {
        return `${d.name}: ${d.count}`;
      });

    // Add bars
    const ratingsG = barG.selectAll(".ratingsG").data(ratings, d => (d as NodeData)["name"]);

    const ratingsEnter = ratingsG
      .enter()
      .append("g")
      .attr("class", "ratingsG")
      .call(tip)
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);

    ratingsEnter
      .append("path")
      .attr("class", "ratingBar")
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

    ratingsEnter
      .append("image")
      .attr("class", "icon-image")
      .attr("href", d => imageSelector((d as NodeData)["name"]))
      .attr("width", iconHeight)
      .attr("height", iconHeight)
      .attr("transform", "translate(0," + iconOffset + ")");

    ratingsG
      .merge(ratingsEnter)
      .transition()
      .duration(750)
      .attr("transform", (d, i) => "translate(" + (ratingsSpacing * (i + 1) + iconHeight * i) + ",0)")
      .select(".ratingBar")
      .attr("d", function(d: NodeData): string {
        const height = yScale(+(d as NodeData)["count"]);
        return topRoundedRect(0, 0, ratingBarWidth, height, barHeight / 6);
      });

    // Add cumulative pie chart
    // Consolidate data
    const pieDataRaw = { good: 0, bad: 0, ok: 0 };
    for (let i = 0; i < ratings.length; i++) {
      switch ((ratings[i] as NodeData)["name"].toLowerCase()) {
        case "confusing":
        case "longwinded":
        case "unconvincing":
          pieDataRaw.bad += +(ratings[i] as NodeData)["count"];
          break;
        case "obnoxious":
        case "ok":
          pieDataRaw.ok += +(ratings[i] as NodeData)["count"];
          break;
        default:
          pieDataRaw.good += +(ratings[i] as NodeData)["count"];
      }
    }
    const voteTotal = pieDataRaw.good + pieDataRaw.bad + pieDataRaw.ok;

    const pieTip = ToolTip()
      .attr("class", "d3-tip")
      .html((d: any) => {
        return `${d.data.key.toUpperCase()}: ${((+d.data.value / d.voteTotal) * 100).toFixed(1)}%`;
      });

    // set the color scale
    const color = d3
      .scaleOrdinal()
      .domain(["good", "bad", "ok"])
      .range([COLORS.BRIGHT_GREEN, COLORS.BRIGHT_RED, COLORS.BRIGHT_ORANGE]);

    const pie = d3.pie().value(function(d: any): number {
      return d.value;
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const pieData = pie(d3.entries(pieDataRaw));
    pieData.forEach((d: any) => {
      d.voteTotal = voteTotal;
    });

    const pieEnter = d3
      .select(".ratingsSVG")
      .selectAll(".pieChart")
      .data(pieData, function(d: any) {
        return d.data.key;
      })
      .enter()
      .append("path")
      .attr("class", "pieChart")
      .attr("fill", function(d: any): string {
        return color(d.data.key) as string;
      })
      .attr("transform", "translate(" + (svgWidth - margin.right - pieOuterRadius) + "," + (margin.top * 3 + pieOuterRadius) + ")")
      .call(pieTip)
      .on("mouseover", pieTip.show)
      .on("mouseout", pieTip.hide);

    const pieUpdate = d3
      .select(".ratingsSVG")
      .selectAll(".pieChart")
      .data(pieData, function(d: any) {
        return d.data.key;
      });

    pieUpdate
      .merge(pieEnter)
      .transition()
      .duration(750)
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(pieInnerRadius)
          .outerRadius(pieOuterRadius),
      );
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
  const svg = div
    .append("svg")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    .attr("class", "ratingsSVG");

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
