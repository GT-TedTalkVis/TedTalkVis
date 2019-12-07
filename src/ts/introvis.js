import * as d3 from "d3";
import COLORS from "../colors";
import ScrollMagic from "scrollmagic";
import d3Tip from "d3-tip";
import { controller } from "../index";

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

  // Initialize tooltip
  const tip = d3Tip()
    .attr("class", "tooltip")
    .html(d => d.name);

  // Initialize some high quality graphics
  const wurman = svg
    .append("image")
    .attr("class", "wurman")
    .attr("xlink:href", "./images/wurman.jpg")
    .attr("width", 1280 * 0.2)
    .attr("height", 720 * 0.2)
    .attr("x", -1 * 1280 * 0.2)
    .attr("y", (svgHeight - 720 * 0.2) / 2);
  const marks = svg
    .append("image")
    .attr("class", "marks")
    .attr("xlink:href", "./images/harrymarks.jpg")
    .attr("width", 1280 * 0.2)
    .attr("height", 720 * 0.2)
    .attr("x", -1 * 1280 * 0.2)
    .attr("y", (svgHeight - 720 * 0.2) / 2);

  function removeImages() {
    // Cleanup function for floating images like
    // wurman, marks, anderson
    [wurman, marks].forEach(im => {
      im.transition()
        .duration(750)
        .attr("transform", function() {
          const bbox = this.getBBox();
          return `translate(${bbox.x}, ${-bbox.height})`;
        })
        .on('end', function() {
          im.remove();
        })
    });

    let anderson = svg.select("image.anderson");
    if (!anderson.empty()) {
      anderson
        .transition()
        .duration(750)
        .attr("width", 1280 * 0.4)
        .attr("height", 720 * 0.4)
        .attr("x", -1 * 1280 * 0.4)
        .attr("y", viewableHeight * 0.2)
        .on('end', function() {
          anderson.remove();
        })
    }
  }
  function toggleDimming(state) {
    if (state === "on") {
      let dimmer = svg.select("rect.black-fade")
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
          .attr("opacity", 0.6);
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

  const introPart1 = direction => {
    const duration = 750;

    if (direction === "enter") {
      wurman
        .transition()
        .duration(duration)
        .attr("x", viewableWidth * 0.2)
        .attr("y", viewableHeight * 0.2)
        .attr("width", 1280 * 0.2)
        .attr("height", 720 * 0.2);
      marks
        .transition()
        .duration(duration)
        .attr("x", viewableWidth * 0.4)
        .attr("y", viewableHeight * 0.6)
        .attr("width", 1280 * 0.2)
        .attr("height", 720 * 0.2);
    }
  };

  const introPart2 = direction => {
    const duration = 750;
    const padding = 20;
    const width = (viewableWidth - padding * 2) / 2;
    const height = width * 1.7777;
    const marginTop = viewableHeight * 0.2;

    if (direction === "enter") {
      wurman
        .transition()
        .duration(duration)
        .attr("width", width)
        .attr("height", height)
        .attr("x", padding)
        .attr("y", marginTop);

      marks
        .transition()
        .duration(duration)
        .attr("width", width)
        .attr("height", height)
        .attr("x", padding)
        .attr("y", marginTop);

      const units = svg.selectAll("g").data(data.slice(2, 3), d => d["name"]);
      const unitsEnter = units.enter().append("g");

      // Remove all text elements if coming back from view 2
      units.select("text").remove();

      unitsEnter
        .append("image")
        .attr("width", 300)
        .attr("height", 400)
        .attr("transform", `translate(-300, ${(viewableHeight - 400) / 2})`)
        .attr("xlink:href", d => {
          return thumbnailDirectory + d["thumbnail_path"];
        });

      // Transition
      const unitsMerged = units.merge(unitsEnter);

      unitsMerged
        .transition()
        .duration(duration)
        .selectAll("image")
        .attr("width", largeUnitWidth)
        .attr("height", largeUnitHeight)
        .attr("transform", () => {
          const marginTop = (viewableHeight - largeUnitHeight) / 2;
          const marginLeft = (viewableWidth - largeUnitWidth) / 2;
          return `translate(${marginLeft}, ${marginTop})`;
        });

      units.exit().remove();
    }
  };

  const introPart3 = () => {
    const numImages = 10;
    const durations = [750, 750];
    const padding = 10;
    const availableWidth = viewableWidth - padding * numImages;
    const imageWidth = availableWidth / 5;
    const imageHeight = (imageWidth * thumbnailXRatio) / thumbnailYRatio;

    const units = svg.selectAll("g").data(data.slice(2, 2 + numImages), d => d["name"]);
    const unitsEnter = units.enter().append("g");

    // Make wurman, marks, anderson leave
    [wurman, marks].forEach(im => {
      im.transition()
        .duration(750)
        .attr("transform", function() {
          const bbox = this.getBBox();
          return `translate(${bbox.x}, ${-bbox.height})`;
        });
    });

    // Turn off dimmer if scrolling upwards
    toggleDimming('off');

    // Images
    unitsEnter
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
      });
    // Text labels
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

    // Transition
    const unitsMerged = units.merge(unitsEnter);

    unitsMerged
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
  };

  const introPart4 = () => {
    const duration = 750;
    const padding = 10; // Needs to be the same as above function.

    toggleDimming("on");

    let anderson = svg.select("image.anderson");
    console.log(anderson.empty());

    if (anderson.empty()) {
      anderson = svg
        .append("image")
        .attr("class", "anderson")
        .attr("xlink:href", "./images/anderson.jpg")
        .attr("width", 1280 * 0.4)
        .attr("height", 720 * 0.4)
        .attr("x", -1 * 1280 * 0.4)
        .attr("y", viewableHeight * 0.2);
    }

    anderson
      .transition()
      .duration(duration)
      .attr("x", (viewableWidth - 1280 * 0.5) / 2)
      .attr("y", (viewableHeight - 720 * 0.5) / 2)
      .attr("width", 1280 * 0.5)
      .attr("height", 720 * 0.5)
  };

  const introPart5 = () => {
    const dataSlice = data.slice(2, 176);
    const years = [];
    for (let i = 0; i < dataSlice.length; i++) {
      years.push(dataSlice[i]["year"]);
    }
    const yearSet = [...(new Set(years))];
    const numYears = yearSet.length;
    const newYears = yearSet.slice(yearSet.indexOf("2001"));
    const numVideosInYear = year => {
      return dataSlice.filter(d => d["year"] === year).length; 
    }
    const posInYear = (year, name) => {
      const yearSlice = dataSlice.filter(d => d["year"] === year);
      for (let i = 0; i < yearSlice.length; i++) {
        if (yearSlice[i]["name"] === name) {
          return i;
        }
      }
      return null;
    }

    
    const duration = 750;
    const padding = 10;
    const availableWidth = viewableWidth - padding * 10;
    const oldImageWidth = availableWidth / 5;
    const oldImageHeight = oldImageWidth * thumbnailXRatio / thumbnailYRatio;
    const newImageWidth = (viewableWidth - padding * numYears) / numYears * 0.4;
    const newImageHeight = newImageWidth * 0.45;

    toggleDimming("off");
    removeImages();

    const units = svg.selectAll("g").data(dataSlice, d => d["name"]);
    const unitsEnter = units.enter().append("g");

    // Remove all text elements for now.
    units.select("text").remove();

    
    units.select("image").attr("preserveAspectRatio", "none");
    // Have d3 enter the missing images.
    unitsEnter
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
      })
      // Append text
      const yearTextboxes = svg.selectAll("text.year").data(yearSet, d => d);
      const yearTextboxesEnter = yearTextboxes.enter().append("text").attr("class", "year");
      yearTextboxesEnter
        .text(d => d)
        .attr("fill", "#FFFFFF")
        .attr("font-size", "12")
        .attr("opacity", 0)
        .attr("transform", function(d) {
          const bbox = this.getBBox();
          const startX = 10;
          const startY = viewableHeight - newImageHeight * 1.5;
          const l = numVideosInYear(d);
          const k = yearSet.indexOf(d);

          const x = startX + k * newImageWidth + bbox.height;
          const y = startY - newImageHeight * l;
          return `translate(${x}, ${y}) rotate(-90) `;
        })


      // Transition
      const unitsMerged = units.merge(unitsEnter);
      const yearTextboxesMerged = yearTextboxes.merge(yearTextboxesEnter);
      unitsMerged
        .transition()
        .duration(750)
        .select("image")
        .attr("width", newImageWidth)
        .attr("height", newImageHeight)
        .attr("opacity", 1)
        .attr("transform", function(d, i) {
          const startX = 10;
          const startY = viewableHeight - newImageHeight * 1.5;
          const k = yearSet.indexOf(d["year"]);
          const l = posInYear(d["year"], d["name"]);

          const x = startX + k * newImageWidth;
          const y = startY - newImageHeight * l;
          return `translate(${x}, ${y})`;
        }).on('end', () => {
          yearTextboxesMerged
            .transition()
            .duration(400)
            .delay((d, i) => 100 * i)
            .attr("opacity", 1)
        })
      
  };

  const introPart6 = () => {
    const dataSlice = data.slice(2, 226);
    const years = [];
    for (let i = 0; i < dataSlice.length; i++) {
      years.push(dataSlice[i]["year"]);
    }
    const yearSet = [...(new Set(years))];
    const numYears = yearSet.length;
    const newYears = yearSet.slice(yearSet.indexOf("2001"));
    const numVideosInYear = year => {
      return dataSlice.filter(d => d["year"] === year).length; 
    }
    const posInYear = (year, name) => {
      const yearSlice = dataSlice.filter(d => d["year"] === year);
      for (let i = 0; i < yearSlice.length; i++) {
        if (yearSlice[i]["name"] === name) {
          return i;
        }
      }
      return null;
    }

    toggleDimming("off")
    removeImages();

    const padding = 10;
    const oldImageWidth = (viewableWidth - padding * 10) / (numYears - 1) * 0.4;
    const oldImageHeight = oldImageWidth * 0.45;
    // const newImageWidth = (viewableWidth - padding * numYears) / numYears * 0.4;
    // const newImageHeight = newImageWidth * 0.45;

    const units = svg.selectAll("g").data(dataSlice, d => d["name"]);
    units.select("image").attr("preserveAspectRatio", "none");
    const unitsEnter = units.enter().append("g");

    unitsEnter
      .append("image")
      .attr("width", oldImageWidth)
      .attr("height", oldImageHeight)
      .attr("xlink:href", d => {
        return thumbnailDirectory + d["thumbnail_path"];
      })
      .attr("preserveAspectRatio", "none")
      .attr("opacity", 0)
      .attr("transform", function(d, i) {
        const startX = 10;
        const startY = viewableHeight - oldImageHeight * 1.5;
        const k = yearSet.indexOf(d["year"]);
        const l = posInYear(d["year"], d["name"]);

        const x = startX + k * oldImageWidth;
        const y = startY - oldImageHeight * l;
        return `translate(${x}, ${y})`;
      })

    const yearTextboxes = svg.selectAll("text.year").data(yearSet, d => d);
    const yearTextboxesEnter = yearTextboxes.enter().append("text").attr("class", "year");
    yearTextboxesEnter
      .text(d => d)
      .attr("fill", "#FFFFFF")
      .attr("font-size", "12")
      .attr("opacity", 0)
      .attr("transform", function(d) {
        const bbox = this.getBBox();
        const startX = 10;
        const startY = viewableHeight - oldImageHeight * 1.5;
        const l = numVideosInYear(d);
        const k = yearSet.indexOf(d);

        const x = startX + k * oldImageWidth + bbox.height;
        const y = startY - oldImageHeight * l;
        return `translate(${x}, ${y}) rotate(-90) `;
      })

    const unitsMerged = units.merge(unitsEnter);
    const yearTextboxesMerged = yearTextboxes.merge(yearTextboxesEnter);
    unitsMerged
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
      .attr("opacity", 1)
      .on('end', function(d, i) {
        if (i === dataSlice.length - 1) {
          yearTextboxesMerged
              .transition()
              .duration(400)
              .attr("opacity", 1)
        }
      })
  }

  const introPart7 = () => {
    const dataSlice = data.slice(2);
    const yearMin = parseInt(dataSlice[0]["year"], 10);
    const yearMax = parseInt(dataSlice[dataSlice.length - 1]["year"], 10);
    const yearSet = [];
    for (let i = yearMin; i <= yearMax; i++) {
      yearSet.push(i.toString());
    }

    const numVideosInYear = year => {
      return dataSlice.filter(d => d["year"] === year).length; 
    }
    const posInYear = (year, name) => {
      const yearSlice = dataSlice.filter(d => d["year"] === year);
      for (let i = 0; i < yearSlice.length; i++) {
        if (yearSlice[i]["name"] === name) {
          return i;
        }
      }
      return null;
    }

    toggleDimming("off")
    removeImages();

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
        const startY = viewableHeight - (viewableHeight * 0.05);
        const k = yearSet.indexOf(d["year"]);
        const l = posInYear(d["year"], d["name"]);

        const x = startX + k * imageWidth;
        const y = startY - imageHeight * l;
        return `translate(${x}, ${y})`;
      }).on('end', function(d, i) {
        if (i === 223) {
          const unitsEnter = units.enter().append("g");
          unitsEnter
            .append("image")
            .attr("xlink:href", d => {
              return thumbnailDirectory + d["thumbnail_path"];
            })
            .attr("preserveAspectRatio", "none")
            .attr("width", imageWidth)
            .attr("height", imageHeight)
            .attr("opacity", 0)
            .attr("transform", function(d) {
              const startX = 10;
              const startY = viewableHeight - (viewableHeight * 0.05);
              const k = yearSet.indexOf(d["year"]);
              const l = posInYear(d["year"], d["name"]);
      
              const x = startX + k * imageWidth;
              const y = startY - imageHeight * l;
              return `translate(${x}, ${y})`;
            })

          const unitsMerged = units.merge(unitsEnter);
          unitsMerged
            .transition()
            .duration(0)
            .delay((d, i) => i)
            .select("image")
            .attr("opacity", 1)

          const yearTextboxesEnter = yearTextboxes.enter().append("text").attr("class", "year");
          yearTextboxes
            .text(d => d)
            .attr("fill", "#FFFFFF")
            .attr("font-size", imageWidth / 1.618)
            .attr("opacity", 1)
            .attr("transform", function(d) {
              const bbox = this.getBBox();
              const startX = 10;
              const k = yearSet.indexOf(d);
              
              const x = startX + k * imageWidth + bbox.height;
              const y = viewableHeight;
              return `translate(${x}, ${y}) rotate(-90) `;
            })
          yearTextboxesEnter
            .text(d => d)
            .attr("fill", "#FFFFFF")
            .attr("font-size", imageWidth / 1.618)
            .attr("opacity", 1)
            .attr("transform", function(d) {
              const bbox = this.getBBox();
              const startX = 10;
              const k = yearSet.indexOf(d);
              
              const x = startX + k * imageWidth + bbox.height;
              const y = viewableHeight;
              return `translate(${x}, ${y}) rotate(-90) `;
            })
          const yearTextboxesMerged = yearTextboxes.merge(yearTextboxesEnter);
        }
      })
  }

  const introPart8 = () => {
    const dataSlice = data.slice(2);
    const yearMin = parseInt(dataSlice[0]["year"], 10);
    const yearMax = parseInt(dataSlice[dataSlice.length - 1]["year"], 10);
    const yearSet = [];
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
    }

    const posInDuration = (duration, name) => {
      const durationSlice = dataSlice.filter(d => {
        return Math.floor(parseInt(d["duration"], 10) / 60) === duration
      });
      for (let i = 0; i < durationSlice.length; i++) {
        if (durationSlice[i]["name"] === name) {
          return i;
        }
      }
      return null;
    }

    // Get the min and max views for each year
    const minView = d3.min(dataSlice, d => d["views"]);
    const maxView = d3.max(dataSlice, d => d["views"]);
    function normalizedView(count) {
      return (count - minView) / (maxView - minView);
    }


    toggleDimming("off")
    removeImages();

    const imageWidth = viewableWidth * 0.025;
    const imageHeight = viewableHeight * 0.003;
    const newImageHeight = viewableHeight * 0.004;

    const yearTextboxes = svg
      .selectAll("text.year")
      .data(yearSet, d => d)
      .attr("opacity", 0);

    const units = svg.selectAll("g");

    units.select("image").remove()
    // Append a black rectangle
    units
      .append("rect")
      .attr("fill", d => {
        return d3.interpolateReds(0);
      })
      .attr("width", imageWidth)
      .attr("height", imageHeight)
      .attr("transform", function(d) {
        const startX = 10;
        const startY = viewableHeight - (viewableHeight * 0.05);
        const k = yearSet.indexOf(d["year"]);
        const l = posInYear(d["year"], d["name"]);

        const x = startX + k * imageWidth;
        const y = startY - imageHeight * l;
        return `translate(${x}, ${y})`;
      })
      .transition()
      .duration(2000)
      .attr("fill", d => {
        return d3.interpolateReds(normalizedView(parseInt(d["views"], 10)));
      })
      .transition()
      .attr("height", newImageHeight)
      .duration(2000)
      .attr("transform", function(d) {
        const startX = 10;
        const startY = viewableHeight - (viewableHeight * 0.05);
        const dataDuration = parseInt(d["duration"], 10);
        const durationMinutes = Math.floor(dataDuration / 60);
        const k = durationMinutes;
        const l = posInDuration(durationMinutes, d["name"]);

        const x = startX + k * imageWidth;
        const y = startY - newImageHeight * l;
        return `translate(${x}, ${y})`;
      })
  }

  const introPart9 = () => {
    const dataSlice = data.slice(2);

    function posInFK(fkScore, name) {
      const fkSlice = dataSlice.filter(d => {
        return parseInt(d["fk_score"], 10) === fkScore;
      })

      for (let i = 0; i < fkSlice.length; i++) {
        if (fkSlice[i]["name"] === name) {
          return i;
        }
      }
      return 0;
    }

    // Get the min and max views for each year
    const minView = d3.min(dataSlice, d => d["views"]);
    const maxView = d3.max(dataSlice, d => d["views"]);

    toggleDimming("off")
    removeImages();

    const imageWidth = viewableWidth * 0.025;
    const imageHeight = viewableHeight * 0.0015;

    const units = svg.selectAll("g");
    units.select("rect")
      .transition()
      .duration(2000)
      .attr("transform", function(d) {
        const startX = 10;
        const startY = viewableHeight - (viewableHeight * 0.05);
        let fkScore = parseInt(d["fk_score"], 10);
        if (fkScore === 0) {
          return `translate(${-100}, ${startY})`
        }
        const k = fkScore;
        const l = posInFK(fkScore, d["name"], startY);

        const x = startX + k * imageWidth;
        const y = startY - imageHeight * l;
        return `translate(${x}, ${y})`;
      })

  }

  const scenePart1 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-1",
  })
    .on("start", function() {
      introPart1("enter");
    })
    .addTo(controller);

  const scenePart2 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-2",
  })
    .on("start", function() {
      introPart2("enter");
    })
    .addTo(controller);

  const scenePart3 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-3",
  })
    .on("start", function() {
      introPart3("enter");
    })
    .addTo(controller);

  const scenePart4 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-4",
  })
    .on("start", function() {
      introPart4("enter");
    })
    .addTo(controller);

  const scenePart5 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-5",
  })
    .on("start", function() {
      introPart5("enter");
    })
    .addTo(controller);

  const scenePart6 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-6",
  })
    .on("start", function() {
      introPart6("enter");
    })
    .addTo(controller);

  const scenePart7 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-7",
  })
    .on("start", function() {
      introPart7("enter");
    })
    .addTo(controller);

  const scenePart8 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-8",
  })
    .on("start", function() {
      introPart8("enter");
    })
    .addTo(controller);

  const scenePart9 = new ScrollMagic.Scene({
    triggerElement: "#intro-part-9",
  })
    .on("start", function() {
      console.log("Part 9");
      introPart9();
    })
    .addTo(controller);
}
