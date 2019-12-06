import * as d3 from "d3";

function functor(v) {
  return typeof v == "function"
    ? v
    : function() {
        return v;
      };
}

export default function() {
  function initNode() {
    const node = d3.select(document.createElement("div"));
    node
      .style("position", "absolute")
      .style("top", 0)
      .style("opacity", 0)
      .style("pointer-events", "none")
      .style("box-sizing", "border-box");

    return node.node();
  }

  let direction = "n";
  let offset = [0, 0];
  let html = " ";
  let node = initNode();
  let svg = null;
  let point = null;
  let target = null;

  function getSVGNode(el) {
    el = el.node();
    if (el.tagName.toLowerCase() === "svg") return el;
    return el.ownerSVGElement;
  }

  function tip(vis) {
    if (vis.node() != null) {
      svg = getSVGNode(vis);
      point = svg.createSVGPoint();
      document.body.appendChild(node);
    }
  }

  function getNodeEl() {
    if (node == null) {
      node = initNode();
      // re-add node to DOM
      document.body.appendChild(node);
    }
    return d3.select(node);
  }

  // Private - gets the screen coordinates of a shape
  //
  // Given a shape on the screen, will return an SVGPoint for the directions
  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
  // sw(southwest).
  //
  //    +-+-+
  //    |   |
  //    +   +
  //    |   |
  //    +-+-+
  //
  // Returns an Object {n, s, e, w, nw, sw, ne, se}
  function getScreenBBox() {
    let targetel = target || d3.event.target;

    while ("undefined" === typeof targetel.getScreenCTM && "undefined" === targetel.parentNode) {
      targetel = targetel.parentNode;
    }

    const matrix = targetel.getScreenCTM(),
      tbbox = targetel.getBBox(),
      width = tbbox.width,
      height = tbbox.height,
      y = tbbox.y,
      bbox = {
        nw: point.matrixTransform(matrix),
        ne: point.matrixTransform(matrix),
        se: point.matrixTransform(matrix),
        w: point.matrixTransform(matrix),
        e: point.matrixTransform(matrix),
        n: point.matrixTransform(matrix),
        s: point.matrixTransform(matrix),
        sw: point.matrixTransform(matrix),
      };

    point.x = tbbox.x;
    point.y = y;
    bbox.nw = point.matrixTransform(matrix);
    point.x += width;
    bbox.nw = point.matrixTransform(matrix);
    point.y += height;
    bbox.se = point.matrixTransform(matrix);
    point.x -= width;
    bbox.nw = point.matrixTransform(matrix);
    point.y -= height / 2;
    bbox.w = point.matrixTransform(matrix);
    point.x += width;
    bbox.e = point.matrixTransform(matrix);
    point.x -= width / 2;
    point.y -= height / 2;
    bbox.n = point.matrixTransform(matrix);
    point.y += height;
    bbox.s = point.matrixTransform(matrix);

    return bbox;
  }

  function directionN() {
    const bbox = getScreenBBox();
    return {
      top: bbox.n.y - node.offsetHeight,
      left: bbox.n.x - node.offsetWidth / 2,
    };
  }

  function directionS() {
    const bbox = getScreenBBox();
    return {
      top: bbox.s.y,
      left: bbox.s.x - node.offsetWidth / 2,
    };
  }

  function directionE() {
    const bbox = getScreenBBox();
    return {
      top: bbox.e.y - node.offsetHeight / 2,
      left: bbox.e.x,
    };
  }

  function directionW() {
    const bbox = getScreenBBox();
    return {
      top: bbox.w.y - node.offsetHeight / 2,
      left: bbox.w.x - node.offsetWidth,
    };
  }

  function directionNW() {
    const bbox = getScreenBBox();
    return {
      top: bbox.nw.y - node.offsetHeight,
      left: bbox.nw.x - node.offsetWidth,
    };
  }

  function directionNe() {
    const bbox = getScreenBBox();
    return {
      top: bbox.ne.y - node.offsetHeight,
      left: bbox.ne.x,
    };
  }

  function directionSw() {
    const bbox = getScreenBBox();
    return {
      top: bbox.sw.y,
      left: bbox.sw.x - node.offsetWidth,
    };
  }

  function directionSe() {
    const bbox = getScreenBBox();
    return {
      top: bbox.se.y,
      left: bbox.e.x,
    };
  }

  const directionCallbacks = {
    n: directionN,
    s: directionS,
    e: directionE,
    w: directionW,
    nw: directionNW,
    ne: directionNe,
    sw: directionSw,
    se: directionSe,
  };

  const directions = Object.keys(directionCallbacks);

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tip.show = function() {
    // eslint-disable-next-line prefer-rest-params
    const args = Array.prototype.slice.call(arguments);
    if (args[args.length - 1] instanceof SVGElement) target = args.pop();
    //const content = html;
    const content = html.apply(this, args);
    const poffset = offset;
    //const poffset = (offset as any).apply(this, args);
    const dir = direction;
    const nodel = getNodeEl();
    let i = directions.length;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
      scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

    nodel
      .html(content)
      .style("position", "absolute")
      .style("opacity", 1)
      .style("pointer-events", "all");

    while (i--) nodel.classed(directions[i], false);
    let coords;
    switch (dir) {
      case "n":
        coords = directionCallbacks.n.apply(this);
        break;
      case "s":
        coords = directionCallbacks.s.apply(this);
        break;
      case "e":
        coords = directionCallbacks.e.apply(this);
        break;
      case "w":
        coords = directionCallbacks.w.apply(this);
        break;
      case "nw":
        coords = directionCallbacks.nw.apply(this);
        break;
      case "sw":
        coords = directionCallbacks.sw.apply(this);
        break;
      case "ne":
        coords = directionCallbacks.ne.apply(this);
        break;
      case "se":
        coords = directionCallbacks.se.apply(this);
        break;
    }
    nodel
      .classed(dir, true)
      .style("top", coords.top + poffset[0] + scrollTop + "px")
      .style("left", coords.left + poffset[1] + scrollLeft + "px");

    return tip;
  };

  // Public - hide the tooltip
  //
  // Returns a tip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tip.hide = function() {
    const nodel = getNodeEl();
    nodel.style("opacity", 0).style("pointer-events", "none");
    return tip;
  };

  // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  tip.attr = function(n, v) {
    if (arguments.length < 2 && typeof n === "string") {
      return getNodeEl().attr(n);
    } else {
      // eslint-disable-next-line prefer-rest-params
      const args = Array.prototype.slice.call(arguments);
      d3.selection.prototype.attr.apply(getNodeEl(), args);
    }

    return tip;
  };

  // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
  //
  // n - name of the property
  // v - value of the property
  //
  // Returns tip or style property value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
  tip.style = function(n, v) {
    // debugger;
    if (arguments.length < 2 && typeof n === "string") {
      return getNodeEl().style(n);
    } else {
      // eslint-disable-next-line prefer-rest-params
      const args = Array.prototype.slice.call(arguments);
      if (args.length === 1) {
        const styles = args[0];
        Object.keys(styles).forEach(function(key) {
          return d3.selection.prototype.style.apply(getNodeEl(), [key, styles[key]]);
        });
      }
    }

    return tip;
  };

  // Public: Set or get the direction of the tooltip
  //
  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
  //     sw(southwest), ne(northeast) or se(southeast)
  //
  // Returns tip or direction
  tip.direction = function(v) {
    if (!arguments.length) return direction;
    direction = v == null ? v : functor(v);

    return tip;
  };

  // Public: Sets or gets the offset of the tip
  //
  // v - Array of [x, y] offset
  //
  // Returns offset or
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tip.offset = function(v) {
    if (!arguments.length) return offset;
    offset = v == null ? v : functor(v);

    return tip;
  };

  // Public: sets or gets the html value of the tooltip
  //
  // v - String value of the tip
  //
  // Returns html value or tip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tip.html = function(v) {
    if (!arguments.length) return html;
    html = v == null ? v : functor(v);

    return tip;
  };

  // Public: destroys the tooltip and removes it from the DOM
  //
  // Returns a tip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tip.destroy = function() {
    if (node) {
      getNodeEl().remove();
      node = null;
    }
    return tip;
  };

  return tip;
}
