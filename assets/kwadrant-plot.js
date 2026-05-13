// Kwadrant-scatterplot — vanilla JS, inline SVG.
// Toont projecten (omzet × marge) met bubble-grootte = uren.
// Hover/klik op punt of tabelrij koppelt beide.

window.PA = window.PA || {};

(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";

  // ----- Schalen -----
  function scaleLinear(domain, range) {
    var d0 = domain[0], d1 = domain[1];
    var r0 = range[0], r1 = range[1];
    return function (v) {
      var t = (v - d0) / (d1 - d0);
      return r0 + t * (r1 - r0);
    };
  }
  function scaleSqrt(domain, range) {
    var d1 = Math.sqrt(domain[1]);
    var r0 = range[0], r1 = range[1];
    return function (v) {
      var t = Math.sqrt(Math.max(0, v)) / d1;
      return r0 + t * (r1 - r0);
    };
  }
  function median(values) {
    var s = values.slice().sort(function (a, b) { return a - b; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
  }
  // Eenvoudige nice-tick generator: stappen van 50k op een omzet-as,
  // stappen van 5% op een procent-as. Voor deze data ruim voldoende.
  function ticks(min, max, step) {
    var t = [];
    var start = Math.ceil(min / step) * step;
    for (var v = start; v <= max + 0.0001; v += step) t.push(Math.round(v * 100) / 100);
    return t;
  }
  function niceMax(v, step) {
    return Math.ceil(v / step) * step;
  }
  function niceMin(v, step) {
    return Math.floor(v / step) * step;
  }

  // ----- SVG helpers -----
  function el(tag, attrs, text) {
    var n = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) {
          n.setAttribute(k, attrs[k]);
        }
      }
    }
    if (text != null) n.textContent = text;
    return n;
  }

  // ----- Render -----
  function render(opts) {
    var container = opts.container;
    var tabel = opts.tabel;
    var projecten = opts.projecten;

    var W = 720, H = 480;
    var margin = { top: 24, right: 32, bottom: 56, left: 72 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var INK = "#1D0C0C";
    var SLATE = "#727272";
    var INK_300 = "#B8B0AC";
    var AMBER = "#F2B969";
    var AMBER_500 = "#C98634";
    var POSITIVE = "#3F7D4E";
    var NEGATIVE = "#A2382B";

    var omzetVals = projecten.map(function (p) { return p.omzet; });
    var margeVals = projecten.map(function (p) { return p.margePercent; });
    var urenVals = projecten.map(function (p) { return p.totaalUren; });

    var xStep = 50000;
    var yStep = 5;
    var xMax = niceMax(Math.max.apply(null, omzetVals) * 1.05, xStep);
    var yMin = niceMin(Math.min(0, Math.min.apply(null, margeVals) - 2), yStep);
    var yMax = niceMax(Math.max.apply(null, margeVals) + 2, yStep);

    var x = scaleLinear([0, xMax], [0, iw]);
    var y = scaleLinear([yMin, yMax], [ih, 0]);
    var r = scaleSqrt([0, Math.max.apply(null, urenVals)], [5, 22]);

    var xMed = median(omzetVals);
    var yMed = median(margeVals);

    // SVG-root
    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Scatterplot: omzet versus marge per project",
    });
    container.appendChild(svg);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Kwadrant-tints
    g.appendChild(el("rect", {
      x: x(xMed), y: 0,
      width: iw - x(xMed), height: y(yMed),
      fill: POSITIVE, "fill-opacity": 0.04,
    }));
    g.appendChild(el("rect", {
      x: 0, y: y(yMed),
      width: x(xMed), height: ih - y(yMed),
      fill: NEGATIVE, "fill-opacity": 0.04,
    }));

    // Mediaan-lijnen
    g.appendChild(el("line", {
      x1: x(xMed), y1: 0, x2: x(xMed), y2: ih,
      stroke: INK_300, "stroke-dasharray": "4 4", "stroke-width": 1,
    }));
    g.appendChild(el("line", {
      x1: 0, y1: y(yMed), x2: iw, y2: y(yMed),
      stroke: INK_300, "stroke-dasharray": "4 4", "stroke-width": 1,
    }));

    // Kwadrant-labels
    function label(text, xPos, yPos, anchor) {
      var t = el("text", {
        x: xPos, y: yPos,
        "text-anchor": anchor,
        fill: SLATE,
        "font-size": 11,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
      }, text);
      g.appendChild(t);
    }
    label("groot & gezond",     iw - 8, 14, "end");
    label("klein & gezond",     8,      14, "start");
    label("groot & marge-arm",  iw - 8, ih - 8, "end");
    label("klein & marge-arm",  8,      ih - 8, "start");

    // Assen — eigen rendering om visx kwijt te raken
    // X-as
    g.appendChild(el("line", {
      x1: 0, y1: ih, x2: iw, y2: ih, stroke: INK_300,
    }));
    ticks(0, xMax, xStep).forEach(function (v) {
      var px = x(v);
      g.appendChild(el("line", {
        x1: px, y1: ih, x2: px, y2: ih + 5, stroke: INK_300,
      }));
      g.appendChild(el("text", {
        x: px, y: ih + 18,
        "text-anchor": "middle",
        fill: SLATE,
        "font-size": 11,
        "font-family": "Roboto, sans-serif",
      }, "€ " + (v / 1000) + "k"));
    });
    g.appendChild(el("text", {
      x: iw / 2, y: ih + 44,
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Omzet per project"));

    // Y-as
    g.appendChild(el("line", {
      x1: 0, y1: 0, x2: 0, y2: ih, stroke: INK_300,
    }));
    ticks(yMin, yMax, yStep).forEach(function (v) {
      var py = y(v);
      g.appendChild(el("line", {
        x1: 0, y1: py, x2: -5, y2: py, stroke: INK_300,
      }));
      g.appendChild(el("text", {
        x: -10, y: py + 3,
        "text-anchor": "end",
        fill: SLATE,
        "font-size": 11,
        "font-family": "Roboto, sans-serif",
      }, v + "%"));
    });
    g.appendChild(el("text", {
      x: -ih / 2, y: -52,
      transform: "rotate(-90)",
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Marge"));

    // Punten
    var circlesById = {};
    projecten.forEach(function (p) {
      var isNeg = p.margePercent < 0;
      var c = el("circle", {
        class: "point",
        "data-id": p.id,
        cx: x(p.omzet),
        cy: y(p.margePercent),
        r: r(p.totaalUren),
        fill: isNeg ? NEGATIVE : INK,
        "fill-opacity": 0.5,
        stroke: isNeg ? NEGATIVE : INK,
        "stroke-width": 1,
        "stroke-opacity": 0.8,
      });
      g.appendChild(c);
      circlesById[p.id] = { el: c, baseFill: isNeg ? NEGATIVE : INK };
    });

    // ----- Tabel -----
    var rowsById = {};
    var sorted = projecten.slice().sort(function (a, b) { return b.omzet - a.omzet; });

    tabel.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tabel-wrap";
    var table = document.createElement("table");
    table.className = "tabel";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Project</th>" +
      "<th>Klant</th>" +
      "<th class=\"num\">Omzet</th>" +
      "<th class=\"num\">Marge</th>" +
      "<th class=\"num\">Uren</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    sorted.forEach(function (p) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", p.id);
      tr.innerHTML =
        "<td><strong>" + p.id + "</strong></td>" +
        "<td>" + p.klant + "<div class=\"sub\">" + p.machine + "</div></td>" +
        "<td class=\"num\">" + F.euro(p.omzet) + "</td>" +
        "<td class=\"num" + (p.margePercent < 0 ? " negative" : "") + "\">" +
        F.percent(p.margePercent) + "</td>" +
        "<td class=\"num muted\">" + F.uren(p.totaalUren) + "</td>";
      tbody.appendChild(tr);
      rowsById[p.id] = tr;
    });

    // ----- Koppeling -----
    var hoveredId = null;
    var selectedId = null;

    function activeId() { return hoveredId || selectedId; }

    function applyState() {
      var active = activeId();
      Object.keys(circlesById).forEach(function (id) {
        var c = circlesById[id];
        var isActive = active === id;
        var isFaded = active != null && !isActive;
        c.el.setAttribute("fill", isActive ? AMBER : c.baseFill);
        c.el.setAttribute("stroke", isActive ? AMBER_500 : c.baseFill);
        c.el.setAttribute("stroke-width", isActive ? 2 : 1);
        c.el.setAttribute("fill-opacity", isFaded ? 0.12 : 0.5);
        c.el.setAttribute("stroke-opacity", isFaded ? 0.2 : 0.8);
      });
      Object.keys(rowsById).forEach(function (id) {
        var tr = rowsById[id];
        var isActive = active === id;
        var isFaded = active != null && !isActive;
        tr.classList.toggle("is-active", isActive);
        tr.classList.toggle("is-faded", isFaded);
      });
      // Scroll geselecteerde rij in beeld
      if (active && rowsById[active]) {
        rowsById[active].scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    function setHover(id) { hoveredId = id; applyState(); }
    function setSelect(id) {
      selectedId = selectedId === id ? null : id;
      applyState();
    }

    // Listeners — punten
    Object.keys(circlesById).forEach(function (id) {
      var c = circlesById[id].el;
      c.addEventListener("mouseenter", function () { setHover(id); });
      c.addEventListener("mouseleave", function () { setHover(null); });
      c.addEventListener("click", function (e) {
        e.stopPropagation();
        setSelect(id);
      });
    });
    svg.addEventListener("click", function () {
      selectedId = null; applyState();
    });

    // Listeners — tabelrijen
    Object.keys(rowsById).forEach(function (id) {
      var tr = rowsById[id];
      tr.addEventListener("mouseenter", function () { setHover(id); });
      tr.addEventListener("mouseleave", function () { setHover(null); });
      tr.addEventListener("click", function () { setSelect(id); });
    });
  }

  window.PA.kwadrantPlot = render;
})();
