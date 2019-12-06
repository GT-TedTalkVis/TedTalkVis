import * as d3 from "d3";
import COLORS from "../colors";
import d3Tip from "d3-tip";

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
const barWidth = 75;                           // Width of the icon bar
const barHeight = 6;                            // Height of the icon bar
const barCorners = 0.75;                        // Radius of icon bar corners
const iconRelativeSize = 0.8;                   // Size of the icons relative to the height of the ratings bar
const iconSize = barHeight * iconRelativeSize;  // The width and height of the rating icons
const iconOffset = (barWidth - (barWidth * (ratingCategories.length * (iconSize / barWidth)))) / (ratingCategories.length + 1);
const chartBarWidth = barWidth * 0.04;           // The width of each bar in the bar chart

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
            return `${d[0]}: ${d[1].toLocaleString()}`;
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
        .on("mouseout", tip.hide);

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
        .on("mouseout", tip.hide);

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

    console.log(ratingDomain);

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
}
