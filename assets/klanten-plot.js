// Klanten-kwadrant op klant-niveau. Per klant geaggregeerd over alle
// projecten in 2024 + 2025. Kleur volgt sub-sector. Bubble-grootte =
// aantal projecten. Hover-koppeling tussen punt en tabel.

window.PA = window.PA || {};

(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";

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

  function scaleLinear(domain, range) {
    var d0 = domain[0], d1 = domain[1];
    var r0 = range[0], r1 = range[1];
    return function (v) {
      var t = (v - d0) / (d1 - d0);
      return r0 + t * (r1 - r0);
    };
  }

  function scaleSqrt(domain, range) {
    var d0 = domain[0], d1 = Math.sqrt(domain[1]);
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
    for (var v = start; v <= max + 0.0001; v += step) t.push(v);
    return t;
  }

  function niceMax(v, step) {
    return Math.ceil(v / step) * step;
  }

  function niceMin(v, step) {
    return Math.floor(v / step) * step;
  }

  function formatEuroTick(v) {
    if (v === 0) return "€ 0";
    if (v >= 1000000) {
      var m = v / 1000000;
      var s = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace(".", ",");
      return "€ " + s + "M";
    }
    return "€ " + Math.round(v / 1000) + "k";
  }

  function aggregeer(projecten, subsectorMap) {
    var perKlant = {};
    projecten.forEach(function (p) {
      if (!perKlant[p.klant]) {
        perKlant[p.klant] = {
          klant: p.klant,
          subsector: subsectorMap[p.klant] || "Onbekend",
          omzet: 0,
          margeMass: 0,
          projectCount: 0,
          totaalUren: 0,
          jaren: {},
        };
      }
      var k = perKlant[p.klant];
      k.omzet += p.omzet;
      k.margeMass += p.omzet * (p.margePercent / 100);
      k.projectCount += 1;
      k.totaalUren += p.totaalUren;
      k.jaren[p.jaar] = true;
    });
    var klanten = Object.keys(perKlant).map(function (key) {
      var k = perKlant[key];
      k.margePct = k.omzet === 0 ? 0 : (k.margeMass / k.omzet) * 100;
      k.jarenList = Object.keys(k.jaren).sort();
      return k;
    });
    return klanten;
  }

  function render(opts) {
    var container = opts.container;
    var tabel = opts.tabel;
    var projecten = opts.projecten;
    var subsectorMap = opts.subsectorMap || window.PA.klantSubsector || {};
    var subsectorKleur = opts.subsectorKleur || window.PA.subsectorKleur || {};
    var subsectorVolgorde = opts.subsectorVolgorde || window.PA.subsectorVolgorde || [];

    var klanten = aggregeer(projecten, subsectorMap);

    var INK = "#1D0C0C";
    var SLATE = "#727272";
    var INK_300 = "#B8B0AC";
    var AMBER = "#F2B969";
    var AMBER_500 = "#C98634";

    var W = 720, H = 480;
    var margin = { top: 32, right: 40, bottom: 60, left: 72 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var omzetVals = klanten.map(function (k) { return k.omzet; });
    var margeVals = klanten.map(function (k) { return k.margePct; });
    var projectCounts = klanten.map(function (k) { return k.projectCount; });

    var xStep = 1000000;
    var yStep = 5;
    var xMax = niceMax(Math.max.apply(null, omzetVals) * 1.05, xStep);
    var yMin = niceMin(Math.min(0, Math.min.apply(null, margeVals) - 2), yStep);
    var yMax = niceMax(Math.max.apply(null, margeVals) + 2, yStep);

    var x = scaleLinear([0, xMax], [0, iw]);
    var y = scaleLinear([yMin, yMax], [ih, 0]);
    var r = scaleSqrt([0, Math.max.apply(null, projectCounts)], [7, 24]);

    var xMed = median(omzetVals);
    var yMed = median(margeVals);

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Klanten op omzet versus marge, kleur per sub-sector",
    });
    container.appendChild(svg);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Mediaan-lijnen als leeshulp
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
      g.appendChild(el("text", {
        x: xPos, y: yPos,
        "text-anchor": anchor,
        fill: SLATE,
        "font-size": 11,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
      }, text));
    }
    label("groot & gezond",     iw - 8, 14, "end");
    label("klein & gezond",     8,      14, "start");
    label("groot & marge-arm",  iw - 8, ih - 8, "end");
    label("klein & marge-arm",  8,      ih - 8, "start");

    // X-as
    g.appendChild(el("line", { x1: 0, y1: ih, x2: iw, y2: ih, stroke: INK_300 }));
    ticks(0, xMax, xStep).forEach(function (v) {
      var px = x(v);
      g.appendChild(el("line", { x1: px, y1: ih, x2: px, y2: ih + 5, stroke: INK_300 }));
      g.appendChild(el("text", {
        x: px, y: ih + 18,
        "text-anchor": "middle", fill: SLATE,
        "font-size": 11, "font-family": "Roboto, sans-serif",
      }, formatEuroTick(v)));
    });
    g.appendChild(el("text", {
      x: iw / 2, y: ih + 44,
      "text-anchor": "middle", fill: INK,
      "font-size": 12, "font-weight": 500, "font-family": "Roboto, sans-serif",
    }, "Totale omzet per klant over 2024 + 2025"));

    // Y-as
    g.appendChild(el("line", { x1: 0, y1: 0, x2: 0, y2: ih, stroke: INK_300 }));
    ticks(yMin, yMax, yStep).forEach(function (v) {
      var py = y(v);
      g.appendChild(el("line", { x1: 0, y1: py, x2: -5, y2: py, stroke: INK_300 }));
      g.appendChild(el("text", {
        x: -10, y: py + 3,
        "text-anchor": "end", fill: SLATE,
        "font-size": 11, "font-family": "Roboto, sans-serif",
      }, v + "%"));
    });
    g.appendChild(el("text", {
      x: -ih / 2, y: -52,
      transform: "rotate(-90)",
      "text-anchor": "middle", fill: INK,
      "font-size": 12, "font-weight": 500, "font-family": "Roboto, sans-serif",
    }, "Omzet-gewogen marge"));

    // Legenda subsectoren
    var legend = el("g", { transform: "translate(" + (iw - 8) + "," + 36 + ")" });
    g.appendChild(legend);
    var legendItems = subsectorVolgorde.length > 0
      ? subsectorVolgorde
      : Object.keys(subsectorKleur);
    legendItems.forEach(function (sub, i) {
      var ly = i * 18;
      legend.appendChild(el("circle", {
        cx: -8, cy: ly, r: 5,
        fill: subsectorKleur[sub] || INK,
      }));
      legend.appendChild(el("text", {
        x: -18, y: ly + 4,
        "text-anchor": "end",
        fill: INK,
        "font-size": 11,
        "font-family": "Roboto, sans-serif",
      }, sub));
    });

    // Punten per klant
    var circlesByKlant = {};
    klanten.forEach(function (k) {
      var fill = subsectorKleur[k.subsector] || INK;
      var c = el("circle", {
        class: "point",
        "data-klant": k.klant,
        cx: x(k.omzet),
        cy: y(k.margePct),
        r: r(k.projectCount),
        fill: fill,
        "fill-opacity": 0.6,
        stroke: fill,
        "stroke-width": 1.5,
        "stroke-opacity": 0.9,
      });
      g.appendChild(c);
      circlesByKlant[k.klant] = { el: c, baseFill: fill };
    });

    // ----- Tabel -----
    tabel.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tabel-wrap";
    var table = document.createElement("table");
    table.className = "tabel";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Klant</th>" +
      "<th class=\"num\">Omzet</th>" +
      "<th class=\"num\">Marge</th>" +
      "<th class=\"num\">Proj.</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    var sorted = klanten.slice().sort(function (a, b) { return b.omzet - a.omzet; });
    var rowsByKlant = {};
    sorted.forEach(function (k) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-klant", k.klant);
      var fill = subsectorKleur[k.subsector] || INK;
      tr.innerHTML =
        "<td>" +
        "<div style=\"display:flex;align-items:center;gap:8px;\">" +
        "<span style=\"display:inline-block;width:8px;height:8px;border-radius:50%;background:" + fill + ";flex-shrink:0;\"></span>" +
        "<div><strong>" + k.klant + "</strong>" +
        "<div class=\"sub\">" + k.subsector + "</div></div>" +
        "</div></td>" +
        "<td class=\"num\">" + F.euro(k.omzet) + "</td>" +
        "<td class=\"num" + (k.margePct < 0 ? " negative" : "") + "\">" +
        F.percent(k.margePct) + "</td>" +
        "<td class=\"num muted\">" + k.projectCount + "</td>";
      tbody.appendChild(tr);
      rowsByKlant[k.klant] = tr;
    });

    // ----- Koppeling -----
    var hoveredKlant = null;
    var selectedKlant = null;

    function activeKlant() { return hoveredKlant || selectedKlant; }

    function applyState() {
      var active = activeKlant();
      Object.keys(circlesByKlant).forEach(function (kl) {
        var c = circlesByKlant[kl];
        var isActive = active === kl;
        var isFaded = active != null && !isActive;
        c.el.setAttribute("stroke-width", isActive ? 2.5 : 1.5);
        c.el.setAttribute("fill-opacity", isFaded ? 0.15 : (isActive ? 0.85 : 0.6));
        c.el.setAttribute("stroke-opacity", isFaded ? 0.25 : 0.9);
      });
      Object.keys(rowsByKlant).forEach(function (kl) {
        var tr = rowsByKlant[kl];
        var isActive = active === kl;
        var isFaded = active != null && !isActive;
        tr.classList.toggle("is-active", isActive);
        tr.classList.toggle("is-faded", isFaded);
      });
      if (active && rowsByKlant[active]) {
        rowsByKlant[active].scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    function setHover(kl) { hoveredKlant = kl; applyState(); }
    function setSelect(kl) {
      selectedKlant = selectedKlant === kl ? null : kl;
      applyState();
    }

    Object.keys(circlesByKlant).forEach(function (kl) {
      var c = circlesByKlant[kl].el;
      c.addEventListener("mouseenter", function () { setHover(kl); });
      c.addEventListener("mouseleave", function () { setHover(null); });
      c.addEventListener("click", function (e) { e.stopPropagation(); setSelect(kl); });
    });
    svg.addEventListener("click", function () { selectedKlant = null; applyState(); });

    Object.keys(rowsByKlant).forEach(function (kl) {
      var tr = rowsByKlant[kl];
      tr.addEventListener("mouseenter", function () { setHover(kl); });
      tr.addEventListener("mouseleave", function () { setHover(null); });
      tr.addEventListener("click", function () { setSelect(kl); });
    });
  }

  window.PA.klantenPlot = render;
})();
