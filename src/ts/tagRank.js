import * as d3 from "d3";
import COLORS from "../colors";
import * as jq from "jquery"

// Accepts a d3.Selection as a parameter and modifies it.
// This function expects the d3.Selection to be an SVG.
export default function(div, data) {
    console.log(data);

    // Set dimensions and margins of svg + graph
    const margin = {
        top: 90,
        right: 30,
        bottom: 80,
        left: 125,
    };

    let inBar = false;

    const svgWidth = window.innerWidth * 0.75;
    const svgHeight = window.innerHeight * 0.75;
    // const svgWidth = window.innerWidth * 0.6;
    // const svgHeight = window.innerHeight * 0.6;
    // const svgWidth = 400;
    // const svgHeight = 500;
    // const width = svgWidth - margin.left - margin.right;
    // const height = svgHeight - margin.top - margin.bottom;

    // const svg = d3.select(DOM.svg(width, height));

    // Set width and height of svg
    // svg.attr("width", svgWidth);
    // svg.attr("height", svgHeight);

    // const titleSize =

    const svg = div.append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)

    console.log(data[0].metric)

    svg.append("text")
        .attr("x", svgWidth / 2 )
        // .attr("y", +margin.top + 10)
        .attr("y", +margin.top/2)
        .attr("class", "title")
        .style("text-anchor", "middle")
        .style("fill", "white")
        // .text("Title of Diagram");
        // .text("Top Tags for " + data[0].metric);
        .text("Top Tags for " + data[0].metric.charAt(0).toUpperCase() + data[0].metric.substring(1));


    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0))

    const xDomain = d3.extent(data.map(d => d.value));

    const y = d3.scaleBand()
        .domain(data.map(d => d.tag))
        .range([margin.top, svgHeight - margin.bottom])
        .padding(0.1)

    const x = d3.scaleLinear()
        .domain([0, xDomain[1]])
        .range([margin.left, svgWidth - margin.right - margin.left]);

    const xAxis = g => g
        .attr("transform", `translate(0,${margin.top})`)
        .call(d3.axisTop(x).ticks(svgWidth / 80))
        .call(g => g.select(".domain").remove());

    const format = x.tickFormat(20);

    /*const tip = div.append("div")
        .attr("class", "tag-tip")
        .html('test');*/

    svg.append("g")
        .attr("fill", COLORS.TED_RED)
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", x(0))
        .attr("y", d => y(d.tag))
        .attr("width", d => x(d.value) - x(0))
        .attr("height", y.bandwidth())
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut);

    function mouseOver() {
        inBar = true;
        d3.select(this.parentNode)
            .selectAll("rect")
            .attr("fill", COLORS.DARK_RED);
        d3.select(this).attr("fill", COLORS.TED_RED);
    }

    async function mouseOut() {
        inBar = false;
        await sleep(100);
        if (!inBar) {
            d3.select(this.parentNode)
                .selectAll("rect")
                .attr("fill", COLORS.TED_RED);
        }
    }

    svg.append("g")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .style("font", "12px sans-serif")
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("x", d => x(d.value) - 4)
        .attr("y", d => y(d.tag) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("pointer-events", "none")
        .text(d => format(d.value));

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}