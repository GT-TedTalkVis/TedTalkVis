import "bootstrap";
import * as d3 from "d3";
import talkDate from "./ts/talkDate";
import tedSiteViews from "./ts/tedSiteViews";

// Give each svg a variable name
const svg1 = d3.select("svg.figure1");
const svg2 = d3.select("svg.figure2");

// Define data cleaner function
function dataCleaner(data: d3.DSVRowArray<string>): void {
  // Calculate year from UNIX Timestamp
  data.forEach(talk => {
    const date = new Date(parseInt(talk["film_date"], 10) * 1000);
    talk.year = date.getFullYear().toString();
  });
}

// Load data
d3.csv("./data/ted_main.csv").then(data => {
  // Pass data through dataCleaner()
  dataCleaner(data);

  talkDate(svg1, data);
  tedSiteViews(svg2, data);
});
