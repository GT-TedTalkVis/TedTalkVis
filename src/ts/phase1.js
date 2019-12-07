import * as d3 from 'd3';
import COLORS from '../colors';
import ScrollMagic from 'scrollmagic';
import d3Tip from 'd3-tip';
import { controller } from '../index';

export default function(div, data) {
  // Determine SVG size based on window size
  const svgWidth = window.innerWidth;
  const svgHeight = window.innerHeight;

  // Determine viewable area based on the column split.
  // Need to double check CSS.
  const viewableWidth = svgWidth * 0.6;
  const viewableHeight = svgHeight;

  // Thumbnail aspect ratio
  const thumbnailXRatio = 2;
  const thumbnailYRatio = 3;

  // Path to thumbnail images
  const thumbnailDirectory = './images/thumbnails/';

  // Set dimensions and margins of svg + graph
  const margin = {
    top: 10,
    right: 30,
    bottom: 80,
    left: 80,
  };

  // Rows and columns in the unit vis
  const rows = 60;
  const cols = data.length / rows;

  // Amount of space between each item
  const offset = 3;

  // Size of each unit
  const smallUnitWidth = (svgWidth - (cols + 1) * offset) / cols;
  const smallUnitHeight = (smallUnitWidth * thumbnailXRatio) / thumbnailYRatio;
  const medUnitWidth = svgWidth * 0.75;
  const medUnitHeight = (medUnitWidth * thumbnailYRatio) / thumbnailXRatio;
  const largeUnitWidth = viewableWidth * 0.75;
  const largeUnitHeight = (largeUnitWidth * thumbnailXRatio) / thumbnailYRatio;

  // Which view to display
  const views = { first: 0, second: 1, third: 2 };
  let currentView = views.third;

  // Tooltip initialization
  const tip = d3Tip()
    .attr('class', 'tooltip')
    .html(d => d.name);

  // Gets the row and column from the overall index
  // index is the position in the array
  // returns [col, row]
  function getColRow(index) {
    if (currentView === views.first) return [0, 0];
    if (currentView === views.second) {
    }
    const row = Math.floor(index / rows);
    const col = index % rows;
    return [col, row];
  }

  // Position scaling function based on row and column
  function scaleX(col) {
    if (currentView === views.first) return offset * (col + 1) + largeUnitWidth * col;
    else if (currentView === views.second) return offset * (col + 1) + medUnitWidth * col;
    else return offset * (col + 1) + smallUnitWidth * col;
  }
  function scaleY(row) {
    if (currentView === views.first) return offset * (row + 1) + largeUnitHeight * row;
    else if (currentView === views.second) return offset * (row + 1) + medUnitHeight * row;
    else return offset * (row + 1) + smallUnitHeight * row;
  }

  // Call this to check which view to show and update the vis accordingly
  function updateChart(newData) {
    const units = svg.selectAll('image').data(newData, d => d['name']);

    const unitsEnter = units
      .enter()
      .append('a')
      .attr('href', d => d.url)
      .attr('target', '_blank')
      .attr('rel', 'noopener noreferrer')
      .append('image')
      .attr('class', 'thumbnail')
      .attr('width', smallUnitWidth)
      .attr('height', smallUnitHeight)
      .attr('transform', (d, i) => {
        const pos = getColRow(i);
        const x = scaleX(pos[0]);
        const y = scaleY(pos[1]);
        return 'translate(' + x + ',' + y + ')';
      })
      .call(tip)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    units
      .merge(unitsEnter)
      .attr('xlink:href', d => {
        if (currentView === views.first || currentView === views.second) {
          console.log(d['thumbnail_url']);
          return d['thumbnail_url'];
        } else return thumbnailDirectory + d['thumbnail_path'];
      })
      .transition()
      .duration(750)
      .attr('width', function() {
        if (currentView === views.first) return largeUnitWidth;
        else if (currentView === views.second) return medUnitWidth;
        else return smallUnitWidth;
      })
      .attr('height', function() {
        if (currentView === views.first) return largeUnitHeight;
        else if (currentView === views.second) return medUnitHeight;
        else return smallUnitHeight;
      });

    units.exit().remove();
  }

  // Initialize all images
  const viewOne = () => {
    const units = svg.selectAll('g').data(data.slice(2, 3), d => d['name']);
    const duration = 750;
    const unitsEnter = units.enter().append('g');

    // Remove all text elements if coming back from view 2
    units.select('text').remove();

    unitsEnter
      .append('image')
      .attr('width', smallUnitWidth)
      .attr('height', smallUnitHeight)
      .attr('transform', (d, i) => {
        const pos = getColRow(i);
        const x = scaleX(pos[0]);
        const y = scaleY(pos[1]);
        return 'translate(' + x + ',' + y + ')';
      })
      .attr('xlink:href', d => {
        return thumbnailDirectory + d['thumbnail_path'];
      });

    // Transition
    const unitsMerged = units.merge(unitsEnter);

    unitsMerged
      .transition()
      .duration(duration)
      .selectAll('image')
      .attr('width', largeUnitWidth)
      .attr('height', largeUnitHeight)
      .attr('transform', () => {
        const marginTop = (viewableHeight - largeUnitHeight) / 2;
        const marginLeft = (viewableWidth - largeUnitWidth) / 2;
        return `translate(${marginLeft}, ${marginTop})`;
      });

    units.exit().remove();
  };

  const viewTwo = () => {
    console.log(viewableHeight);
    const numImages = 10;
    const durations = [750, 750];
    const padding = 10;
    const availableWidth = viewableWidth - padding * numImages;
    const imageWidth = availableWidth / 5;
    const imageHeight = (imageWidth * thumbnailXRatio) / thumbnailYRatio;
    const units = svg.selectAll('g').data(data.slice(2, 2 + numImages), d => d['name']);
    const unitsEnter = units.enter().append('g');

    // Images
    unitsEnter
      .append('image')
      .attr('width', largeUnitWidth)
      .attr('height', largeUnitHeight)
      .attr('opacity', 1)
      .attr('transform', (d, i) => {
        // If the unit is the one from viewOne(),
        // use that one's original position
        if (i == 0) {
          const marginTop = (viewableHeight - largeUnitHeight) / 2;
          const marginLeft = (viewableWidth - largeUnitWidth) / 2;
          return `translate(${marginLeft}, ${marginTop})`;
        } else if (i < 5) {
          const x = svgWidth;
          const y = (viewableHeight - largeUnitHeight) / 2;
          return 'translate(' + x + ',' + y + ')';
        } else {
          // x, y positions
          const x = 5 * padding + 4 * imageWidth;
          const y = -2 * largeUnitHeight;
          return `translate(${x}, ${y})`;
        }
      })
      .attr('xlink:href', d => {
        return thumbnailDirectory + d['thumbnail_path'];
      });
    // Text labels
    const toUpdate = [units, unitsEnter];
    toUpdate.forEach(elements => {
      elements
        .append('text')
        .attr('opacity', 0)
        .attr('fill', '#FFFFFF')
        .text(d => {
          return d['year'];
        })
        .attr('transform', function(d, i) {
          if (i < 5) {
            const bbox = this.getBBox();
            const x = (i + 1) * padding + i * imageWidth + (imageWidth - bbox.width) / 2;
            const y = viewableHeight - imageHeight * 2.5 + imageHeight + bbox.height;
            return `translate(${x}, ${y})`;
          } else {
            const transform = d3.select(this).attr('transform');
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
      .select('image')
      .attr('width', imageWidth)
      .attr('height', imageHeight)
      .attr('transform', function(d, i) {
        if (i < 5) {
          const x = (i + 1) * padding + i * imageWidth;
          const y = viewableHeight - imageHeight * 2.5;
          return `translate(${x}, ${y})`;
        } else if (i < 10) {
          const x = (4 + 1) * padding + 4 * imageWidth;
          const y = viewableHeight - imageHeight * 2.5 - imageHeight * (i - 5 + 1);
          return `translate(${x}, ${y})`;
        } else {
          const transform = d3.select(this).attr('transform');
          return transform;
        }
      })
      .select(function() {
        return this.parentNode;
      })
      .transition()
      .delay((d, i) => 10 * i)
      .duration(durations[1])
      .select('text')
      .attr('opacity', 1);
  };

  const viewThree = () => {
    
  }

  const viewFour = () => {
    const chrisTalk = svg.selectAll("image.chris").data(data.slice(32, 33));
    const chrisEnter = chrisTalk.enter().append('image');
    chrisEnter
      .attr('class', 'chris')
      .attr('width', largeUnitWidth)
      .attr('height', largeUnitHeight)
      .attr('xlink:href', d => d['thumbnail_url'])
      .attr('opacity', 0)
      .attr('transform', () => {
        const marginTop = -2 * largeUnitHeight;
        const marginLeft = (viewableWidth - largeUnitWidth) / 2;
        return `translate(${marginLeft}, ${marginTop})`;
      })
      .transition()
      .duration(750)
      .attr('opacity', 1)
      .attr('transform', () => {
        const marginTop = (viewableHeight - largeUnitHeight) / 2;
        const marginLeft = (viewableWidth - largeUnitWidth) / 2;
        return `translate(${marginLeft}, ${marginTop})`;
      })
    
  };

  const viewFive = () => {
    const duration = 750;

    const units = svg.selectAll('g');

    // These values need to be the same as the ones in viewTwo()
    const numImages = 10;
    const padding = 10;
    const availableWidth = viewableWidth - padding * numImages;
    const imageWidth = availableWidth / 5;
    const imageHeight = (imageWidth * thumbnailXRatio) / thumbnailYRatio;

    // How far to push off screen
    const pushDistance = viewableWidth * 1.5;
    // Move the images off to the side for now.
    units
      .transition()
      .duration(duration)
      .select('image')
      .attr('transform', function(d, i) {
        if (i < 5) {
          const x = (i + 1) * padding + i * imageWidth - pushDistance;
          const y = viewableHeight - imageHeight * 2.5;
          return `translate(${x}, ${y})`;
        } else if (i < 10) {
          const x = padding + 5 * imageWidth - pushDistance;
          const y = viewableHeight - imageHeight * 2.5 - imageHeight * (i - 5 + 1);
          return `translate(${x}, ${y})`;
        } else {
          const transform = d3.select(this).attr('transform');
          return transform;
        }
      })
      .select(function() {
        return this.parentNode;
      })
      .select('text')
      .attr('transform', function(d, i) {
        if (i < 5) {
          const bbox = this.getBBox();
          const x = (i + 1) * padding + i * imageWidth + (imageWidth - bbox.width) / 2 - pushDistance;
          const y = viewableHeight - imageHeight * 2.5 + imageHeight + bbox.height;
          return `translate(${x}, ${y})`;
        } else {
          const transform = d3.select(this).attr('transform');
          return transform;
        }
      });
  };

  // Create divs for scrollytelling
  const svg = div
    .append('div')
    .attr('class', 'thumbnailSVG')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  // Add scenes to controller
  const scenePhase1 = new ScrollMagic.Scene({
    triggerElement: '#thumbnailsPhase1',
  })
    .on('start', function() {
      // currentView = views.first;
      // updateChart(data.slice(0, 1));
      // console.log("Phase 1");
      console.log('Phase 1');
      viewOne();
    })
    .addTo(controller);

  const scenePhase2 = new ScrollMagic.Scene({
    triggerElement: '#thumbnailsPhase2',
  })
    .on('start', function() {
      // currentView = views.first;
      // updateChart(data.slice(0, 4));
      console.log('Phase 2');
      viewTwo();
    })
    .addTo(controller);

  const scenePhase3 = new ScrollMagic.Scene({
    triggerElement: '#thumbnailsPhase3',
  })
    .on('start', function() {
      // currentView = views.third;
      // updateChart(data);
      console.log('Phase 3');
      viewThree();
    })
    .addTo(controller);
}
