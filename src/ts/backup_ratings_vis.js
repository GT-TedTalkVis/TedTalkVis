import * as d3 from "d3";
import COLORS from "../colors";
import imageSelector from "./imageSelector";
import ToolTip from "./ToolTip";


// Returns path data for a rectangle with rounded top corners.
// The bottom-left corner is ⟨x,y⟩.
function topRoundedRect(x, y, width, height, radius) {
  let path = "M" + x + "," + y + "v" + (-height + radius);
  path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius;
  path += "h" + (width - radius * 2);
  path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius;
  path += "v" + (height - radius) + "z";
  return path;
}

// Accepts a d3.Selection as a parameter and modifies it.
// This function expects the d3.Selection to be a div.
export default function(div, data) {
  // Set dimensions and margins of svg + graph
  const margin = {
    top: 10,
    right: 30,
    bottom: 80,
    left: 80,
  };

  let windowHeight = window.innerHeight;
  let windowWidth = window.innerWidth;
  let svgWidth = windowWidth - margin.left - margin.right;
  let svgHeight = windowHeight - margin.bottom - margin.top;
  let barHeight = svgWidth / 30;
  let iconHeight = barHeight * 0.8;
  let ratingBarWidth = iconHeight;
  let iconOffset = (barHeight - iconHeight) / 2;
  let pieOuterRadius = svgHeight * 0.22;
  let pieInnerRadius = pieOuterRadius * 0.78;

  window.onresize = () => {
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
    svgWidth = windowWidth - margin.left - margin.right;
    svgHeight = windowHeight - margin.bottom - margin.top;
    barHeight = svgWidth / 30;
    iconHeight = barHeight * 0.8;
    ratingBarWidth = iconHeight;
    iconOffset = (barHeight - iconHeight) / 2;
    pieOuterRadius = svgHeight * 0.22;
    pieInnerRadius = pieOuterRadius * 0.78;
    updateChart();
  };

  function updateChart() {
    // Get ratings for selected talk or talks
    const dropdown = d3.select("#talkSelector");
    const selectedTalkName = dropdown._groups[0][0].options[dropdown._groups[0][0].selectedIndex].value;

    // Find selected row
    let selectedRow = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i]["name"] === selectedTalkName) {
        selectedRow = i;
        break;
      }
    }

    // Get ratings at selected row
    const rawString = data[selectedRow]["ratings"];
    const ratingsString = rawString.replace(/'/g, '"');
    const ratings = JSON.parse(ratingsString);
    ratings.sort(function(a, b) {
      return +b["count"] - +a["count"];
    });
    const numRatingCategories = ratings.length;
    const ratingsSpacing = (svgWidth - iconHeight * numRatingCategories) / (numRatingCategories + 1);
    const ratingDomain = d3.extent(ratings, d => +(d)["count"]);
    const barG = d3.select("#ratingsIconBarGroup");
    const yScale = d3
      .scaleLinear()
      .domain([0, ratingDomain[1]])
      .range([0, svgHeight - iconHeight / 2]);

    const tip = ToolTip()
      .attr("class", "d3-tip")
      .html(function(d) {
        return `${d.name}: ${d.count}`;
      });

    // Add bars
    const ratingsG = barG.selectAll(".ratingsG").data(ratings, d => (d)["name"]);

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
      .attr("fill", function(d) {
        switch ((d)["name"].toLowerCase()) {
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
      .attr("href", d => imageSelector((d)["name"]))
      .attr("width", iconHeight)
      .attr("height", iconHeight)
      .attr("transform", "translate(0," + iconOffset + ")");

    ratingsG
      .merge(ratingsEnter)
      .transition()
      .duration(750)
      .attr("transform", (d, i) => "translate(" + (ratingsSpacing * (i + 1) + iconHeight * i) + ",0)")
      .select(".ratingBar")
      .attr("d", function(d) {
        const height = yScale(+(d)["count"]);
        return topRoundedRect(0, 0, ratingBarWidth, height, barHeight / 6);
      });

    // Add cumulative pie chart
    // Consolidate data
    const pieDataRaw = { good: 0, bad: 0, ok: 0 };
    for (let i = 0; i < ratings.length; i++) {
      switch ((ratings[i])["name"].toLowerCase()) {
        case "confusing":
        case "longwinded":
        case "unconvincing":
          pieDataRaw.bad += +(ratings[i])["count"];
          break;
        case "obnoxious":
        case "ok":
          pieDataRaw.ok += +(ratings[i])["count"];
          break;
        default:
          pieDataRaw.good += +(ratings[i])["count"];
      }
    }
    const voteTotal = pieDataRaw.good + pieDataRaw.bad + pieDataRaw.ok;

    const pieTip = ToolTip()
      .attr("class", "d3-tip")
      .html((d) => {
        return `${d.data.key.toUpperCase()}: ${((+d.data.value / d.voteTotal) * 100).toFixed(1)}%`;
      });

    // set the color scale
    const color = d3
      .scaleOrdinal()
      .domain(["good", "bad", "ok"])
      .range([COLORS.BRIGHT_GREEN, COLORS.BRIGHT_RED, COLORS.BRIGHT_ORANGE]);

    const pie = d3.pie().value(function(d) {
      return d.value;
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const pieData = pie(d3.entries(pieDataRaw));
    pieData.forEach((d) => {
      d.voteTotal = voteTotal;
    });

    const pieEnter = d3
      .select(".ratingsSVG")
      .selectAll(".pieChart")
      .data(pieData, function(d) {
        return d.data.key;
      })
      .enter()
      .append("path")
      .attr("class", "pieChart")
      .attr("fill", function(d) {
        return color(d.data.key);
      })
      .attr("transform", "translate(" + (svgWidth - margin.right - pieOuterRadius) + "," + (margin.top * 3 + pieOuterRadius) + ")")
      .call(pieTip)
      .on("mouseover", pieTip.show)
      .on("mouseout", pieTip.hide);

    const pieUpdate = d3
      .select(".ratingsSVG")
      .selectAll(".pieChart")
      .data(pieData, function(d) {
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
    .style("width", svgWidth + "px");
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
    .attr("transform", "translate(" + margin.left + "," + (svgHeight - margin.bottom) + ")");
  bar
    .append("rect")
    .attr("id", "iconBar")
    .attr("width", svgWidth - margin.left - margin.right)
    .attr("height", barHeight)
    .attr("fill", COLORS.LIGHT_GREY)
    .attr("rx", barHeight / 6);

  updateChart();
}
