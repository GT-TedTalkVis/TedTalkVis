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

  function toggleDimming(state) {
    if (state === "on") {
      const dimmer = svg
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
      .attr("height", 720 * 0.5);
  };

  const introPart5 = () => {
    const duration = 750;

    toggleDimming("off");

    let anderson = svg.select("image.anderson");
    if (!anderson.empty()) {
      anderson
        .transition()
        .duration(duration)
        .attr("width", 1280 * 0.4)
        .attr("height", 720 * 0.4)
        .attr("x", -1 * 1280 * 0.4)
        .attr("y", viewableHeight * 0.2);
    }

    const units = svg.selectAll("g").data(data.slice(2, 176), d => d["name"]);
    const unitsEnter = units.enter().append("g");

    // Remove all text elements for now.
    units.select("text").remove();

    //
  };

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
}
