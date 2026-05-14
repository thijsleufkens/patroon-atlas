// Producten-pijl-plot — vanilla JS, inline SVG.
// Per machinetype een pijl van 2024-positie naar 2025-positie in
// marge × engineering-uitloop ruimte. Productlijnen die alleen in 2025
// bestaan krijgen een losse marker.

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

  // Aggregeer per machinetype per jaar.
  function aggregeerPerMachineJaar(projecten) {
    var bins = {};
    projecten.forEach(function (p) {
      if (!bins[p.machine]) {
        bins[p.machine] = { machine: p.machine, totaalOmzet: 0, jaren: {} };
      }
      var b = bins[p.machine];
      b.totaalOmzet += p.omzet;
      if (!b.jaren[p.jaar]) {
        b.jaren[p.jaar] = {
          jaar: p.jaar, omzet: 0, margeOmzet: 0,
          engGeschat: 0, engWerkelijk: 0, projecten: [],
        };
      }
      var j = b.jaren[p.jaar];
      j.omzet += p.omzet;
      j.margeOmzet += p.omzet * p.margePercent;
      j.projecten.push(p.id);
      var eng = (p.fases || []).filter(function (f) { return f.fase === "engineering"; })[0];
      if (eng) {
        j.engGeschat += eng.geschat;
        j.engWerkelijk += eng.werkelijk;
      }
    });
    var out = [];
    Object.keys(bins).forEach(function (k) {
      var b = bins[k];
      Object.keys(b.jaren).forEach(function (jr) {
        var j = b.jaren[jr];
        j.margePercent = j.omzet > 0 ? j.margeOmzet / j.omzet : 0;
        j.engUitloop = j.engGeschat > 0
          ? ((j.engWerkelijk - j.engGeschat) / j.engGeschat) * 100
          : 0;
      });
      out.push({
        machine: b.machine,
        totaalOmzet: b.totaalOmzet,
        y2024: b.jaren[2024] || null,
        y2025: b.jaren[2025] || null,
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

    var machines = aggregeerPerMachineJaar(projecten);
    var idVan = function (m) { return "machine:" + m; };

    // Verzamel alle (marge, uitloop) waarden om de schalen te bepalen.
    var alleMarge = [];
    var alleUitloop = [];
    machines.forEach(function (m) {
      [m.y2024, m.y2025].forEach(function (j) {
        if (j) {
          alleMarge.push(j.margePercent);
          alleUitloop.push(j.engUitloop);
        }
      });
    });

    var xStep = 5;
    var yStep = 25;
    var xMin = niceMin(Math.min.apply(null, alleMarge) - 2, xStep);
    var xMax = niceMax(Math.max.apply(null, alleMarge) + 2, xStep);
    var yMin = 0;
    var yMax = niceMax(Math.max.apply(null, alleUitloop) + 10, yStep);

    var x = scaleLinear([xMin, xMax], [0, iw]);
    var y = scaleLinear([yMin, yMax], [ih, 0]);
    var r = scaleSqrt([0, Math.max.apply(null, machines.map(function (m) { return m.totaalOmzet; }))], [8, 24]);

    // Medianen over de 2025-eindpunten (voor types die in 2025 bestaan).
    // Geeft het beeld van waar de productlijnen nu staan.
    var eindMarge = machines.filter(function (m) { return m.y2025; }).map(function (m) { return m.y2025.margePercent; });
    var eindUitloop = machines.filter(function (m) { return m.y2025; }).map(function (m) { return m.y2025.engUitloop; });
    var xMed = median(eindMarge);
    var yMed = median(eindUitloop);

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Pijl-plot: marge versus engineering-uitloop per machinetype, 2024 naar 2025",
    });
    container.appendChild(svg);

    // Pijl-definitie in defs (één per kleur)
    var defs = el("defs", {});
    svg.appendChild(defs);
    function arrowMarker(id, color) {
      var marker = el("marker", {
        id: id, viewBox: "0 0 10 10", refX: 8, refY: 5,
        markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse",
      });
      marker.appendChild(el("path", {
        d: "M 0 0 L 10 5 L 0 10 z",
        fill: color,
      }));
      defs.appendChild(marker);
    }
    arrowMarker("arrow-pos", POSITIVE);
    arrowMarker("arrow-neg", NEGATIVE);
    arrowMarker("arrow-neu", SLATE);
    arrowMarker("arrow-act", AMBER_500);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Kwadrant-tints (op de 2025-medianen)
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
    }, "Marge (omzet-gewogen, per jaar)"));

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

    // Kleur bepalen voor pijl: groen als richting naar "rechtsonder" (beter),
    // rood als naar "linksboven" (slechter), grijs als gemengd of klein.
    function pijlKleur(start, eind) {
      var dM = eind.margePercent - start.margePercent;
      var dU = eind.engUitloop - start.engUitloop;
      // Score: marge omhoog goed (+), uitloop omhoog slecht (-)
      var score = dM - dU * 0.5;
      if (score > 2) return POSITIVE;
      if (score < -2) return NEGATIVE;
      return SLATE;
    }

    // Pijlen + eindpunten per machinetype
    var arrowsByMachine = {};
    machines.forEach(function (m) {
      var id = idVan(m.machine);
      var has24 = !!m.y2024;
      var has25 = !!m.y2025;
      var radius = r(m.totaalOmzet);

      var groep = el("g", { class: "machine-group" });
      g.appendChild(groep);

      var startEl = null, eindEl = null, lijnEl = null, labelEl = null, kleur = SLATE;

      if (has24 && has25) {
        // Pijl tussen jaren
        var sx = x(m.y2024.margePercent);
        var sy = y(m.y2024.engUitloop);
        var ex = x(m.y2025.margePercent);
        var ey = y(m.y2025.engUitloop);
        kleur = pijlKleur(m.y2024, m.y2025);
        var markerId =
          kleur === POSITIVE ? "arrow-pos" :
          kleur === NEGATIVE ? "arrow-neg" : "arrow-neu";

        // Lijn iets ingekort zodat pijlpunt netjes op de bubble landt
        var dx = ex - sx, dy = ey - sy;
        var lengte = Math.sqrt(dx * dx + dy * dy);
        var ux = lengte > 0 ? dx / lengte : 0;
        var uy = lengte > 0 ? dy / lengte : 0;
        var trimEind = Math.min(radius + 2, lengte * 0.5);
        var trimStart = Math.min(radius * 0.6 + 2, lengte * 0.5);

        lijnEl = el("line", {
          x1: sx + ux * trimStart, y1: sy + uy * trimStart,
          x2: ex - ux * trimEind, y2: ey - uy * trimEind,
          stroke: kleur, "stroke-width": 2,
          "marker-end": "url(#" + markerId + ")",
          "stroke-opacity": 0.85,
        });
        groep.appendChild(lijnEl);

        // 2024 marker (open)
        startEl = el("circle", {
          class: "point",
          cx: sx, cy: sy, r: radius * 0.7,
          fill: "#FDF8F0", stroke: kleur, "stroke-width": 1.5,
          "stroke-dasharray": "3 2",
          "stroke-opacity": 0.7,
        });
        groep.appendChild(startEl);

        // 2025 marker (gevuld)
        eindEl = el("circle", {
          class: "point",
          cx: ex, cy: ey, r: radius,
          fill: kleur, "fill-opacity": 0.5,
          stroke: kleur, "stroke-width": 1.5,
          "stroke-opacity": 0.9,
        });
        groep.appendChild(eindEl);

        // Label: machinetype-naam bij het 2025-eindpunt
        var labelOffset = 8 + radius;
        labelEl = el("text", {
          x: ex + labelOffset, y: ey + 4,
          "text-anchor": "start",
          fill: INK,
          "font-size": 11,
          "font-weight": 500,
          "font-family": "Roboto, sans-serif",
          "pointer-events": "none",
        }, m.machine);
        groep.appendChild(labelEl);
      } else if (has25 && !has24) {
        // Nieuw in 2025: alleen 2025-marker met amber-rand
        var ex2 = x(m.y2025.margePercent);
        var ey2 = y(m.y2025.engUitloop);
        kleur = INK;
        eindEl = el("circle", {
          class: "point",
          cx: ex2, cy: ey2, r: radius,
          fill: INK, "fill-opacity": 0.4,
          stroke: AMBER_500, "stroke-width": 2,
          "stroke-opacity": 0.95,
        });
        groep.appendChild(eindEl);
        labelEl = el("text", {
          x: ex2 + 8 + radius, y: ey2 + 4,
          "text-anchor": "start",
          fill: INK,
          "font-size": 11,
          "font-weight": 500,
          "font-family": "Roboto, sans-serif",
          "pointer-events": "none",
        }, m.machine + " (nieuw)");
        groep.appendChild(labelEl);
      } else if (has24 && !has25) {
        // Alleen 2024 (komt nu niet voor in data, maar voor compleetheid)
        var sx3 = x(m.y2024.margePercent);
        var sy3 = y(m.y2024.engUitloop);
        kleur = INK;
        startEl = el("circle", {
          class: "point",
          cx: sx3, cy: sy3, r: radius,
          fill: "#FDF8F0",
          stroke: INK, "stroke-width": 1.5,
          "stroke-dasharray": "3 2",
          "stroke-opacity": 0.7,
        });
        groep.appendChild(startEl);
        labelEl = el("text", {
          x: sx3 + 8 + radius, y: sy3 + 4,
          "text-anchor": "start",
          fill: INK,
          "font-size": 11,
          "font-weight": 500,
          "font-family": "Roboto, sans-serif",
          "pointer-events": "none",
        }, m.machine + " (gestopt)");
        groep.appendChild(labelEl);
      }

      arrowsByMachine[id] = {
        groep: groep, start: startEl, eind: eindEl, lijn: lijnEl,
        label: labelEl, kleur: kleur,
      };
    });

    // Legenda rechtsboven
    var legend = el("g", { transform: "translate(" + (iw - 8) + "," + 32 + ")" });
    g.appendChild(legend);
    var legendItems = [
      { label: "Marge omhoog", color: POSITIVE },
      { label: "Stabiel of gemengd", color: SLATE },
      { label: "Marge omlaag", color: NEGATIVE },
    ];
    legendItems.forEach(function (item, i) {
      var ly = i * 18;
      legend.appendChild(el("line", {
        x1: -42, y1: ly, x2: -22, y2: ly,
        stroke: item.color, "stroke-width": 2,
      }));
      legend.appendChild(el("text", {
        x: -50, y: ly + 4,
        "text-anchor": "end",
        fill: INK,
        "font-size": 11,
        "font-family": "Roboto, sans-serif",
      }, item.label));
    });

    // ----- Tabel -----
    var rowsById = {};
    var sorted = machines.slice().sort(function (a, b) {
      var aM = a.y2025 ? a.y2025.margePercent : (a.y2024 ? a.y2024.margePercent : 0);
      var bM = b.y2025 ? b.y2025.margePercent : (b.y2024 ? b.y2024.margePercent : 0);
      return aM - bM;
    });

    tabel.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tabel-wrap";
    var table = document.createElement("table");
    table.className = "tabel";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Machine</th>" +
      "<th class=\"num\">Marge '24</th>" +
      "<th class=\"num\">Marge '25</th>" +
      "<th class=\"num\">Uitloop '24</th>" +
      "<th class=\"num\">Uitloop '25</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    function cellPct(v, isMarge) {
      if (v == null) return "<td class=\"num muted\">—</td>";
      var neg = isMarge ? v < 10 : v > 20;
      return "<td class=\"num" + (neg ? " negative" : "") + "\">" + F.percent(v) + "</td>";
    }

    sorted.forEach(function (m) {
      var id = idVan(m.machine);
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", id);
      tr.innerHTML =
        "<td><strong>" + m.machine + "</strong></td>" +
        cellPct(m.y2024 ? m.y2024.margePercent : null, true) +
        cellPct(m.y2025 ? m.y2025.margePercent : null, true) +
        cellPct(m.y2024 ? m.y2024.engUitloop : null, false) +
        cellPct(m.y2025 ? m.y2025.engUitloop : null, false);
      tbody.appendChild(tr);
      rowsById[id] = tr;
    });

    // ----- Koppeling -----
    var hoveredId = null;
    var selectedId = null;
    function activeId() { return hoveredId || selectedId; }

    function applyState() {
      var active = activeId();
      Object.keys(arrowsByMachine).forEach(function (id) {
        var a = arrowsByMachine[id];
        var isActive = active === id;
        var isFaded = active != null && !isActive;
        if (a.eind) {
          a.eind.setAttribute("fill", isActive ? AMBER : a.kleur);
          a.eind.setAttribute("stroke", isActive ? AMBER_500 : a.kleur);
          a.eind.setAttribute("stroke-width", isActive ? 2 : 1.5);
          a.eind.setAttribute("fill-opacity", isFaded ? 0.12 : (isActive ? 0.7 : 0.5));
          a.eind.setAttribute("stroke-opacity", isFaded ? 0.2 : 0.9);
        }
        if (a.start) {
          a.start.setAttribute("stroke", isActive ? AMBER_500 : a.kleur);
          a.start.setAttribute("stroke-opacity", isFaded ? 0.2 : 0.7);
        }
        if (a.lijn) {
          a.lijn.setAttribute("stroke", isActive ? AMBER_500 : a.kleur);
          a.lijn.setAttribute("marker-end",
            isActive ? "url(#arrow-act)" : a.lijn.getAttribute("marker-end"));
          a.lijn.setAttribute("stroke-opacity", isFaded ? 0.15 : 0.85);
        }
        if (a.label) {
          a.label.setAttribute("fill-opacity", isFaded ? 0.25 : 1);
          a.label.setAttribute("font-weight", isActive ? 700 : 500);
        }
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

    Object.keys(arrowsByMachine).forEach(function (id) {
      var a = arrowsByMachine[id];
      [a.eind, a.start, a.lijn].forEach(function (e) {
        if (!e) return;
        e.style.cursor = "pointer";
        e.addEventListener("mouseenter", function () { setHover(id); });
        e.addEventListener("mouseleave", function () { setHover(null); });
        e.addEventListener("click", function (ev) { ev.stopPropagation(); setSelect(id); });
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
