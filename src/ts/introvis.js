import * as d3 from "d3";
import COLORS from "../colors";
import ScrollMagic from "scrollmagic";
import d3Tip from "d3-tip";
import { controller } from "../index";
import $ from "jquery";
import InfoController from "./fixedInfoController";
import FiveVideoTip from "./fiveVideoTip";

const infoController = new InfoController();
const fiveVideoTip = new FiveVideoTip();
let currentPhase = 0;

/**
 * Introductory visualization
 * @param {d3.Selection<SVGGElement>} svg
 * @param {unknown[]} data
 */
export default function(svg, data) {
  // Determine SVG size based on window size
  const svgWidth = window.innerWidth;
  const svgHeight = window.innerHeight;

  // Set SVG size
  svg.attr("width", svgWidth).attr("height", svgHeight);

  // Determine viewable area based on the column split.
  // Need to double check the CSS.
  const viewableWidth = svgWidth * 0.6;
  const viewableHeight = svgHeight;

  // Thumbnail aspect ratio
  const thumbnailXRatio = 2;
  const thumbnailYRatio = 3;

  // Size of each unit
  const largeUnitWidth = viewableWidth * 0.75;
  const largeUnitHeight = (largeUnitWidth * thumbnailXRatio) / thumbnailYRatio;

  // Path to the thumbnail images
  const thumbnailDirectory = "./images/thumbnails/";

  // Disable freezing on video tip
  let hovering = false;

  svg.on("click", () => {
    console.log("Called SVG event");
    console.log(hovering);
    if (hovering === false) {
      console.log("Hovering was false...");
      fiveVideoTip.frozen = false;
    }
  })

  svg.on("mousemove", () => {
    if (hovering === false && fiveVideoTip.frozen === false) {
      infoController.close();
    }
  })

  // Initialize tooltip
  const tip = d3Tip()
    .attr("class", "tooltip")
    .html(d => d.name);

  function removeImages() {
    // Cleanup function for floating images like
    // wurman, marks, anderson
    [wurman, marks].forEach(im => {
      im.transition()
        .duration(100)
        .attr("transform", function() {
          const bbox = this.getBBox();
          return `translate(${bbox.x}, ${-bbox.height * 2})`;
        });
    });

    let anderson = svg.select("image.anderson");
    if (!anderson.empty()) {
      anderson
        .transition()
        .duration(100)
        .attr("width", 1280 * 0.4)
        .attr("height", 720 * 0.4)
        .attr("x", -1 * 1280 * 0.4)
        .attr("y", viewableHeight * 0.2);
    }
  }
  function toggleDimming(state) {
    if (state === "on") {
      let dimmer = svg.select("rect.black-fade");
      if (dimmer.empty()) {
        dimmer = svg
          .append("rect")
          .attr("class", "black-fade")
          .attr("width", svgWidth)
          .attr("height", svgHeight)
          .attr("x", 0)
          .attr("y", 0)
          .attr("opacity", 0)
          .transition()
          .duration(300)
          .attr("opacity", 0.6)
          .on("end", function() {
            console.log("Had to make dimmer and bring anderson to front");
            let anderson = svg.select("image.anderson");
            anderson.parentNode.appendChild(anderson);
          });
      }
    } else {
      const dimmer = svg.select("rect.black-fade");
      dimmer
        .transition()
        .duration(300)
        .attr("opacity", 0)
        .on("end", function() {
          dimmer.remove();
        });
    }
  }

  // Preload all images...?
  // let loadedCount = 0;
  // const loaderText = document.getElementById("loading");
  // const unitPreload = svg.selectAll("g").data(data, d => d["name"]);
  // const unitPreloadEnter = unitPreload.enter().append("g");
  // unitPreloadEnter
  //   .append("image")
  //   .attr("display", "none")
  //   .attr("xlink:href", async d => {
  //     const img = new Image();
  //     await new Promise((resolve, reject) => {
  //       img.src = thumbnailDirectory + d["thumbnail_path"];
  //       img.onload = function() {
  //         loadedCount += 1;
  //         loaderText.innerText = `Loading visualizations... ${Math.floor((loadedCount / 2547) * 100)}%`;
  //         resolve();
  //       };
  //     });
  //     return d["thumbnail_url"];
  //   });

  const introPart1 = direction => {
    currentPhase = 1;
    const duration = 750;

    const imageWidth = viewableWidth * 0.5;
    const imageHeight = imageWidth * 0.5625;
    const centeredX = (viewableWidth - imageWidth) / 2;
    const topY = (viewableHeight / 2 - imageHeight) / 2;
    const botY = viewableHeight / 2 + topY;

    const wurman = svg.selectAll("image.wurman").data(["wurman"]);
    wurman
      .enter()
      .append("image")
      .attr("class", "wurman")
      .attr("xlink:href", "./images/wurman.jpg")
      .attr("width", 1280 * 0.2)
      .attr("height", 720 * 0.2)
      .attr("x", -1 * 1280 * 0.2)
      .attr("y", (svgHeight - 720 * 0.2) / 2)
      .merge(wurman)
      .transition()
      .duration(duration)
      .attr("x", centeredX)
      .attr("y", topY)
      .attr("width", imageWidth)
      .attr("height", imageHeight);

    const marks = svg.selectAll("image.marks").data(["marks"]);
    marks
      .enter()
      .append("image")
      .attr("class", "marks")
      .attr("xlink:href", "./images/harrymarks.jpg")
      .attr("width", 1280 * 0.2)
      .attr("height", 720 * 0.2)
      .attr("x", -1 * 1280 * 0.2)
      .attr("y", (svgHeight - 720 * 0.2) / 2)
      .merge(marks)
      .transition()
      .duration(duration)
      .attr("x", centeredX)
      .attr("y", botY)
      .attr("width", imageWidth)
      .attr("height", imageHeight);
    console.log(marks);

    // Returning to Part 1, from Part 2
    const units = svg
      .selectAll("g")
      .select("image")
      .transition()
      .duration(750)
      .attr("width", 300)
      .attr("height", 400)
      .attr("transform", `translate(-300, ${(viewableHeight - 400) / 2})`);
    const text = svg.selectAll("text.text-part-2");
    text
      .transition()
      .duration(750)
      .attr("opacity", 0)
      .on("end", function() {
        text.remove();
      });
  };

  const introPart2 = direction => {
    currentPhase = 2;
    const dataSlice = data.slice(2, 3);

    const duration = 750;
    const padding = 20;
    const width = (viewableWidth - padding * 2) / 2;
    const height = width * 0.5625;
    const marginTop = viewableHeight * 0.1;

    (function transitionPart1() {
      let wurman = svg.selectAll("image.wurman").data(["wurman"]);
      wurman
        .enter()
        .append("image")
        .attr("class", "wurman")
        .attr("xlink:href", "./images/wurman.jpg")
        .attr("width", 1280 * 0.2)
        .attr("height", 720 * 0.2)
        .attr("x", -1 * 1280 * 0.2)
        .attr("y", (svgHeight - 720 * 0.2) / 2)
        .merge(wurman)
        .transition()
        .duration(duration)
        .attr("width", width)
        .attr("height", height)
        .attr("x", padding)
        .attr("y", marginTop);

      let marks = svg.selectAll("image.marks").data(["marks"]);
      marks
        .enter()
        .append("image")
        .attr("class", "marks")
        .attr("xlink:href", "./images/harrymarks.jpg")
        .attr("width", 1280 * 0.2)
        .attr("height", 720 * 0.2)
        .attr("x", -1 * 1280 * 0.2)
        .attr("y", (svgHeight - 720 * 0.2) / 2)
        .merge(marks)
        .transition()
        .duration(duration)
        .attr("width", width)
        .attr("height", height)
        .attr("x", padding * 2 + width)
        .attr("y", marginTop);
    })();

    const units = svg.selectAll("g").data(dataSlice, d => d["name"]);
    const unitsEnter = units.enter().append("g");

    // Remove all text elements if coming back from view 2
    units.select("text").remove();

    // Create Part 2 elements
    unitsEnter
      .append("a")
      .attr("href", d => d.url)
      .attr("target", "_blank")
      .attr("rel", "noopener noreferrer")
      .append("image")
      .attr("width", 300)
      .attr("height", 400)
      .attr("transform", `translate(-300, ${(viewableHeight - 400) / 2})`)
      .attr("xlink:href", d => {
        return d["thumbnail_url"];
      });

    const text = svg.selectAll("text.text-part-2").data(dataSlice, d => d["name"]);
    const textEnter = text
      .enter()
      .append("text")
      .attr("class", "text-part-2")
      .attr("fill", "white")
      .attr("opacity", 0)
      .attr("font-size", (viewableHeight * 0.05) / 1.618)
      .attr("text-anchor", "middle")
      .append("tspan")
      .attr("x", 0)
      .attr("dy", 0)
      .text(d => `"${d["name"]}"`)
      .select(function() {
        return this.parentNode;
      })
      .append("tspan")
      .text("One of the first TED Talks.")
      .attr("x", 0)
      .attr("dy", (viewableHeight * 0.05) / 1.2)
      .select(function() {
        return this.parentNode;
      })
      .attr("transform", () => {
        const x = viewableWidth / 2;
        const y = viewableHeight / 2 - viewableHeight * 0.1 + largeUnitHeight;
        return `translate(${x}, ${y})`;
      });

    // Transition
    const unitsMerged = units.merge(unitsEnter);
    units.exit().remove();

    unitsMerged
      .on("mouseover", (d, i) => {
        if (fiveVideoTip.frozen === false) {
          infoController.open();
          infoController.setTitle(d["title"]);
          infoController.setThumbnail(d["thumbnail_url"]);
          infoController.setLink(d["url"]);
          infoController.setDescription(d["description"]);

          // Subset dataSlice
          const fiveVideoRows = dataSlice.slice(i - 2, i + 3);
          fiveVideoTip.open();
          fiveVideoTip.displayVideos(fiveVideoRows, false, false);
        }

        hovering = true;
      })
      .on("click", (d, i) => {
        console.log("Called cell click");
        infoController.open();
        infoController.setTitle(d["title"]);
        infoController.setThumbnail(d["thumbnail_url"]);
        infoController.setDescription(d["description"]);

        // Subset dataSlice
        const fiveVideoRows = dataSlice.slice(i - 2, i + 3);
        fiveVideoTip.open();
        fiveVideoTip.displayVideos(fiveVideoRows, true, true);
        hovering = true;
      })
      .on("mouseout", () => {
        hovering = false;
      })
      .transition()
      .duration(duration)
      .selectAll("image")
      .attr("width", largeUnitWidth)
      .attr("height", largeUnitHeight)
      .attr("transform", () => {
        const marginTop = viewableHeight / 2 - viewableHeight * 0.1;
        const marginLeft = (viewableWidth - largeUnitWidth) / 2;
        return `translate(${marginLeft}, ${marginTop})`;
      })
      .on("end", function(d, i) {
        text
          .merge(textEnter)
          .transition()
          .duration(duration)
          .attr("opacity", 1);
      });
  };

  const introPart3 = () => {
    currentPhase = 3;
    const numImages = 10;
    const dataSlice = data.slice(2, 2 + numImages)
    const durations = [750, 750];
    const padding = 10;
    const availableWidth = viewableWidth - padding * numImages;
    const imageWidth = availableWidth / 5.5;
    const imageHeight = (imageWidth * thumbnailXRatio) / thumbnailYRatio;

    // Make wurman, marks leave.
    removePart2();
    // Make anderson, dimmer from part 4
    removePart4();

    const units = svg.selectAll("g").data(dataSlice, d => d["name"]);
    const unitsEnter = units.enter().append("g");

    // Images
    units
      .select("a")
      .append("text")
      .attr("class", "figure-2-years")
      .attr("opacity", 0)
      .attr("fill", "#FFFFFF")
      .text(d => {
        return d["year"];
      })
      .attr("transform", function(d, i) {
        if (i < 5) {
          const bbox = this.getBBox();
          const x = (i + 1) * padding + i * imageWidth + (imageWidth - bbox.width) / 2;
          const y = viewableHeight - imageHeight * 2.5 + imageHeight + bbox.height;
          return `translate(${x}, ${y})`;
        } else {
          const transform = d3.select(this).attr("transform");
          return transform;
        }
      });

    unitsEnter
      .append("a")
      .attr("href", d => d.url)
      .attr("target", "_blank")
      .attr("rel", "noopener noreferrer")
      .append("image")
      .attr("width", largeUnitWidth)
      .attr("height", largeUnitHeight)
      .attr("opacity", 1)
      .attr("transform", (d, i) => {
        // If the unit is the one from viewOne(),
        // use that one's original position
        if (i == 0) {
          const marginTop = (viewableHeight - largeUnitHeight) / 2;
          const marginLeft = (viewableWidth - largeUnitWidth) / 2;
          return `translate(${marginLeft}, ${marginTop})`;
        } else if (i < 5) {
          const x = svgWidth;
          const y = (viewableHeight - largeUnitHeight) / 2;
          return "translate(" + x + "," + y + ")";
        } else {
          // x, y positions
          const x = 5 * padding + 4 * imageWidth;
          const y = -2 * largeUnitHeight;
          return `translate(${x}, ${y})`;
        }
      })
      .attr("xlink:href", d => {
        return thumbnailDirectory + d["thumbnail_path"];
      })
      .select(function() { return this.parentNode; })
      .append("text")
      .attr("class", "figure-2-years")
      .attr("opacity", 0)
      .attr("fill", "#FFFFFF")
      .text(d => {
        return d["year"];
      })
      .attr("transform", function(d, i) {
        if (i < 5) {
          const bbox = this.getBBox();
          const x = (i + 1) * padding + i * imageWidth + (imageWidth - bbox.width) / 2;
          const y = viewableHeight - imageHeight * 2.5 + imageHeight + bbox.height;
          return `translate(${x}, ${y})`;
        } else {
          const transform = d3.select(this).attr("transform");
          return transform;
        }
      });

    // Transition
    const unitsMerged = units.merge(unitsEnter);
    unitsMerged
      .on("mouseover", (d, i) => {
        infoController.open();
        infoController.setTitle(d["title"]);
        infoController.setThumbnail(d["thumbnail_url"]);
        infoController.setLink(d["url"]);
        infoController.setDescription(d["description"]);

        hovering = true;
      })
      .on("click", (d, i) => {
        console.log("Called cell click");
        infoController.open();
        infoController.setTitle(d["title"]);
        infoController.setThumbnail(d["thumbnail_url"]);
        infoController.setDescription(d["description"]);

        // Subset dataSlice
        const fiveVideoRows = dataSlice.slice(i - 2, i + 3);
        fiveVideoTip.open();
        fiveVideoTip.displayVideos(fiveVideoRows, true, true);
      })
      .on("mouseout", () => {
        hovering = false;
      })
      .transition()
      .delay((d, i) => 50 * i)
      .duration(durations[0])
      .select("image")
      .attr("width", imageWidth)
      .attr("height", imageHeight)
      .attr("transform", function(d, i) {
        if (i < 5) {
          const x = (i + 1) * padding + i * imageWidth;
          const y = viewableHeight - imageHeight * 2.5;
          return `translate(${x}, ${y})`;
        } else if (i < 10) {
          const x = (4 + 1) * padding + 4 * imageWidth;
          const y = viewableHeight - imageHeight * 2.5 - imageHeight * (i - 5 + 1);
          return `translate(${x}, ${y})`;
        } else {
          const transform = d3.select(this).attr("transform");
          return transform;
        }
      }).on('end', function(d, i) {
        if (i === 0) {
          unitsMerged
            .select("text")
            .transition()
            .delay((d, i) => 50 * i)
            .duration(durations[1])
            .attr("opacity", 1)
        }
      })
      
  };

  const introPart4 = () => {
    currentPhase = 4;
    const duration = 750;

    (function removePart5() {
      const yearCounts = svg.selectAll("text.year-counts").remove();
      svg.selectAll("text.figure-5-title").remove();
    })();

    // Create dimmer
    const dimmer = svg.selectAll("rect.black-fade").data(["dimmer"]);
    dimmer
      .enter()
      .append("rect")
      .attr("class", "black-fade")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .attr("x", 0)
      .attr("y", 0)
      .attr("opacity", 0)
      .merge(dimmer)
      .transition()
      .duration(300)
      .attr("opacity", 0.6);

    const anderson = svg.selectAll("image.anderson").data(["anderson"]);
    anderson
      .enter()
      .append("image")
      .attr("class", "anderson")
      .attr("xlink:href", "./images/anderson.jpg")
      .attr("width", 1280 * 0.4)
      .attr("height", 720 * 0.4)
      .attr("x", -1 * 1280 * 0.4)
      .attr("y", viewableHeight * 0.2)
      .merge(anderson)
      .transition()
      .duration(duration)
      .attr("x", (viewableWidth - 1280 * 0.5) / 2)
      .attr("y", (viewableHeight - 720 * 0.5) / 2)
      .attr("width", 1280 * 0.5)
      .attr("height", 720 * 0.5);
  };

  const introPart5 = () => {

    currentPhase = 5;
    removePart4();

    const dataSlice = data.slice(2, 176);
    const years = [];
    for (let i = 0; i < dataSlice.length; i++) {
      years.push(dataSlice[i]["year"]);
    }
    const yearSet = [...new Set(years)];
    const numYears = yearSet.length;
    const newYears = yearSet.slice(yearSet.indexOf("2001"));
    const numVideosInYear = year => {
      return dataSlice.filter(d => d["year"] === year).length;
    };
    const posInYear = (year, name) => {
      const yearSlice = dataSlice.filter(d => d["year"] === year);
      for (let i = 0; i < yearSlice.length; i++) {
        if (yearSlice[i]["name"] === name) {
          return i;
        }
      }
      return null;
    };

    const duration = 750;
    const padding = 10;
    const availableWidth = viewableWidth - padding * 10;
    const oldImageWidth = availableWidth / 5;
    const oldImageHeight = (oldImageWidth * thumbnailXRatio) / thumbnailYRatio;
    const newImageWidth = ((viewableWidth - padding * numYears) / numYears) * 0.4;
    const newImageHeight = newImageWidth * 0.2;

    const units = svg.selectAll("g").data(dataSlice, d => d["name"]);
    const unitsEnter = units.enter().append("g");

    // Remove all text elements for now.
    units.select("text").remove();

    units.select("image").attr("preserveAspectRatio", "none");
    // Have d3 enter the missing images.
    unitsEnter
      .append("a")
      .attr("href", d => d.url)
      .attr("target", "_blank")
      .attr("rel", "noopener noreferrer")
      .append("image")
      .attr("width", oldImageWidth)
      .attr("height", oldImageHeight)
      .attr("xlink:href", d => {
        return thumbnailDirectory + d["thumbnail_path"];
      })
      .attr("preserveAspectRatio", "none")
      .attr("opacity", 0)
      .attr("transform", function(d, i) {
        if (i < 5) {
          const x = (i + 1) * padding + i * oldImageWidth;
          const y = viewableHeight - oldImageHeight * 2.5;
          return `translate(${x}, ${y})`;
        } else if (i < 10) {
          const x = (4 + 1) * padding + 4 * oldImageWidth;
          const y = viewableHeight - oldImageHeight * 2.5 - oldImageHeight * (i - 5 + 1);
          return `translate(${x}, ${y})`;
        } else {
          const startX = (5 + 1) * padding + 5 * oldImageWidth;
          const startY = viewableHeight - oldImageHeight * 2.5;
          const k = newYears.indexOf(d["year"]);
          const l = posInYear(d["year"], d["name"]);

          const x = startX + k * (padding + oldImageWidth);
          const y = startY - oldImageHeight * l;
          return `translate(${x}, ${y})`;
        }
      });
    // Append text
    const yearTextboxes = svg.selectAll("text.year").data(yearSet, d => d);
    const yearTextboxesEnter = yearTextboxes
      .enter()
      .append("text")
      .attr("class", "year");
    yearTextboxesEnter
      .text(d => d)
      .attr("fill", "#FFFFFF")
      .attr("font-size", newImageWidth / 1.618)
      .attr("opacity", 0)
      .attr("transform", function(d) {
        const bbox = this.getBBox();
        const startX = viewableWidth * 0.3;
        const startY = viewableHeight * 0.8;
        const k = yearSet.indexOf(d);

        const x = startX + k * newImageWidth + bbox.height * 0.75;
        const y = startY - newImageHeight + bbox.width * 1.5;
        return `translate(${x}, ${y}) rotate(-90) `;
        return `translate(${x}, ${y}) rotate(-90) `;
      });

    // Transition
    const unitsMerged = units.merge(unitsEnter);
    const yearTextboxesMerged = yearTextboxes.merge(yearTextboxesEnter);
    yearTextboxes.exit().remove();
    unitsMerged
      .on("mouseover", (d, i) => {
        if (fiveVideoTip.frozen === false) {
          infoController.open();
          infoController.setTitle(d["title"]);
          infoController.setThumbnail(d["thumbnail_url"]);
          infoController.setLink(d["url"]);
          infoController.setDescription(d["description"]);

          // Subset dataSlice
          const fiveVideoRows = dataSlice.slice(i - 2, i + 3);
          fiveVideoTip.open();
          fiveVideoTip.displayVideos(fiveVideoRows, false, false);
        }

        hovering = true;
      })
      .on("mouseout", () => {
        hovering = false;
      })
      .transition()
      .duration(750)
      .select("image")
      .attr("width", newImageWidth)
      .attr("height", newImageHeight)
      .attr("opacity", 1)
      .attr("transform", function(d, i) {
        // const startX = 10;
        // const startY = viewableHeight - newImageHeight * 1.5;
        const startX = viewableWidth * 0.3;
        const startY = viewableHeight * 0.8;
        const k = yearSet.indexOf(d["year"]);
        const l = posInYear(d["year"], d["name"]);

        const x = startX + k * newImageWidth;
        const y = startY - newImageHeight * l;
        return `translate(${x}, ${y})`;
      })
      .on("end", () => {
        if (currentPhase === 5) {
          yearTextboxesMerged
              .transition()
              .duration(400)
              .delay((d, i) => 100 * i)
              .attr("opacity", 1)
              .on('end', function (d, i) {
                if (i === yearSet.length - 1 && currentPhase === 5) {
                  const yearCounts = svg.selectAll("text.year-counts").data(yearSet, d => d)
                  yearCounts
                      .enter()
                      .append("text")
                      .attr("class", "year-counts")
                      .attr("fill", "#FFFFFF")
                      .attr("text-anchor", "end")
                      .attr("font-size", newImageWidth / 1.618)
                      .attr("opacity", 0)
                      .text(d => numVideosInYear(d))
                      .attr("transform", function (d) {
                        const bbox = this.getBBox();
                        const startX = viewableWidth * 0.3;
                        const startY = viewableHeight * 0.8;
                        const k = yearSet.indexOf(d);
                        const l = numVideosInYear(d);

                        const x = startX + k * newImageWidth + bbox.height;
                        const y = startY - newImageHeight * l - bbox.width;
                        return `translate(${x}, ${y}) rotate(-90) `;
                      })
                      .merge(yearCounts)
                      .transition()
                      .duration(750)
                      .attr("opacity", 1);
                }
              })
        }
      });

    const figure5Title = svg.selectAll("text.figure-5-title").data(["Talks", "Per", "Year"]);
    figure5Title
      .enter()
      .append("text")
      .attr("class", "figure-5-title")
      .attr("font-size", viewableHeight * 0.2 / 1.618)
      .text(d => d)
      .attr("opacity", 0)
      .attr("transform", (d, i) => {
        const x = 100;
        const y = 200 + (viewableHeight * 0.2 / 1.618) * i;
        return `translate(${x}, ${y})`
      })
      .attr("fill", "#FFFFFF")
      .merge(figure5Title)
      .transition()
      .duration(750)
      .attr("opacity", 1)
      .attr("transform", (d, i) => {
        const x = 100;
        const y = 300 + (viewableHeight * 0.2 / 1.618) * i;
        return `translate(${x}, ${y})`
      })
  };

  const introPart6 = () => {
    currentPhase = 6;
    const dataSlice = data.slice(2, 226);
    const years = [];
    for (let i = 0; i < dataSlice.length; i++) {
      years.push(dataSlice[i]["year"]);
    }
    const yearSet = [...new Set(years)];
    const numYears = yearSet.length;
    const newYears = yearSet.slice(yearSet.indexOf("2001"));
    const numVideosInYear = year => {
      return dataSlice.filter(d => d["year"] === year).length;
    };
    const posInYear = (year, name) => {
      const yearSlice = dataSlice.filter(d => d["year"] === year);
      for (let i = 0; i < yearSlice.length; i++) {
        if (yearSlice[i]["name"] === name) {
          return i;
        }
      }
      return null;
    };

    (function removePart5() {
      const yearCounts = svg.selectAll("text.year-counts").remove();
    })();

    const padding = 10;
    const oldImageWidth = ((viewableWidth - padding * 10) / (numYears - 1)) * 0.4;
    const oldImageHeight = oldImageWidth * 0.2;
    // const newImageWidth = (viewableWidth - padding * numYears) / numYears * 0.4;
    // const newImageHeight = newImageWidth * 0.45;

    const units = svg.selectAll("g").data(dataSlice, d => d["name"]);
    units.select("image").attr("preserveAspectRatio", "none");
    const unitsEnter = units.enter().append("g");

    unitsEnter
      .append("a")
      .attr("href", d => d.url)
      .attr("target", "_blank")
      .attr("rel", "noopener noreferrer")
      .append("image")
      .attr("width", oldImageWidth)
      .attr("height", oldImageHeight)
      .attr("xlink:href", d => {
        return thumbnailDirectory + d["thumbnail_path"];
      })
      .attr("preserveAspectRatio", "none")
      .attr("opacity", 0)
      .attr("transform", function(d, i) {
        const startX = viewableWidth * 0.3;
        const startY = viewableHeight * 0.8;
        const k = yearSet.indexOf(d["year"]);
        const l = posInYear(d["year"], d["name"]);

        const x = startX + k * oldImageWidth;
        const y = startY - oldImageHeight * l;
        return `translate(${x}, ${y})`;
      });

    const yearTextboxes = svg.selectAll("text.year").data(yearSet, d => d);
    const yearTextboxesEnter = yearTextboxes
      .enter()
      .append("text")
      .attr("class", "year");
    yearTextboxesEnter
      .text(d => d)
      .attr("fill", "#FFFFFF")
      .attr("font-size", oldImageWidth / 1.618)
      .attr("opacity", 0)
      .attr("transform", function(d) {
        const bbox = this.getBBox();
        const startX = viewableWidth * 0.3;
        const startY = viewableHeight * 0.8;
        const l = numVideosInYear(d);
        const k = yearSet.indexOf(d);

        const x = startX + k * oldImageWidth + bbox.height * 0.75;
        const y = startY - oldImageHeight + bbox.width;
        return `translate(${x}, ${y}) rotate(-90) `;
      });

    const unitsMerged = units.merge(unitsEnter);
    units.exit().remove();
    const yearTextboxesMerged = yearTextboxes.merge(yearTextboxesEnter);
    yearTextboxes.exit().remove();
    unitsMerged
      .on("mouseover", (d, i) => {
        if (fiveVideoTip.frozen === false) {
          infoController.open();
          infoController.setTitle(d["title"]);
          infoController.setThumbnail(d["thumbnail_url"]);
          infoController.setLink(d["url"]);
          infoController.setDescription(d["description"]);

          // Subset dataSlice
          const fiveVideoRows = dataSlice.slice(i - 2, i + 3);
          fiveVideoTip.open();
          fiveVideoTip.displayVideos(fiveVideoRows, false, false);
        }

        hovering = true;
      })
      .on("click", (d, i) => {
        console.log("Called cell click");
        infoController.open();
        infoController.setTitle(d["title"]);
        infoController.setThumbnail(d["thumbnail_url"]);
        infoController.setDescription(d["description"]);

        // Subset dataSlice
        const fiveVideoRows = dataSlice.slice(i - 2, i + 3);
        fiveVideoTip.open();
        fiveVideoTip.displayVideos(fiveVideoRows, true, true);
      })
      .on("mouseout", () => {
        hovering = false;
      })
      .transition()
      .duration(400)
      .delay((d, i) => {
        const l = posInYear(d["year"], d["name"]);
        if (d["year"] != "2006") {
          return 0;
        } else {
          return l * 10;
        }
      })
      .select("image")
      .attr("width", oldImageWidth)
      .attr("height", oldImageHeight)
      .attr("transform", function(d, i) {
        const startX = viewableWidth * 0.3;
        const startY = viewableHeight * 0.8;
        const k = yearSet.indexOf(d["year"]);
        const l = posInYear(d["year"], d["name"]);

        const x = startX + k * oldImageWidth;
        const y = startY - oldImageHeight * l;
        return `translate(${x}, ${y})`;
      })
      .attr("opacity", 1)
      .on("end", function(d, i) {
        if (currentPhase === 6) {
          if (i === dataSlice.length - 1) {
            yearTextboxesMerged
                .transition()
                .duration(400)
                .attr("font-size", oldImageWidth / 1.618)
                .attr("opacity", 1)
                .attr("transform", function (d, i) {
                  const bbox = this.getBBox();
                  const startX = viewableWidth * 0.3;
                  const startY = viewableHeight * 0.8;
                  const l = numVideosInYear(d);
                  const k = yearSet.indexOf(d);

                  const x = startX + k * oldImageWidth + bbox.height * 0.75;
                  const y = startY - oldImageHeight + bbox.width * 1.5;
                  return `translate(${x}, ${y}) rotate(-90) `;
                });
          }
        }
      });

      const yearCounts = svg.selectAll("text.year-counts").data(yearSet, d => d)
      yearCounts
        .enter()
        .append("text")
        .attr("class", "year-counts")
        .attr("fill", "#FFFFFF")
        .attr("text-anchor", "end")
        .attr("font-size", oldImageWidth / 1.618)
        .attr("opacity", d => d === "2006" ? 0 : 1)
        .text(d => numVideosInYear(d))
        .attr("transform", function(d) {
          const bbox = this.getBBox();
          const startX = viewableWidth * 0.3;
          const startY = viewableHeight * 0.8;
          const k = yearSet.indexOf(d);
          const l = numVideosInYear(d);

          const x = startX + k * oldImageWidth + bbox.height;
          const y = startY - oldImageHeight * l - bbox.width;
          return `translate(${x}, ${y}) rotate(-90) `;
        })
        .merge(yearCounts)
        .transition()
        .duration(750)
        .attr("opacity", 1);
  };

  const introPart7 = () => {

    currentPhase = 7;
    /* Gigantic colorful histogram of every video */

    // Modify the fiveVideoTip location
    fiveVideoTip.x = 20;
    fiveVideoTip.y = 10;

    const dataSlice = data.slice(2);
    const yearMin = parseInt(dataSlice[0]["year"], 10);
    const yearMax = parseInt(dataSlice[dataSlice.length - 1]["year"], 10);
    const yearSet = [];
    for (let i = yearMin; i <= yearMax; i++) {
      yearSet.push(i.toString());
    }

    const numVideosInYear = year => {
      return dataSlice.filter(d => d["year"] === year).length;
    };
    const posInYear = (year, name) => {
      const yearSlice = dataSlice.filter(d => d["year"] === year);
      for (let i = 0; i < yearSlice.length; i++) {
        if (yearSlice[i]["name"] === name) {
          return i;
        }
      }
      return null;
    };

    (function removePart6() {
      svg.selectAll("text.year-counts").remove();
      svg.selectAll("text.year").remove();
    })();

    const imageWidth = viewableWidth * 0.025;
    const imageHeight = viewableHeight * 0.003;
    console.log(imageWidth, imageHeight);

    // Hide year textboxes for now
    const yearTextboxes = svg
      .selectAll("text.year")
      .data(yearSet, d => d)
      .attr("opacity", 0);

    const units = svg.selectAll("g").data(dataSlice, d => d["name"]);

    units.select("image").attr("preserveAspectRatio", "none");
    units
      .transition()
      .duration(2000)
      .select("image")
      .attr("width", imageWidth)
      .attr("height", imageHeight)
      .attr("transform", function(d) {
        const startX = 10;
        const startY = viewableHeight - viewableHeight * 0.05;
        const k = yearSet.indexOf(d["year"]);
        const l = posInYear(d["year"], d["name"]);

        const x = startX + k * imageWidth;
        const y = startY - imageHeight * l;
        return `translate(${x}, ${y})`;
      })
      .on("end", function(d, i) {
        if (currentPhase === 7) {
          if (i === 223) {
            const unitsEnter = units.enter().append("g");
            unitsEnter
                .append("a")
                .attr("href", d => d.url)
                .attr("target", "_blank")
                .attr("rel", "noopener noreferrer")
                .append("image")
                .attr("xlink:href", d => {
                  return thumbnailDirectory + d["thumbnail_path"];
                })
                .attr("preserveAspectRatio", "none")
                .attr("width", imageWidth)
                .attr("height", imageHeight)
                .attr("transform", function (d) {
                  const startX = 10;
                  const startY = viewableHeight - viewableHeight * 0.05;
                  const k = yearSet.indexOf(d["year"]);
                  const l = posInYear(d["year"], d["name"]);

                  const x = startX + k * imageWidth;
                  const y = startY - imageHeight * l;
                  return `translate(${x}, ${y})`;
                });

            const unitsMerged = units.merge(unitsEnter);
            unitsMerged
                .on("mouseover", (d, i) => {
                  if (fiveVideoTip.frozen === false) {
                    infoController.open();
                    infoController.setTitle(d["title"]);
                    infoController.setThumbnail(d["thumbnail_url"]);
                    infoController.setLink(d["url"]);
                    infoController.setDescription(d["description"]);

                    // Subset dataSlice
                    const fiveVideoRows = dataSlice.slice(i - 2, i + 3);
                    fiveVideoTip.open();
                    fiveVideoTip.displayVideos(fiveVideoRows, false, false);
                  }

                  hovering = true;
                })
                .on("click", (d, i) => {
                  /*console.log("Called cell click");
                  infoController.open();
                  infoController.setTitle(d["title"]);
                  infoController.setThumbnail(d["thumbnail_url"]);
                  infoController.setDescription(d["description"]);

                  // Subset dataSlice
                  const fiveVideoRows = dataSlice.slice(i - 2, i + 3);
                  fiveVideoTip.open();
                  fiveVideoTip.displayVideos(fiveVideoRows, true, true);*/
                })
                .on("mouseout", () => {
                  hovering = false;
                  fiveVideoTip.close();
                  infoController.close();
                })
                .transition()
                .duration(0)
                .delay((d, i) => i)
                .select("image")
                .attr("opacity", 1)
            // .on('end', function(d, i) {
            //   if (i !== dataSlice.length - 1) {
            //     return;
            //   }
            //   // Show text
            //   const figure7Title = svg.selectAll("text.figure-7-title").data(["Talks", "Per", "Year"]);
            //   figure7Title
            //     .enter()
            //     .append("text")
            //     .attr("class", "figure-7-title")
            //     .attr("font-size", viewableHeight * 0.2 / 1.618)
            //     .text(d => d)
            //     .attr("opacity", 0)
            //     .attr("transform", (d, i) => {
            //       const x = 100;
            //       const y = 200 + (viewableHeight * 0.2 / 1.618) * i;
            //       return `translate(${x}, ${y})`
            //     })
            //     .attr("fill", "#FFFFFF")
            //     .merge(figure7Title)
            //     .transition()
            //     .duration(750)
            //     .attr("opacity", 1)
            //     .attr("transform", (d, i) => {
            //       const x = 100;
            //       const y = 300 + (viewableHeight * 0.2 / 1.618) * i;
            //       return `translate(${x}, ${y})`
            //     })
            // })

            const yearTextboxesEnter = yearTextboxes
                .enter()
                .append("text")
                .attr("class", "year")
                .attr("text-anchor", "end")
                .attr("class", "year");
            yearTextboxes
                .text(d => d)
                .attr("fill", "#FFFFFF")
                .attr("text-anchor", "end")
                .attr("font-size", imageWidth / 1.618)
                .attr("opacity", 0)
                .attr("transform", function (d) {
                  const bbox = this.getBBox();
                  const startX = 10;
                  const k = yearSet.indexOf(d);

                  const x = startX + k * imageWidth + bbox.height;
                  const y = viewableHeight - bbox.width - 5;
                  return `translate(${x}, ${y}) rotate(-90) `;
                });
            yearTextboxesEnter
                .text(d => d)
                .attr("fill", "#FFFFFF")
                .attr("font-size", imageWidth / 1.618)
                .attr("opacity", 0)
                .attr("transform", function (d) {
                  const bbox = this.getBBox();
                  const startX = 10;
                  const k = yearSet.indexOf(d);

                  const x = startX + k * imageWidth + bbox.height;
                  const y = viewableHeight - bbox.width - 5;
                  return `translate(${x}, ${y}) rotate(-90) `;
                });
            const yearTextboxesMerged = yearTextboxes
                .merge(yearTextboxesEnter);
            yearTextboxesMerged
                .transition()
                .duration(750)
                .delay((d, i) => i * 10)
                .attr("opacity", 1);

            const yearCounts = svg.selectAll("text.year-counts").data(yearSet, d => d)
            yearCounts
                .enter()
                .append("text")
                .attr("class", "year-counts")
                .attr("fill", "#FFFFFF")
                .attr("text-anchor", "end")
                .attr("font-size", imageWidth / 1.618)
                .attr("opacity", d => {
                  return numVideosInYear(d) > 0 ? 1 : 0;
                })
                .text(d => numVideosInYear(d))
                .attr("transform", function (d) {
                  const bbox = this.getBBox();
                  const startX = 10;
                  const startY = viewableHeight - viewableHeight * 0.05;
                  const k = yearSet.indexOf(d);
                  const l = numVideosInYear(d);

                  const x = startX + k * imageWidth + bbox.height;
                  const y = startY - imageHeight * l - bbox.width;
                  return `translate(${x}, ${y}) rotate(-90) `;
                })
                .merge(yearCounts);
          }
        }
      });
  };

  const part8ToPart7 = () => {
    const dataSlice = data.slice(2);
    const yearMin = parseInt(dataSlice[0]["year"], 10);
    const yearMax = parseInt(dataSlice[dataSlice.length - 1]["year"], 10);
    const yearSet = [];
    
    fiveVideoTip.x = 20;
    fiveVideoTip.y = 10;
    
    for (let i = yearMin; i <= yearMax; i++) {
      yearSet.push(i.toString());
    }

    const numVideosInYear = year => {
      return dataSlice.filter(d => d["year"] === year).length;
    };

    const posInYear = (year, name) => {
      const yearSlice = dataSlice.filter(d => d["year"] === year);
      for (let i = 0; i < yearSlice.length; i++) {
        if (yearSlice[i]["name"] === name) {
          return i;
        }
      }
      return null;
    };

    (function removePart8() {
      svg.selectAll("text.duration-totals").remove();
      svg.selectAll("text.duration-axis").remove();
      svg.selectAll("rect.view-legend").remove();
      svg.selectAll("text.view-legend-text").remove();
      svg.selectAll("text.figure-8-title").remove();
      svg.selectAll("text.figure-8-axis-label").remove();
    })();

    const figure5Title = svg.selectAll("text.figure-5-title").data(["Talks", "Per", "Year"]);
    figure5Title
      .enter()
      .append("text")
      .attr("class", "figure-5-title")
      .attr("font-size", viewableHeight * 0.2 / 1.618)
      .text(d => d)
      .attr("opacity", 0)
      .attr("transform", (d, i) => {
        const x = 100;
        const y = 200 + (viewableHeight * 0.2 / 1.618) * i;
        return `translate(${x}, ${y})`
      })
      .attr("fill", "#FFFFFF")
      .merge(figure5Title)
      .transition()
      .duration(750)
      .attr("opacity", 1)
      .attr("transform", (d, i) => {
        const x = 100;
        const y = 300 + (viewableHeight * 0.2 / 1.618) * i;
        return `translate(${x}, ${y})`
      })

    // Get the min and max views for each year
    const minView = d3.min(dataSlice, d => d["views"]);
    const maxView = d3.max(dataSlice, d => d["views"]);

    const imageWidth = viewableWidth * 0.025;
    const imageHeight = viewableHeight * 0.003;
    
    const units = svg.selectAll("g")
    units.select("rect").remove();
    units
      .append("image")
      .attr("width", imageWidth)
      .attr("height", imageHeight)
      .attr("preserveAspectRatio", "none")
      .attr("xlink:href", d => {
        return thumbnailDirectory + d["thumbnail_path"];
      })
      .attr("opacity", 1)
      .attr("transform", function(d) {
        const startX = 10;
        const startY = viewableHeight - viewableHeight * 0.05;
        const k = yearSet.indexOf(d["year"]);
        const l = posInYear(d["year"], d["name"]);

        const x = startX + k * imageWidth;
        const y = startY - imageHeight * l;
        return `translate(${x}, ${y})`;
      })

    const yearTextboxes = svg
      .selectAll("text.year")
      .data(yearSet, d => d)
    const yearTextboxesEnter = yearTextboxes
      .enter()
      .append("text")
      .attr("text-anchor", "end")
      .attr("class", "year");
    const yearTextboxesMerged = yearTextboxes
      .merge(yearTextboxesEnter)
      .text(d => d)
      .attr("fill", "#FFFFFF")
      .attr("font-size", imageWidth / 1.618)
      .attr("opacity", 1)
      .attr("transform", function(d) {
        const bbox = this.getBBox();
        const startX = 10;
        const k = yearSet.indexOf(d);

        const x = startX + k * imageWidth + bbox.height;
        const y = viewableHeight - bbox.width - 5;
        return `translate(${x}, ${y}) rotate(-90) `;
      });

    const yearCounts = svg.selectAll("text.year-counts").data(yearSet, d => d)
    yearCounts
      .enter()
      .append("text")
      .attr("class", "year-counts")
      .attr("fill", "#FFFFFF")
      .attr("text-anchor", "end")
      .attr("font-size", imageWidth / 1.618)
      .attr("opacity", d => {
        return numVideosInYear(d) > 0 ? 1 : 0;
      })
      .text(d => numVideosInYear(d))
      .attr("transform", function(d) {
        const bbox = this.getBBox();
        const startX = 10;
        const startY = viewableHeight - viewableHeight * 0.05;
        const k = yearSet.indexOf(d);
        const l = numVideosInYear(d);

        const x = startX + k * imageWidth + bbox.height;
        const y = startY - imageHeight * l - bbox.width;
        return `translate(${x}, ${y}) rotate(-90) `;
      })
      .merge(yearCounts);

  };

  const introPart8 = () => {

    currentPhase = 8;
    /* Duration Histogram */
    const dataSlice = data.slice(2);
    const yearMin = parseInt(dataSlice[0]["year"], 10);
    const yearMax = parseInt(dataSlice[dataSlice.length - 1]["year"], 10);
    const yearSet = [];

    fiveVideoTip.x = 35;
    fiveVideoTip.y = 15;

    for (let i = yearMin; i <= yearMax; i++) {
      yearSet.push(i.toString());
    }

    const posInYear = (year, name) => {
      const yearSlice = dataSlice.filter(d => d["year"] === year);
      for (let i = 0; i < yearSlice.length; i++) {
        if (yearSlice[i]["name"] === name) {
          return i;
        }
      }
      return null;
    };

    const posInDuration = (duration, name) => {
      const durationSlice = dataSlice.filter(d => {
        return Math.floor(parseInt(d["duration"], 10) / 60) === duration;
      });
      for (let i = 0; i < durationSlice.length; i++) {
        if (durationSlice[i]["name"] === name) {
          return i;
        }
      }
      return null;
    };

    (function removePart7() {
      svg.selectAll("text.year-counts").remove();
      svg.selectAll("text.figure-5-title").remove();
    })();

    (function removePart9() {
      svg.selectAll("text.figure-9-axis-label").remove();
      svg.selectAll("text.figure-9-title").remove();
      svg.selectAll("text.fk-totals").remove();
      svg.selectAll("text.fk-axis").remove();
    })();

    const figure8Title = svg.selectAll("text.figure-8-title").data(["Talks", "by" ,"Duration"]);
    figure8Title
      .enter()
      .append("text")
      .attr("class", "figure-8-title")
      .attr("font-size", viewableHeight * 0.12 / 1.618)
      .text(d => d)
      .attr("opacity", 0)
      .attr("transform", (d, i) => {
        const x = 10;
        const y = (viewableHeight * 0.12 / 1.618) * i;
        return `translate(${x}, ${y})`
      })
      .attr("fill", "#FFFFFF")
      .merge(figure8Title)
      .transition()
      .duration(750)
      .attr("opacity", 1)
      .attr("transform", (d, i) => {
        const x = 10;
        const y = 100 + (viewableHeight * 0.12 / 1.618) * i;
        return `translate(${x}, ${y})`
      })

    // Get the min and max views for each year
    const minMaxPerYear = {};
    for (let i = 0; i < yearSet.length; i++) {
      const yearSlice = dataSlice.filter(d => d["year"] === yearSet[i]);
      const minViewsForYear = d3.min(yearSlice, d => +d["views"]);
      const maxViewsForYear = d3.max(yearSlice, d => +d["views"]);
      minMaxPerYear[yearSet[i]] = [minViewsForYear, maxViewsForYear]
      console.log(yearSet[i], minViewsForYear, maxViewsForYear);
    }
    console.log(minMaxPerYear);
    function normalizedView(count, min, max) {
      return (count - min) / (max - min + 0.001) * 0.5;
    }

    const imageWidth = viewableWidth * 0.025;
    const imageHeight = viewableHeight * 0.003;
    const newImageHeight = viewableHeight * 0.004;

    const yearTextboxes = svg
      .selectAll("text.year")
      .data(yearSet, d => d)
      .attr("opacity", 0);

    const units = svg.selectAll("g");

    // Total vids of each duration
    const totalVidsOfDurations = [];
    for (let i = 0; i <= 30; i++) totalVidsOfDurations.push(0);

    units.select("image").remove();
    // Append a black rectangle
    units
      .append("a")
      .attr("href", d => d.url)
      .attr("target", "_blank")
      .attr("rel", "noopener noreferrer")
      .append("rect")
      .attr("fill", d => {
        return d3.interpolateReds(1);
      })
      .attr("width", imageWidth)
      .attr("height", imageHeight)
      .attr("opacity", d => {
        const dataDuration = parseInt(d["duration"], 10);
        const durationMinutes = Math.floor(dataDuration / 60);
        return durationMinutes > 30 ? 0 : 1;
      })
      .attr("transform", function(d) {
        const startX = 10;
        const startY = viewableHeight - viewableHeight * 0.05;
        const k = yearSet.indexOf(d["year"]);
        const l = posInYear(d["year"], d["name"]);

        const x = startX + k * imageWidth;
        const y = startY - imageHeight * l;
        return `translate(${x}, ${y})`;
      })
      .transition()
      .duration(2000)
      .attr("fill", d => {
        return d3.interpolateReds(0.5 + normalizedView(parseInt(d["views"], 10), minMaxPerYear[d["year"]][0], minMaxPerYear[d["year"]][1]));
      })
      .transition()
      .attr("height", newImageHeight)
      .duration(2000)
      .attr("transform", function(d) {
        const startX = 10;
        const startY = viewableHeight - viewableHeight * 0.05;
        const dataDuration = parseInt(d["duration"], 10);
        const durationMinutes = Math.floor(dataDuration / 60);

        totalVidsOfDurations[parseInt(durationMinutes, 10)] += 1;

        const k = durationMinutes;
        const l = posInDuration(durationMinutes, d["name"]);

        const x = startX + k * imageWidth;
        const y = startY - newImageHeight * l;
        return `translate(${x}, ${y})`;
      })
      .on('end', function(d, i) {
        if (i === 0 && currentPhase === 8) {
          createLegendsAndCounts();
        }
      });
    
    function createLegendsAndCounts() {
      const durations = []
      for (let i = 0; i <= 30; i++) durations.push(i);
      const durationAxis = svg.selectAll("text.duration-axis").data(durations);
      durationAxis
        .enter()
        .append("text")
        .attr("class", "duration-axis")
        .merge(durationAxis)
        .text(d => d)
        .attr("fill", "#FFFFFF")
        .attr("font-size", imageWidth / 1.618)
        .attr("opacity", 1)
        .attr("transform", function(d) {
          const bbox = this.getBBox();
          const startX = 10;
          const startY = viewableHeight - viewableHeight * 0.05;
  
          const x = startX + d * imageWidth + imageWidth * 0.2;
          const y = startY + bbox.height;
          return `translate(${x}, ${y})`;
        })
  
      const durationTotals = svg.selectAll("text.duration-totals").data(totalVidsOfDurations)
      durationTotals
        .enter()
        .append("text")
        .attr("class", "duration-totals")
        .merge(durationTotals)
        .text(d => d)
        .attr("fill", "#FFFFFF")
        .attr("font-size", imageWidth / 1.68)
        .attr("opacity", 1)
        .attr("transform", function(d, i) {
          const startX = 10;
          const startY = viewableHeight - viewableHeight * 0.05;
  
          const x = startX + i * imageWidth;
          const y = startY - newImageHeight * d;
          return `translate(${x}, ${y})`;
        })
  
      const viewLegendPoints = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const viewLegend = svg.selectAll("rect.view-legend").data(viewLegendPoints)
      const legendBoxWidth = 15;
      const legendBoxHeight = legendBoxWidth * 2;
      viewLegend
        .enter()
        .append("rect")
        .attr("class", "view-legend")
        .merge(viewLegend)
        .attr("fill", d => d3.interpolateReds(0.5 + normalizedView(d, 1, 10)))
        .attr("width", legendBoxWidth)
        .attr("height", legendBoxHeight)
        .attr("transform", (d, i) => {
          const startX = viewableWidth - (legendBoxWidth * 10) - 15;
          const startY = 30;
          const x = startX + legendBoxWidth * i
          return `translate(${x}, ${startY})`;
        })
      const legendText = svg.selectAll("text.view-legend-text").data(["Least to greatest views,", "relative to other videos", "within the same year."])
      legendText
        .enter()
        .append("text")
        .attr("class", "view-legend-text")
        .merge(legendText)
        .attr("fill", "#FFFFFF")
        .attr("font-size", 12)
        .attr("text-anchor", "end")
        .attr("x", viewableWidth - 15)
        .attr("y", (d, i) => 70 + (i * 12))
        .text(d=>d)

      const figure8Label = svg.selectAll("text.figure-8-axis-label").data(["Duration (minutes)"])
      figure8Label
        .enter()
        .append("text")
        .attr("class", "figure-8-axis-label")
        .attr("font-size", imageWidth / 1.68)
        .text(d => "Duration (minutes)")
        .attr("opacity", 1)
        .attr("fill", "#FFFFFF")
        .attr("transform", function() {
          const bbox = this.getBBox();
          const x = viewableWidth * 0.3;
          const y = viewableHeight - bbox.height * 0.5;
          return `translate(${x}, ${y})`; 
        })
        .merge(figure8Label)
    }
  };

  const introPart9 = () => {
    currentPhase = 9;
    const dataSlice = data.slice(2);
    const yearMin = parseInt(dataSlice[0]["year"], 10);
    const yearMax = parseInt(dataSlice[dataSlice.length - 1]["year"], 10);
    const yearSet = [];

    function posInFK(fkScore, name) {
      const fkSlice = dataSlice.filter(d => {
        return parseInt(d["fk_score"], 10) === fkScore;
      });

      for (let i = 0; i < fkSlice.length; i++) {
        if (fkSlice[i]["name"] === name) {
          return i;
        }
      }
      return 0;
    }

    fiveVideoTip.x = 30;
    fiveVideoTip.y = 30;

    // Get the min and max views for each year
    const minMaxPerYear = {};
    for (let i = 0; i < yearSet.length; i++) {
      const yearSlice = dataSlice.filter(d => d["year"] === yearSet[i]);
      const minViewsForYear = d3.min(yearSlice, d => +d["views"]);
      const maxViewsForYear = d3.max(yearSlice, d => +d["views"]);
      minMaxPerYear[yearSet[i]] = [minViewsForYear, maxViewsForYear]
      console.log(yearSet[i], minViewsForYear, maxViewsForYear);
    }
    console.log(minMaxPerYear);
    for (let i = yearMin; i <= yearMax; i++) {
      yearSet.push(i.toString());
    }

    (function removePart8() {
      svg.selectAll("text.duration-totals").remove();
      svg.selectAll("text.duration-axis").remove();
      svg.selectAll("text.figure-8-title").remove();
      svg.selectAll("text.figure-8-axis-label").remove();
    })();

    // Get the min and max views for each year
    const minView = d3.min(dataSlice, d => d["views"]);
    const maxView = d3.max(dataSlice, d => d["views"]);

    const imageWidth = viewableWidth * 0.025;
    const imageHeight = viewableHeight * 0.0015;

    // Total vids of each duration
    const totalVidsOfFK = [];
    for (let i = 0; i <= 15; i++) totalVidsOfFK.push(0);

    const units = svg.selectAll("g");
    units
      .select("rect")
      .transition()
      .duration(2000)
      .attr("opacity", d => {
        let fkScore = parseInt(d["fk_score"], 10);
        if (isNaN(fkScore)) {
          return 0;
        } else {
          return 1;
        }
      })
      .attr("transform", function(d) {
        const startX = 10;
        const startY = viewableHeight - viewableHeight * 0.05;
        let fkScore = parseInt(d["fk_score"], 10);
        totalVidsOfFK[fkScore] += 1;
        if (isNaN(fkScore)) {
          return `translate(${-100}, ${startY})`;
        }

        const k = fkScore;
        const l = posInFK(fkScore, d["name"], startY);
        console.log(k, l);

        const x = startX + k * imageWidth;
        const y = startY - imageHeight * l;
        return `translate(${x}, ${y})`;
      })
      .on('end', function(d, i) {
        if (i === 0 && currentPhase === 9) {
          createLegendsAndCounts();
        }
      });

    function createLegendsAndCounts() {
      const fkScores = [];
      for (let i = 0; i <= 15; i++) fkScores.push(i);

      const fkScoresAxis = svg.selectAll("text.fk-axis").data(fkScores)
      fkScoresAxis
        .enter()
        .append("text")
        .attr("class", "fk-axis")
        .merge(fkScoresAxis)
        .text(d => d)
        .attr("fill", "#FFFFFF")
        .attr("font-size", imageWidth / 1.618)
        .attr("opacity", 1)
        .attr("transform", function(d) {
          const bbox = this.getBBox();
          const startX = 10;
          const startY = viewableHeight - viewableHeight * 0.05;
  
          const x = startX + d * imageWidth + imageWidth * 0.2;
          const y = startY + bbox.height;
          return `translate(${x}, ${y})`;
        })

      const fkScoresTotals = svg.selectAll("text.fk-totals").data(totalVidsOfFK)
      fkScoresTotals
        .enter()
        .append("text")
        .attr("class", "fk-totals")
        .merge(fkScoresTotals)
        .text(d => d)
        .attr("fill", "#FFFFFF")
        .attr("font-size", imageWidth / 1.68)
        .attr("opacity", 1)
        .attr("transform", function(d, i) {
          const startX = 10;
          const startY = viewableHeight - viewableHeight * 0.05;

          const x = startX + i * imageWidth;
          const y = startY - imageHeight * d;
          return `translate(${x}, ${y})`;
        })

      const figure9Title = svg.selectAll("text.figure-9-title").data(["Talks", "by" ,"FK Score"]);
      figure9Title
        .enter()
        .append("text")
        .attr("class", "figure-9-title")
        .attr("font-size", viewableHeight * 0.12 / 1.618)
        .text(d => d)
        .attr("opacity", 0)
        .attr("transform", (d, i) => {
          const x = viewableWidth * 0.5;
          const y = viewableHeight * 0.1 + (viewableHeight * 0.12 / 1.618) * i;
          return `translate(${x}, ${y})`
        })
        .attr("fill", "#FFFFFF")
        .merge(figure9Title)
        .transition()
        .duration(750)
        .attr("opacity", 1)
        .attr("transform", (d, i) => {
          const x = viewableWidth * 0.5;
          const y = viewableHeight * 0.15 + (viewableHeight * 0.12 / 1.618) * i;
          return `translate(${x}, ${y})`
        })

      const figure9Label = svg.selectAll("text.figure-9-axis-label").data(["Flesch-Kincaid Score"])
      figure9Label
        .enter()
        .append("text")
        .attr("class", "figure-9-axis-label")
        .attr("font-size", imageWidth / 1.68)
        .text(d => "Reading Grade Level")
        .attr("opacity", 1)
        .attr("fill", "#FFFFFF")
        .attr("transform", function() {
          const bbox = this.getBBox();
          const x = viewableWidth * 0.14;
          const y = viewableHeight - bbox.height * 0.5;
          return `translate(${x}, ${y})`; 
        })
        .merge(figure9Label)
    }
  };

  const scenePart1 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-1",
  })
    .on("start", function(e) {
      console.log(e.scrollDirection, "Part 1");
      if (e.scrollDirection === "FORWARD") {
        $(".figure1-info").css("display", "");
        introPart1();
      }
    })
    .addTo(controller);

  const scenePart2 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-2",
  })
    .on("start", function(e) {
      console.log(e.scrollDirection, "Part 2");
      if (e.scrollDirection === "FORWARD") {
        introPart2();
      } else {
        introPart1();
      }
    })
    .addTo(controller);

  const scenePart3 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-3",
  })
    .on("start", function(e) {
      console.log(e.scrollDirection, "Part 3");
      if (e.scrollDirection === "FORWARD") {
        introPart3();
      } else {
        introPart2();
      }
    })
    .addTo(controller);

  const scenePart4 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-4",
  })
    .on("start", function(e) {
      console.log(e.scrollDirection, "Part 4");
      if (e.scrollDirection === "FORWARD") {
        introPart4();
      } else {
        introPart3();
      }

      fiveVideoTip.close();
      infoController.close();
    })
    .addTo(controller);

  const scenePart5 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-5",
  })
    .on("start", function(e) {
      console.log(e.scrollDirection, "Part 5");
      if (e.scrollDirection === "FORWARD") {
        introPart5();
      } else {
        changeUnits5to4();
        introPart4();
      }

      fiveVideoTip.close();
      infoController.close();
    })
    .addTo(controller);

  const scenePart6 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-6",
  })
    .on("start", function(e) {
      console.log(e.scrollDirection, "Part 6");
      if (e.scrollDirection === "FORWARD") {
        introPart6();
      } else {
        introPart5();
      }

      fiveVideoTip.close();
      infoController.close();
    })
    .addTo(controller);

  const scenePart7 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-7",
  })
    .on("start", function(e) {
      console.log(e.scrollDirection, "Part 7");
      if (e.scrollDirection === "FORWARD") {
        introPart7();
      } else {
        const year = svg.selectAll("text.year").remove();
        const yearCounts = svg.selectAll("text.year-counts").remove();

        introPart6();
      }

      fiveVideoTip.close();
      infoController.close();
    })
    .addTo(controller);

  const scenePart8 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-8",
  })
    .on("start", function(e) {
      console.log(e.scrollDirection, "Part 8");
      if (e.scrollDirection === "FORWARD") {
        introPart8();
      } else {
        // introPart7();
        console.log("Part 8 to 7");
        part8ToPart7();
      }

      fiveVideoTip.close();
      infoController.close();
    })
    .addTo(controller);

  const scenePart9 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-9",
  })
    .on("start", function(e) {
      console.log(e.scrollDirection, "Part 9");
      if (e.scrollDirection === "FORWARD") {
        introPart9();
      } else {
        introPart8();
      }

      fiveVideoTip.close();
      infoController.close();
    })
    .addTo(controller);

  function removePart2() {
    let wurman = svg.selectAll("image.wurman").data(["wurman"]);
    wurman
      .enter()
      .append("image")
      .attr("class", "wurman")
      .attr("xlink:href", "./images/wurman.jpg")
      .attr("width", 1280 * 0.2)
      .attr("height", 720 * 0.2)
      .attr("x", -1 * 1280 * 0.2)
      .attr("y", (svgHeight - 720 * 0.2) / 2)
      .merge(wurman)
      .transition()
      .duration(750)
      .attr("x", function() {
        return this.getBBox().width * -1;
      })
      .attr("y", function() {
        return this.getBBox().y;
      })
      .on("end", function() {
        this.remove();
      });
    let marks = svg.selectAll("image.marks").data(["marks"]);
    marks
      .enter()
      .append("image")
      .attr("class", "marks")
      .attr("xlink:href", "./images/harrymarks.jpg")
      .attr("width", 1280 * 0.2)
      .attr("height", 720 * 0.2)
      .attr("x", -1 * 1280 * 0.2)
      .attr("y", (svgHeight - 720 * 0.2) / 2)
      .merge(marks)
      .transition()
      .duration(750)
      .attr("x", function() {
        return this.getBBox().width * -1;
      })
      .attr("y", function() {
        return this.getBBox().y;
      })
      .on("end", function() {
        this.remove();
      });

    let text = svg
      .selectAll("text.text-part-2")
      .remove();
  }
  function removePart4() {
    const dimmer = svg.selectAll("rect.black-fade").data(["dimmer"]);
    dimmer
      .enter()
      .append("rect")
      .attr("class", "black-fade")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .attr("x", 0)
      .attr("y", 0)
      .attr("opacity", 0)
      .merge(dimmer)
      .transition()
      .duration(300)
      .attr("opacity", 0)
      .on("end", function() {
        this.remove();
      });

    const anderson = svg.selectAll("image.anderson").data(["anderson"]);
    anderson
      .enter()
      .append("image")
      .attr("class", "anderson")
      .attr("xlink:href", "./images/anderson.jpg")
      .attr("width", 1280 * 0.4)
      .attr("height", 720 * 0.4)
      .attr("x", -1 * 1280 * 0.4)
      .attr("y", viewableHeight * 0.2)
      .merge(anderson)
      .transition()
      .duration(750)
      .attr("x", function() {
        return this.getBBox().width * -1;
      })
      .attr("y", function() {
        return this.getBBox().y;
      })
      .on("end", function() {
        this.remove();
      });
  }

  function changeUnits5to4() {
    const numImages = 10;
    const durations = [750, 750];
    const padding = 10;
    const availableWidth = viewableWidth - padding * numImages;
    const imageWidth = availableWidth / 5;
    const imageHeight = (imageWidth * thumbnailXRatio) / thumbnailYRatio;

    // Year labels
    svg.selectAll("text.year").remove();

    // Units
    const units = svg.selectAll("g").data(data.slice(2, 2 + numImages), d => d["name"]);
    const unitsEnter = units.enter().append("g");
    const toUpdate = [units, unitsEnter];
    toUpdate.forEach(elements => {
      elements
        .append("text")
        .attr("opacity", 0)
        .attr("fill", "#FFFFFF")
        .text(d => {
          return d["year"];
        })
        .attr("transform", function(d, i) {
          if (i < 5) {
            const bbox = this.getBBox();
            const x = (i + 1) * padding + i * imageWidth + (imageWidth - bbox.width) / 2;
            const y = viewableHeight - imageHeight * 2.5 + imageHeight + bbox.height;
            return `translate(${x}, ${y})`;
          } else {
            const transform = d3.select(this).attr("transform");
            return transform;
          }
        });
    });
    const unitsMerged = units.merge(unitsEnter);
    units.exit().remove();
    unitsMerged
      .on("mouseover", (d, i) => {
        if (fiveVideoTip.frozen === false) {
          infoController.open();
          infoController.setTitle(d["title"]);
          infoController.setThumbnail(d["thumbnail_url"]);
          infoController.setLink(d["url"]);
          infoController.setDescription(d["description"]);

          // Subset dataSlice
          const fiveVideoRows = dataSlice.slice(i - 2, i + 3);
          fiveVideoTip.open();
          fiveVideoTip.displayVideos(fiveVideoRows, false, false);
        }

        hovering = true;
      })
      .on("click", (d, i) => {
        console.log("Called cell click");
        infoController.open();
        infoController.setTitle(d["title"]);
        infoController.setThumbnail(d["thumbnail_url"]);
        infoController.setDescription(d["description"]);

        // Subset dataSlice
        const fiveVideoRows = dataSlice.slice(i - 2, i + 3);
        fiveVideoTip.open();
        fiveVideoTip.displayVideos(fiveVideoRows, true, true);
      })
      .on("mouseout", () => {
        hovering = false;
      })
      .transition()
      .delay((d, i) => 50 * i)
      .duration(durations[0])
      .select("image")
      .attr("width", imageWidth)
      .attr("height", imageHeight)
      .attr("transform", function(d, i) {
        if (i < 5) {
          const x = (i + 1) * padding + i * imageWidth;
          const y = viewableHeight - imageHeight * 2.5;
          return `translate(${x}, ${y})`;
        } else if (i < 10) {
          const x = (4 + 1) * padding + 4 * imageWidth;
          const y = viewableHeight - imageHeight * 2.5 - imageHeight * (i - 5 + 1);
          return `translate(${x}, ${y})`;
        } else {
          const transform = d3.select(this).attr("transform");
          return transform;
        }
      })
      .select(function() {
        return this.parentNode;
      })
      .transition()
      .delay((d, i) => 10 * i)
      .duration(durations[1])
      .select("text")
      .attr("opacity", 1);
  }
}

export { infoController };