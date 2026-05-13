// Doorlooptijd-scatterplot — vanilla JS, inline SVG.
// Toont projecten (geplande × werkelijke doorlooptijd) met diagonaal y = x
// als "op tijd". Bubble-grootte = uren. Hover/klik koppelt punt en tabelrij.

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
  function ticks(min, max, step) {
    var t = [];
    var start = Math.ceil(min / step) * step;
    for (var v = start; v <= max + 0.0001; v += step) t.push(Math.round(v * 100) / 100);
    return t;
  }
  function niceMax(v, step) { return Math.ceil(v / step) * step; }

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

    // Drempel: meer dan 20% uitloop telt visueel als "structureel uit".
    var UITLOOP_DREMPEL = 0.20;
    function uitloopRatio(p) {
      return (p.werkelijkeDoorlooptijdWeken - p.geplandeDoorlooptijdWeken) /
             p.geplandeDoorlooptijdWeken;
    }
    function uitloopWeken(p) {
      return p.werkelijkeDoorlooptijdWeken - p.geplandeDoorlooptijdWeken;
    }

    var geplandVals = projecten.map(function (p) { return p.geplandeDoorlooptijdWeken; });
    var werkelijkVals = projecten.map(function (p) { return p.werkelijkeDoorlooptijdWeken; });
    var urenVals = projecten.map(function (p) { return p.totaalUren; });

    var step = 5;
    var rawMax = Math.max(
      Math.max.apply(null, geplandVals),
      Math.max.apply(null, werkelijkVals)
    );
    var domainMax = niceMax(rawMax + 2, step);

    var x = scaleLinear([0, domainMax], [0, iw]);
    var y = scaleLinear([0, domainMax], [ih, 0]);
    var r = scaleSqrt([0, Math.max.apply(null, urenVals)], [5, 22]);

    // SVG-root
    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Scatterplot: geplande versus werkelijke doorlooptijd per project",
    });
    container.appendChild(svg);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Tint boven en onder de diagonaal (uitloop / vooruit op planning).
    // Onder de diagonaal (werkelijk < gepland) is heel klein in deze data,
    // maar visueel net zo geldig.
    g.appendChild(el("polygon", {
      points: "0,0 " + iw + ",0 " + iw + "," + y(domainMax),
      fill: NEGATIVE, "fill-opacity": 0.04,
    }));
    g.appendChild(el("polygon", {
      points: "0," + ih + " " + iw + "," + ih + " 0,0",
      fill: POSITIVE, "fill-opacity": 0.04,
    }));

    // Diagonaal y = x
    g.appendChild(el("line", {
      x1: 0, y1: ih, x2: iw, y2: 0,
      stroke: INK_300, "stroke-dasharray": "4 4", "stroke-width": 1,
    }));

    // Labels boven/onder diagonaal
    function label(text, xPos, yPos, anchor) {
      g.appendChild(el("text", {
        x: xPos, y: yPos,
        "text-anchor": anchor,
        fill: SLATE,
        "font-size": 11,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
      }, text));
    }
    label("loopt uit",        iw - 8, 14,      "end");
    label("op of voor tijd",  8,      ih - 8,  "start");

    // X-as
    g.appendChild(el("line", { x1: 0, y1: ih, x2: iw, y2: ih, stroke: INK_300 }));
    ticks(0, domainMax, step).forEach(function (v) {
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
      }, v + "w"));
    });
    g.appendChild(el("text", {
      x: iw / 2, y: ih + 44,
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Geplande doorlooptijd (weken)"));

    // Y-as
    g.appendChild(el("line", { x1: 0, y1: 0, x2: 0, y2: ih, stroke: INK_300 }));
    ticks(0, domainMax, step).forEach(function (v) {
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
      }, v + "w"));
    });
    g.appendChild(el("text", {
      x: -ih / 2, y: -52,
      transform: "rotate(-90)",
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Werkelijke doorlooptijd (weken)"));

    // Punten
    var circlesById = {};
    projecten.forEach(function (p) {
      var heeftUitloop = uitloopRatio(p) > UITLOOP_DREMPEL;
      var fill = heeftUitloop ? NEGATIVE : INK;
      var c = el("circle", {
        class: "point",
        "data-id": p.id,
        cx: x(p.geplandeDoorlooptijdWeken),
        cy: y(p.werkelijkeDoorlooptijdWeken),
        r: r(p.totaalUren),
        fill: fill,
        "fill-opacity": 0.5,
        stroke: fill,
        "stroke-width": 1,
        "stroke-opacity": 0.8,
      });
      g.appendChild(c);
      circlesById[p.id] = { el: c, baseFill: fill };
    });

    // ----- Tabel -----
    var rowsById = {};
    var sorted = projecten.slice().sort(function (a, b) {
      return uitloopWeken(b) - uitloopWeken(a);
    });

    tabel.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tabel-wrap";
    var table = document.createElement("table");
    table.className = "tabel";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Project</th>" +
      "<th>Klant</th>" +
      "<th class=\"num\">Gepland</th>" +
      "<th class=\"num\">Werkelijk</th>" +
      "<th class=\"num\">Δ</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    sorted.forEach(function (p) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", p.id);
      var dWeken = uitloopWeken(p);
      var heeftUitloop = uitloopRatio(p) > UITLOOP_DREMPEL;
      var dTekst = dWeken === 0
        ? "0"
        : (dWeken > 0 ? "+" + dWeken : "−" + Math.abs(dWeken));
      tr.innerHTML =
        "<td><strong>" + p.id + "</strong></td>" +
        "<td>" + p.klant + "<div class=\"sub\">" + p.machine + "</div></td>" +
        "<td class=\"num\">" + F.weken(p.geplandeDoorlooptijdWeken) + "</td>" +
        "<td class=\"num\">" + F.weken(p.werkelijkeDoorlooptijdWeken) + "</td>" +
        "<td class=\"num" + (heeftUitloop ? " negative" : "") + "\">" +
        dTekst + "</td>";
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
      if (active && rowsById[active]) {
        rowsById[active].scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    function setHover(id) { hoveredId = id; applyState(); }
    function setSelect(id) {
      selectedId = selectedId === id ? null : id;
      applyState();
    }

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

    Object.keys(rowsById).forEach(function (id) {
      var tr = rowsById[id];
      tr.addEventListener("mouseenter", function () { setHover(id); });
      tr.addEventListener("mouseleave", function () { setHover(null); });
      tr.addEventListener("click", function () { setSelect(id); });
    });
  }

  window.PA.doorlooptijdPlot = render;
})();
