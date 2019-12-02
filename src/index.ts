import "bootstrap";
import * as d3 from "d3";
import talkDate from "./ts/talkDate";
import tedSiteViews from "./ts/tedSiteViews";
import readingLevel from "./ts/readingLevel";
import professions from "./ts/professions";
import ratingsBreakdown from "./ts/ratingsBreakdown";
import topicRelations from "./ts/topicRelations";

// Give each svg a variable name
const svg1 = d3.select("svg.figure1");
const svg2 = d3.select("svg.figure2");
const svg3 = d3.select("svg.figure3");
const div4 = d3.select("div.figure4");
const ratingsDiv = d3.select("div.ratingsDiv");
const topicsDiv = d3.select("div.topicsDiv");

// Define data cleaner function
function dataCleaner(data: d3.DSVRowArray<string>): void {
  // Calculate year from UNIX Timestamp
  data.forEach(talk => {
    const date = new Date(parseInt(talk["film_date"], 10) * 1000);
    talk.year = date.getFullYear().toString();
  });
}

// Load data
d3.csv("./data/ted_main_grouped_professions.csv").then(data => {
  // Pass data through dataCleaner()
  dataCleaner(data);

  talkDate(svg1, data);
  tedSiteViews(svg2, data);
  ratingsBreakdown(ratingsDiv, data);
});

d3.csv("./data/fk_scores.csv").then(data => {
  //console.log(data);
  readingLevel(svg3, data);
});

d3.json("./data/profession_counts.json").then(data => {
  professions(div4, data);
});

d3.json("./data/topic_relationships.json").then(data => {
  topicRelations(topicsDiv, data);
});
