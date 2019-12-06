import "bootstrap";
import * as d3 from "d3";
import ScrollMagic from "scrollmagic";
import talkDate from "./ts/talkDate";
import tedSiteViews from "./ts/tedSiteViews";
import readingLevel from "./ts/readingLevel";
import professions from "./ts/professions";
import tagsBump from "./ts/tagsBump";
import allTalkThumbnailGrid from "./ts/allTalkThumbnailGrid";
import talkExplorer from "./ts/talkExplorer";
import $ from "jquery";

const controller = new ScrollMagic.Controller();

const showFigure1 = document.getElementById("showFigure1");
const sceneFigure1 = new ScrollMagic.Scene({
  triggerElement: "#showFigure1"
}).on('start', function() {
  // Example. Use Animate.CSS to trigger a fade in effect.
  $("svg.figure1").removeClass("visible-false").addClass("animated").addClass("fadeInLeft");
  console.log('start of scene');
})
.addTo(controller);

// Give each svg a variable name
const svg1 = d3.select("svg.figure1");
const svg2 = d3.select("svg.figure2");
const svg3 = d3.select("svg.figure3");
const div4 = d3.select("div.figure4");
const explorerDiv = d3.select("div.explorerDiv");
const bumpDiv = d3.select("div.bumpDiv");
const thumbnailGrid = d3.select("div.thumbnailGrid")

// Define data cleaner function
function dataCleaner(data) {
  // Calculate year from UNIX Timestamp
  data.forEach(talk => {
    const date = new Date(parseInt(talk["film_date"], 10) * 1000);
    talk.year = date.getFullYear().toString();
  });
}

// Load data
d3.csv("./data/ted_all.csv").then(data => {
  // Pass data through dataCleaner()
  dataCleaner(data);

  allTalkThumbnailGrid(thumbnailGrid, data)
  talkDate(svg1, data);
  tedSiteViews(svg2, data);
  talkExplorer(explorerDiv, data);
});

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

export { controller }