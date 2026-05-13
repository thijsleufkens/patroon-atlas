// Producten-scatterplot — vanilla JS, inline SVG.
// Toont per machinetype: omzet-gewogen marge × omzet-gewogen engineering-
// uitloop. Aggregeert over alle projecten van dat type (beide jaren).

window.PA = window.PA || {};

(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";

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
  function ticks(min, max, step) {
    var t = [];
    var start = Math.ceil(min / step) * step;
    for (var v = start; v <= max + 0.0001; v += step) t.push(Math.round(v * 100) / 100);
    return t;
  }
  function niceMax(v, step) { return Math.ceil(v / step) * step; }
  function niceMin(v, step) { return Math.floor(v / step) * step; }

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

  // Aggregeer per machinetype over alle jaren.
  function aggregeerPerMachine(projecten) {
    var bins = {};
    projecten.forEach(function (p) {
      var key = p.machine;
      if (!bins[key]) {
        bins[key] = {
          machine: p.machine,
          omzet: 0, margeOmzet: 0,
          engGeschat: 0, engWerkelijk: 0,
          projecten: [], klanten: {},
        };
      }
      bins[key].omzet += p.omzet;
      bins[key].margeOmzet += p.omzet * p.margePercent;
      bins[key].projecten.push(p.id);
      bins[key].klanten[p.klant] = true;
      var eng = (p.fases || []).filter(function (f) { return f.fase === "engineering"; })[0];
      if (eng) {
        bins[key].engGeschat += eng.geschat;
        bins[key].engWerkelijk += eng.werkelijk;
      }
    });
    var out = [];
    Object.keys(bins).forEach(function (k) {
      var b = bins[k];
      out.push({
        machine: b.machine,
        omzet: b.omzet,
        margePercent: b.omzet > 0 ? b.margeOmzet / b.omzet : 0,
        engUitloop: b.engGeschat > 0
          ? ((b.engWerkelijk - b.engGeschat) / b.engGeschat) * 100
          : 0,
        projectCount: b.projecten.length,
        klantCount: Object.keys(b.klanten).length,
      });
    });
    return out;
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

    var machines = aggregeerPerMachine(projecten);
    var idVan = function (m) { return "machine:" + m; };

    var margeVals = machines.map(function (m) { return m.margePercent; });
    var uitloopVals = machines.map(function (m) { return m.engUitloop; });
    var omzetVals = machines.map(function (m) { return m.omzet; });

    var xStep = 5;
    var yStep = 25;
    var xMin = niceMin(Math.min.apply(null, margeVals) - 2, xStep);
    var xMax = niceMax(Math.max.apply(null, margeVals) + 2, xStep);
    var yMin = 0;
    var yMax = niceMax(Math.max.apply(null, uitloopVals) + 10, yStep);

    var x = scaleLinear([xMin, xMax], [0, iw]);
    var y = scaleLinear([yMin, yMax], [ih, 0]);
    var r = scaleSqrt([0, Math.max.apply(null, omzetVals)], [8, 28]);

    var xMed = median(margeVals);
    var yMed = median(uitloopVals);

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Scatterplot: marge versus engineering-uitloop per machinetype",
    });
    container.appendChild(svg);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Kwadrant-tints — goed = rechtsonder (hoge marge, lage uitloop),
    // probleem = linksboven (lage marge, hoge uitloop).
    g.appendChild(el("rect", {
      x: x(xMed), y: y(yMed),
      width: iw - x(xMed), height: ih - y(yMed),
      fill: POSITIVE, "fill-opacity": 0.04,
    }));
    g.appendChild(el("rect", {
      x: 0, y: 0,
      width: x(xMed), height: y(yMed),
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
    label("probleem-productlijn",  8,      14,     "start");
    label("gezonde productlijn",   iw - 8, ih - 8, "end");

    // X-as (marge)
    g.appendChild(el("line", { x1: 0, y1: ih, x2: iw, y2: ih, stroke: INK_300 }));
    ticks(xMin, xMax, xStep).forEach(function (v) {
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
      }, Math.round(v) + "%"));
    });
    g.appendChild(el("text", {
      x: iw / 2, y: ih + 44,
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Marge (omzet-gewogen)"));

    // Y-as (engineering-uitloop)
    g.appendChild(el("line", { x1: 0, y1: 0, x2: 0, y2: ih, stroke: INK_300 }));
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
      }, "+" + Math.round(v) + "%"));
    });
    g.appendChild(el("text", {
      x: -ih / 2, y: -52,
      transform: "rotate(-90)",
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Engineering-uitloop t.o.v. schatting"));

    // Punten
    var circlesById = {};
    machines.forEach(function (m) {
      var id = idVan(m.machine);
      var isNeg = m.margePercent < xMed && m.engUitloop > yMed;
      var fill = isNeg ? NEGATIVE : INK;
      var c = el("circle", {
        class: "point",
        "data-id": id,
        cx: x(m.margePercent),
        cy: y(m.engUitloop),
        r: r(m.omzet),
        fill: fill,
        "fill-opacity": 0.5,
        stroke: fill,
        "stroke-width": 1,
        "stroke-opacity": 0.8,
      });
      g.appendChild(c);
      circlesById[id] = { el: c, baseFill: fill };
    });

    // ----- Tabel -----
    var rowsById = {};
    var sorted = machines.slice().sort(function (a, b) {
      return a.margePercent - b.margePercent;
    });

    tabel.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tabel-wrap";
    var table = document.createElement("table");
    table.className = "tabel";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Machine</th>" +
      "<th class=\"num\">Omzet</th>" +
      "<th class=\"num\">Marge</th>" +
      "<th class=\"num\">Eng-uitloop</th>" +
      "<th class=\"num\">Proj.</th>" +
      "<th class=\"num\">Kl.</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    function fmtOmzet(v) {
      if (v >= 1000000) {
        var m = v / 1000000;
        var s = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace(".", ",");
        return "€ " + s + "M";
      }
      return "€ " + Math.round(v / 1000) + "k";
    }

    sorted.forEach(function (m) {
      var id = idVan(m.machine);
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", id);
      var isProbleem = m.margePercent < xMed && m.engUitloop > yMed;
      tr.innerHTML =
        "<td><strong>" + m.machine + "</strong></td>" +
        "<td class=\"num\">" + fmtOmzet(m.omzet) + "</td>" +
        "<td class=\"num" + (m.margePercent < 10 ? " negative" : "") + "\">" +
        F.percent(m.margePercent) + "</td>" +
        "<td class=\"num" + (isProbleem ? " negative" : "") + "\">+" +
        Math.round(m.engUitloop) + "%</td>" +
        "<td class=\"num muted\">" + m.projectCount + "</td>" +
        "<td class=\"num muted\">" + m.klantCount + "</td>";
      tbody.appendChild(tr);
      rowsById[id] = tr;
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

  window.PA.productenPlot = render;
})();
