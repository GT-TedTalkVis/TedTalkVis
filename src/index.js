import "bootstrap";
import * as d3 from "d3";
import ScrollMagic from "scrollmagic";
// import talkDate from "./ts/talkDate";
import introVis from "./ts/introvis";
import tedSiteViews from "./ts/tedSiteViews";
import readingLevel from "./ts/readingLevel";
import professions from "./ts/professions";
import tagsBump from "./ts/tagsBump";
import { talkExplorer } from "./ts/talkExplorer";
import $ from "jquery";
import tagRank from "./ts/tagRank";

const controller = new ScrollMagic.Controller();

// Give each svg a variable name
const svg1 = d3.select("svg.figure1");
const svg2 = d3.select("svg.figure2");
const svg3 = d3.select("svg.figure3");
const div4 = d3.select("div.figure4");
const explorerDiv = d3.select("div.explorerDiv");
const bumpDiv = d3.select("div.bumpDiv");
const thumbnailGrid = d3.select("div.thumbnailGrid");
const commentsTagsDiv = d3.select("div.commentsTagsDiv");
const viewsTagsDiv = d3.select("div.viewsTagsDiv");
const engagementTagsDiv = d3.select("div.engagementTagsDiv");
const positivityTagsDiv = d3.select("div.positivityTagsDiv");

// Define data cleaner function
function dataCleaner(data) {
  // Calculate year from UNIX Timestamp
  data.forEach(talk => {
    const date = new Date(parseInt(talk["film_date"], 10) * 1000);
    talk.year = date.getFullYear().toString();
  });

  // Re-sort data to ensure that they're in the correct order,
  // because it's loading out of order in some browsers.
  const newData = [];
  for (let i = 0; i < data.length; i++) {
    newData.push(data.filter(d => d["rowindex"] === i.toString())[0]);
  }
  return newData;
}

// Load data
d3.csv("./data/ted_all.csv").then(data => {
  // Pass data through dataCleaner()
  const cleanedData = dataCleaner(data);

  tedSiteViews(svg2, cleanedData);
  talkExplorer(explorerDiv, cleanedData);
});

d3.csv("./data/ted_all.csv").then(data => {
  // Pass data through dataCleaner()
  const cleanedData = dataCleaner(data);

  // allTalkThumbnailGrid(thumbnailGrid, data);
  introVis(svg1, cleanedData);
})

d3.csv("./data/fk_scores.csv").then(data => {
  readingLevel(svg3, data);
});

d3.json("./data/profession_counts.json").then(data => {
  professions(div4, data);
});

d3.csv("./data/tags_rank_top5.csv").then(function(data) {
  data.forEach(function(d) {
    d.rank = +d.rank;
    d.year = +d.year;
  });
  tagsBump(bumpDiv, data);
});

d3.csv("./data/comment_tag_rank.csv").then(function(data) {
  data.forEach(function(d) {
    d.value = +d.value;
  });
  tagRank(commentsTagsDiv, data);
});

d3.csv("./data/view_tag_rank.csv").then(function(data) {
  data.forEach(function(d) {
    d.value = +d.value;
  });
  tagRank(viewsTagsDiv, data);
});

d3.csv("./data/engagement_tag_rank.csv").then(function(data) {
  data.forEach(function(d) {
    d.value = +d.value;
  });
  tagRank(engagementTagsDiv, data);
});

d3.csv("./data/positivity_tag_rank.csv").then(function(data) {
  data.forEach(function(d) {
    d.value = +d.value;
  });
  tagRank(positivityTagsDiv, data);
});

export { controller };
