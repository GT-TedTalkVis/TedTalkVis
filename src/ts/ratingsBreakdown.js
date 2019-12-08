import * as d3 from "d3";
import COLORS from "../colors";
import d3Tip from "d3-tip";
import { updateResults } from "./talkExplorer";
import * as jq from "jquery";

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

const ratingCategories = [
    ["Beautiful", "icon_beautiful.svg"],
    ["Courageous", "icon_courageous.svg"],
    ["Fascinating", "icon_fascinating.svg"],
    ["Funny", "icon_funny.svg"],
    ["Informative", "icon_informative.svg"],
    ["Ingenious", "icon_ingenious.svg"],
    ["Inspiring", "icon_inspiring.svg"],
    ["Jaw-dropping", "icon_jaw-dropping.svg"],
    ["Persuasive", "icon_persuasive.svg"],
    ["Confusing", "icon_confusing.svg"],
    ["Longwinded", "icon_longwinded.svg"],
    ["Obnoxious", "icon_obnoxious.svg"],
    ["OK", "icon_ok.svg"],
    ["Unconvincing", "icon_unconvincing.svg"],
];

// Sizes (in percentage of svg size)
const barWidth = 75;                            // Width of the icon bar
const barHeight = 6;                            // Height of the icon bar
const barCorners = 0.75;                        // Radius of icon bar corners
const iconRelativeSize = 0.8;                   // Size of the icons relative to the height of the ratings bar
const iconSize = barHeight * iconRelativeSize;  // The width and height of the rating icons
const iconOffset = (barWidth - (barWidth * (ratingCategories.length * (iconSize / barWidth)))) / (ratingCategories.length + 1);
const chartBarWidth = barWidth * 0.04;           // The width of each bar in the bar chart
const pieInnerRadius = 0.75;                     // The percentage of the inner radius to outer radius
const pieOffset = 3;                             // The space (in percentage of total size) between the pie chart and the edges

// Ratings tracker
let ratings = [
    ["Beautiful", 0],
    ["Courageous", 0],
    ["Fascinating", 0],
    ["Funny", 0],
    ["Informative", 0],
    ["Ingenious", 0],
    ["Inspiring", 0],
    ["Jaw-dropping", 0],
    ["Persuasive", 0],
    ["Confusing", 0],
    ["Longwinded", 0],
    ["Obnoxious", 0],
    ["OK", 0],
    ["Unconvincing", 0],
];

// This function creates a new ratings vis, does not set any values
export function createRatingsBaseVis(div, data)
{
    // Rating categories and their image files
    const ratingImageLoc = "./images/icon_svgs/";

    // Create SVG
    const svg = div.append("svg").attr("class", "visSVG");

    // Create blank ratings bar
    const bar = svg
        .append("svg")
        .attr("y", (100 - barHeight) + "%")
        .append("g")
        .attr("id", "ratingsIconBarGroup");
    bar
        .append("rect")
        .attr("id", "iconBar")
        .attr("width", barWidth + "%")
        .attr("height", barHeight + "%")
        .attr("fill", COLORS.LIGHT_GREY)
        .attr("rx", barCorners + "%");

    // Create a group to add chart bars to
    const chart = svg.append("svg")
        .attr("x", "0%")
        .attr("y", "0%")
        .attr("width", "100%")
        .attr("height", (100 - barHeight) + "%")
        .attr("viewBox", "0 0 100 100")
        .attr("preserveAspectRatio", "none");

    // Create tooltip
    const tip = d3Tip()
        .attr("class", "d3-tip ratingsTip")
        .offset([-3, 0])
        .html(function(d) {
            let total = 0;
            for (let i = 0; i < ratings.length; i++) total += ratings[i][1];
            return d[0] + ": " + ((d[1] / total) * 100).toFixed(2) + "%<br><br>" + d[1].toLocaleString() +
                " total votes" + "<br><br>Click to Select";
        });

    // Icons
    bar
        .selectAll(".ratingIcon")
        .data(ratings)
        .enter()
        .append("svg")
        .attr("class", "ratingIcon")
        .attr("x", (d, i) => ((i * iconSize) + ((i + 1) * iconOffset)) + "%")
        .attr("y", (((1 - iconRelativeSize) / 2) * barHeight) + "%")
        .append("image")
        .attr("class", "icon-image")
        .attr("href", (d, i) => ratingImageLoc + ratingCategories[i][1])
        .attr("width", iconSize + "%")
        .attr("height", iconSize + "%")
        .call(tip)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", (d) => {
            updateResults(d[0], false);
        });

    // Bars
    chart
        .selectAll(".ratingBar")
        .data(ratings, d => d[0])
        .enter()
        .append("path")
        .attr("class", "ratingBar")
        .attr("id", (d, i) => "rating-bar-" + i)
        .attr("d", (d, i) => {
            const xPos = ((i * iconSize) + ((i + 1) * iconOffset));
            return topRoundedRect(xPos + (iconSize - chartBarWidth) / 2, 100, chartBarWidth, 0.5, barCorners);
        })
        .attr("fill", (d, i) => {
            if (i < 9) return COLORS.BRIGHT_GREEN;
            else return COLORS.BRIGHT_RED;
        })
        .call(tip)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", (d) => {
            updateResults(d[0], false);
        });

    // Pie (donut) chart
    // set the color scale
    const color = d3
        .scaleOrdinal()
        .domain(["good", "bad"])
        .range([COLORS.BRIGHT_GREEN, COLORS.BRIGHT_RED]);

    // Create pie chart tooltip
    const pieTip = d3Tip()
        .attr("class", "d3-tip")
        .html((d) => {
            return `${d.data.key.charAt(0).toUpperCase() + d.data.key.slice(1)}: `
                + `${((+d.data.value / d.voteTotal) * 100).toFixed(1)}%<br><br>`
                + `${d.data.value.toLocaleString()} total votes<br>`
                + `<br>Click to Select`;
        });

    // Add pie chart to vis

    // Create placeholder pie chart data
    const pie = d3.pie().value((d) => d.value);
    const pieData = pie(d3.entries({ good: 1, bad: 1 }));
    pieData.forEach((d) => {
        d.voteTotal = 2;
    });
    d3.select(".vis").append("svg")
        .style("left", () => {
            return (d3.select(".explorerDiv").node().getBoundingClientRect().width * 0.805) + "px";
        })
        .style("top", (jq(".explorerDiv").offset().top + d3.select(".explorerDiv").node().getBoundingClientRect().height * 0.13) + "px")
        .attr('width', "17%")
        .attr("viewBox", "0 0 100 100")
        .attr("class", "pieSVG")
        .selectAll(".pieChart")
        .data(pieData, function(d) {
            return d.data.key;
        })
        .enter()
        .append("path")
        .attr("transform", "translate(50, 50)")
        .attr("class", "pieChart")
        .attr("fill", function(d) {
            return color(d.data.key);
        })
        .call(pieTip)
        .on("mouseover", pieTip.show)
        .on("mouseout", pieTip.hide)
        .on("click", (d) => {
            updateResults(d.data.key, false);
        });

    updateRatingsVis(data);
}

// This function updates the ratings chart based on the data provided
export function updateRatingsVis(data)
{
    // Clear old rating data
    for (let i = 0; i < ratings.length; i++) {
        ratings[i][1] = 0;
    }

    // Get ratings data
    for (let i = 0; i < data.length; i++)
    {
        const rawString = data[i]["ratings"];
        const ratingsString = rawString.replace(/'/g, '"');
        const ratingList = JSON.parse(ratingsString);
        for (let j = 0; j < ratingList.length; j++) {
            let count = 0;
            for (let k = 0; k < ratingList.length; k++) {
                if (ratingList[k].name === ratings[j][0]) {
                    count = ratingList[k].count;
                    break;
                }
            }
            ratings[j][1] += count;
        }
    }

    // Calculate scaling function
    const ratingDomain = d3.extent(ratings.map(v => v[1]));
    const yScale = d3.scaleLinear()
        .domain([0, ratingDomain[1]])
        .range([0, 100]);

    // Set the data for each function
    d3.selectAll(".ratingBar").data(ratings, d => d[0]);
    d3.selectAll(".ratingIcon").data(ratings, d => d[0]);

    // Scale each bar by its corresponding rating count
    for (let i = 0; i < ratingCategories.length; i++) {
        const xPos = ((i * iconSize) + ((i + 1) * iconOffset));
        d3.select("#rating-bar-" + i)
            .transition()
            .duration(750)
            .attr("d", (d) => topRoundedRect(xPos + (iconSize - chartBarWidth) / 2, 100, chartBarWidth, yScale(d[1]), barCorners));
    }

    // Update pie chart

    // Consolidate data
    const pieDataRaw = { good: 0, bad: 0 };
    for (let i = 0; i < ratings.length; i++) {
        switch (ratings[i][0].toLowerCase()) {
            case "confusing":
            case "longwinded":
            case "unconvincing":
            case "obnoxious":
            case "ok":
                pieDataRaw.bad += ratings[i][1];
                break;
            default:
                pieDataRaw.good += ratings[i][1];
        }
    }
    const voteTotal = pieDataRaw.good + pieDataRaw.bad;

    // Create pie chart data
    const pie = d3.pie().value((d) => d.value);
    const pieData = pie(d3.entries(pieDataRaw));
    pieData.forEach((d) => {
        d.voteTotal = voteTotal;
    });

    d3.selectAll(".pieChart")
        .data(pieData, (d) => d.data.key)
        .attr("d", d3.arc().innerRadius(pieInnerRadius * (50- (pieOffset * 2))).outerRadius(50 - (pieOffset * 2)));
}
