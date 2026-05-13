// Fases-scatterplot — vanilla JS, inline SVG.
// Toont per project drie punten (engineering / assemblage / inbedrijfstelling)
// met geschatte versus werkelijke uren. Diagonaal y = x als "op schatting".

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

  // Fase-kleuren uit het DMT-palet.
  var FASE_KLEUR = {
    "engineering":        "#C98634", // amber-500
    "assemblage":         "#1D0C0C", // ink
    "inbedrijfstelling":  "#3F7D4E", // signal-positive
  };
  var FASE_LABEL = {
    "engineering":        "Engineering",
    "assemblage":         "Assemblage",
    "inbedrijfstelling":  "Inbedrijfstelling",
  };
  var FASE_ORDE = ["engineering", "assemblage", "inbedrijfstelling"];

  function render(opts) {
    var container = opts.container;
    var tabel = opts.tabel;
    var projecten = opts.projecten;

    var W = 720, H = 480;
    var margin = { top: 48, right: 32, bottom: 56, left: 72 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var INK = "#1D0C0C";
    var SLATE = "#727272";
    var INK_300 = "#B8B0AC";
    var AMBER = "#F2B969";
    var AMBER_500 = "#C98634";
    var POSITIVE = "#3F7D4E";
    var NEGATIVE = "#A2382B";

    // Flatten naar fase-records.
    var records = [];
    projecten.forEach(function (p) {
      (p.fases || []).forEach(function (f) {
        records.push({
          id: p.id + "." + f.fase,
          projectId: p.id,
          klant: p.klant,
          machine: p.machine,
          fase: f.fase,
          geschat: f.geschat,
          werkelijk: f.werkelijk,
        });
      });
    });

    if (records.length === 0) {
      container.innerHTML = "<p class=\"body-p\">Geen fase-data beschikbaar voor de getoonde projecten.</p>";
      tabel.innerHTML = "";
      return;
    }

    var geschatVals = records.map(function (r) { return r.geschat; });
    var werkelijkVals = records.map(function (r) { return r.werkelijk; });

    var step = 500;
    var rawMax = Math.max(
      Math.max.apply(null, geschatVals),
      Math.max.apply(null, werkelijkVals)
    );
    var domainMax = niceMax(rawMax * 1.05, step);

    var x = scaleLinear([0, domainMax], [0, iw]);
    var y = scaleLinear([0, domainMax], [ih, 0]);
    var maxFaseUren = Math.max.apply(null, werkelijkVals);
    var r = scaleSqrt([0, maxFaseUren], [4, 14]);

    // SVG-root
    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Scatterplot: geschatte versus werkelijke uren per projectfase",
    });
    container.appendChild(svg);

    // Legenda — drie swatches links bovenin.
    var legenda = el("g", { transform: "translate(" + margin.left + ", 20)" });
    svg.appendChild(legenda);
    var lxOffset = 0;
    FASE_ORDE.forEach(function (fase) {
      var swatch = el("circle", {
        cx: lxOffset + 6, cy: 6, r: 5,
        fill: FASE_KLEUR[fase], "fill-opacity": 0.6,
        stroke: FASE_KLEUR[fase], "stroke-opacity": 0.9,
      });
      legenda.appendChild(swatch);
      var label = el("text", {
        x: lxOffset + 16, y: 10,
        fill: INK,
        "font-size": 11,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
      }, FASE_LABEL[fase]);
      legenda.appendChild(label);
      // Ruw breedte-schatting per item: 16 (swatch) + label-lengte * ~7 + 18 padding.
      lxOffset += 16 + FASE_LABEL[fase].length * 7 + 18;
    });

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Tint boven en onder de diagonaal.
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
    label("uitloop",        iw - 8, 14,     "end");
    label("op schatting",   8,      ih - 8, "start");

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
      }, v));
    });
    g.appendChild(el("text", {
      x: iw / 2, y: ih + 44,
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Geschatte uren per fase"));

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
      }, v));
    });
    g.appendChild(el("text", {
      x: -ih / 2, y: -52,
      transform: "rotate(-90)",
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Werkelijke uren per fase"));

    // Punten
    var circlesById = {};
    records.forEach(function (rec) {
      var kleur = FASE_KLEUR[rec.fase];
      var c = el("circle", {
        class: "point",
        "data-id": rec.id,
        cx: x(rec.geschat),
        cy: y(rec.werkelijk),
        r: r(rec.werkelijk),
        fill: kleur,
        "fill-opacity": 0.55,
        stroke: kleur,
        "stroke-width": 1,
        "stroke-opacity": 0.85,
      });
      g.appendChild(c);
      circlesById[rec.id] = { el: c, baseFill: kleur };
    });

    // ----- Tabel -----
    var rowsById = {};
    var sorted = records.slice().sort(function (a, b) {
      // Grootste relatieve uitloop bovenaan.
      var ra = (a.werkelijk - a.geschat) / Math.max(a.geschat, 1);
      var rb = (b.werkelijk - b.geschat) / Math.max(b.geschat, 1);
      return rb - ra;
    });

    tabel.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tabel-wrap";
    var table = document.createElement("table");
    table.className = "tabel";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Project</th>" +
      "<th>Fase</th>" +
      "<th class=\"num\">Geschat</th>" +
      "<th class=\"num\">Werkelijk</th>" +
      "<th class=\"num\">Δ</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    sorted.forEach(function (rec) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", rec.id);
      var delta = rec.werkelijk - rec.geschat;
      var rel = delta / Math.max(rec.geschat, 1);
      var heeftUitloop = rel > 0.20;
      var dTekst = delta === 0
        ? "0"
        : (delta > 0 ? "+" + delta : "−" + Math.abs(delta));
      tr.innerHTML =
        "<td><strong>" + rec.projectId + "</strong>" +
        "<div class=\"sub\">" + rec.klant + "</div></td>" +
        "<td>" + FASE_LABEL[rec.fase] + "</td>" +
        "<td class=\"num\">" + F.uren(rec.geschat) + "</td>" +
        "<td class=\"num\">" + F.uren(rec.werkelijk) + "</td>" +
        "<td class=\"num" + (heeftUitloop ? " negative" : "") + "\">" +
        dTekst + "</td>";
      tbody.appendChild(tr);
      rowsById[rec.id] = tr;
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
        c.el.setAttribute("fill-opacity", isFaded ? 0.12 : 0.55);
        c.el.setAttribute("stroke-opacity", isFaded ? 0.2 : 0.85);
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

  window.PA.fasesPlot = render;
})();
