// Producten-pijl-plot — vanilla JS, inline SVG.
// Per machinetype een pijl van 2024-positie naar 2025-positie in
// omzet × marge ruimte. Bubble-kleur volgt engineering-uitloop in 2025
// (groen onder 15%, amber tussen 15 en 50%, rood boven 50%).
// Productlijnen die alleen in 2025 bestaan krijgen een losse marker.

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

  function formatEuroTick(v) {
    if (v === 0) return "€ 0";
    if (v >= 1000000) {
      var m = v / 1000000;
      var s = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace(".", ",");
      return "€ " + s + "M";
    }
    return "€ " + Math.round(v / 1000) + "k";
  }

  // Aggregeer per machinetype per jaar.
  function aggregeerPerMachineJaar(projecten) {
    var bins = {};
    projecten.forEach(function (p) {
      if (!bins[p.machine]) {
        bins[p.machine] = { machine: p.machine, jaren: {} };
      }
      var b = bins[p.machine];
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
        y2024: b.jaren[2024] || null,
        y2025: b.jaren[2025] || null,
      });
    });
    return out;
  }

  // Kleur op basis van engineering-uitloop in 2025 (of in 2024 als er
  // geen 2025 is).
  function kleurVoorUitloop(uitloop) {
    var POSITIVE = "#3F7D4E";
    var AMBER_500 = "#C98634";
    var NEGATIVE = "#A2382B";
    if (uitloop < 15) return POSITIVE;
    if (uitloop < 50) return AMBER_500;
    return NEGATIVE;
  }

  function uitloopBucketLabel(uitloop) {
    if (uitloop < 15) return "binnen tolerantie";
    if (uitloop < 50) return "verhoogd";
    return "extreem";
  }

  function render(opts) {
    var container = opts.container;
    var tabel = opts.tabel;
    var projecten = opts.projecten;

    var W = 720, H = 480;
    var margin = { top: 28, right: 32, bottom: 56, left: 80 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var INK = "#1D0C0C";
    var SLATE = "#727272";
    var INK_300 = "#B8B0AC";
    var CREAM = "#FDF8F0";
    var AMBER = "#F2B969";
    var AMBER_500 = "#C98634";
    var POSITIVE = "#3F7D4E";
    var NEGATIVE = "#A2382B";

    var machines = aggregeerPerMachineJaar(projecten);
    var idVan = function (m) { return "machine:" + m; };

    // Schalen domein op alle (omzet, marge) waarden over beide jaren.
    var alleOmzet = [];
    var alleMarge = [];
    machines.forEach(function (m) {
      [m.y2024, m.y2025].forEach(function (j) {
        if (j) {
          alleOmzet.push(j.omzet);
          alleMarge.push(j.margePercent);
        }
      });
    });

    var xStep = 1000000;
    var yStep = 5;
    var xMax = niceMax(Math.max.apply(null, alleOmzet) * 1.05, xStep);
    var yMin = niceMin(Math.min(0, Math.min.apply(null, alleMarge) - 2), yStep);
    var yMax = niceMax(Math.max.apply(null, alleMarge) + 2, yStep);

    var x = scaleLinear([0, xMax], [0, iw]);
    var y = scaleLinear([yMin, yMax], [ih, 0]);

    // Medianen over 2025-eindpunten (huidige stand).
    var eind2025 = machines.filter(function (m) { return m.y2025; });
    var xMed = median(eind2025.map(function (m) { return m.y2025.omzet; }));
    var yMed = median(eind2025.map(function (m) { return m.y2025.margePercent; }));

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Pijl-plot: omzet versus marge per machinetype, 2024 naar 2025, kleur = engineering-uitloop in 2025",
    });
    container.appendChild(svg);

    // Pijl-markers per kleur
    var defs = el("defs", {});
    svg.appendChild(defs);
    function arrowMarker(id, color) {
      var marker = el("marker", {
        id: id, viewBox: "0 0 10 10", refX: 8, refY: 5,
        markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse",
      });
      marker.appendChild(el("path", {
        d: "M 0 0 L 10 5 L 0 10 z", fill: color,
      }));
      defs.appendChild(marker);
    }
    arrowMarker("arrow-pos", POSITIVE);
    arrowMarker("arrow-amb", AMBER_500);
    arrowMarker("arrow-neg", NEGATIVE);
    arrowMarker("arrow-act", AMBER);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Lichte kwadrant-tints op de 2025-medianen
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

    // X-as (omzet)
    g.appendChild(el("line", { x1: 0, y1: ih, x2: iw, y2: ih, stroke: INK_300 }));
    ticks(0, xMax, xStep).forEach(function (v) {
      var px = x(v);
      g.appendChild(el("line", {
        x1: px, y1: ih, x2: px, y2: ih + 5, stroke: INK_300,
      }));
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
    }, "Omzet per jaar (per machinetype)"));

    // Y-as (marge)
    g.appendChild(el("line", { x1: 0, y1: 0, x2: 0, y2: ih, stroke: INK_300 }));
    ticks(yMin, yMax, yStep).forEach(function (v) {
      var py = y(v);
      g.appendChild(el("line", {
        x1: 0, y1: py, x2: -5, y2: py, stroke: INK_300,
      }));
      g.appendChild(el("text", {
        x: -10, y: py + 3,
        "text-anchor": "end", fill: SLATE,
        "font-size": 11, "font-family": "Roboto, sans-serif",
      }, v + "%"));
    });
    g.appendChild(el("text", {
      x: -ih / 2, y: -56,
      transform: "rotate(-90)",
      "text-anchor": "middle", fill: INK,
      "font-size": 12, "font-weight": 500, "font-family": "Roboto, sans-serif",
    }, "Omzet-gewogen marge"));

    // Constante bubble-grootte voor 2025-eindpunten (omzet zit al op de as)
    var R_EIND = 9;
    var R_START = 6;

    var arrowsByMachine = {};
    machines.forEach(function (m) {
      var id = idVan(m.machine);
      var has24 = !!m.y2024;
      var has25 = !!m.y2025;

      // Kleur volgt uitloop in 2025 (of 2024 als geen 2025).
      var uitloopVoorKleur = has25 ? m.y2025.engUitloop : (has24 ? m.y2024.engUitloop : 0);
      var kleur = kleurVoorUitloop(uitloopVoorKleur);
      var markerId =
        kleur === POSITIVE ? "arrow-pos" :
        kleur === AMBER_500 ? "arrow-amb" : "arrow-neg";

      var groep = el("g", { class: "machine-group" });
      g.appendChild(groep);

      var startEl = null, eindEl = null, lijnEl = null, labelEl = null;

      if (has24 && has25) {
        var sx = x(m.y2024.omzet);
        var sy = y(m.y2024.margePercent);
        var ex = x(m.y2025.omzet);
        var ey = y(m.y2025.margePercent);

        var dx = ex - sx, dy = ey - sy;
        var lengte = Math.sqrt(dx * dx + dy * dy);
        var ux = lengte > 0 ? dx / lengte : 0;
        var uy = lengte > 0 ? dy / lengte : 0;
        var trimEind = Math.min(R_EIND + 2, lengte * 0.5);
        var trimStart = Math.min(R_START + 2, lengte * 0.5);

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
          cx: sx, cy: sy, r: R_START,
          fill: CREAM, stroke: kleur, "stroke-width": 1.5,
          "stroke-dasharray": "3 2",
          "stroke-opacity": 0.7,
        });
        groep.appendChild(startEl);

        // 2025 marker (gevuld)
        eindEl = el("circle", {
          class: "point",
          cx: ex, cy: ey, r: R_EIND,
          fill: kleur, "fill-opacity": 0.55,
          stroke: kleur, "stroke-width": 1.5,
          "stroke-opacity": 0.95,
        });
        groep.appendChild(eindEl);

        // Label naast het 2025-eindpunt
        labelEl = el("text", {
          x: ex + R_EIND + 6, y: ey + 4,
          "text-anchor": "start",
          fill: INK,
          "font-size": 11,
          "font-weight": 500,
          "font-family": "Roboto, sans-serif",
          "pointer-events": "none",
        }, m.machine);
        groep.appendChild(labelEl);
      } else if (has25 && !has24) {
        // Nieuw in 2025
        var ex2 = x(m.y2025.omzet);
        var ey2 = y(m.y2025.margePercent);
        eindEl = el("circle", {
          class: "point",
          cx: ex2, cy: ey2, r: R_EIND,
          fill: kleur, "fill-opacity": 0.45,
          stroke: AMBER, "stroke-width": 2.5,
          "stroke-opacity": 0.95,
        });
        groep.appendChild(eindEl);
        labelEl = el("text", {
          x: ex2 + R_EIND + 6, y: ey2 + 4,
          "text-anchor": "start",
          fill: INK,
          "font-size": 11,
          "font-weight": 500,
          "font-family": "Roboto, sans-serif",
          "pointer-events": "none",
        }, m.machine + " (nieuw)");
        groep.appendChild(labelEl);
      } else if (has24 && !has25) {
        var sx3 = x(m.y2024.omzet);
        var sy3 = y(m.y2024.margePercent);
        startEl = el("circle", {
          class: "point",
          cx: sx3, cy: sy3, r: R_START,
          fill: CREAM, stroke: kleur, "stroke-width": 1.5,
          "stroke-dasharray": "3 2",
          "stroke-opacity": 0.7,
        });
        groep.appendChild(startEl);
        labelEl = el("text", {
          x: sx3 + R_START + 6, y: sy3 + 4,
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

    // Legenda rechtsboven — uitloop-buckets
    var legend = el("g", { transform: "translate(" + (iw - 8) + "," + 28 + ")" });
    g.appendChild(legend);
    var legendItems = [
      { label: "uitloop < 15%", color: POSITIVE },
      { label: "uitloop 15-50%", color: AMBER_500 },
      { label: "uitloop > 50%", color: NEGATIVE },
    ];
    legendItems.forEach(function (item, i) {
      var ly = i * 18;
      legend.appendChild(el("circle", {
        cx: -8, cy: ly, r: 5,
        fill: item.color, "fill-opacity": 0.55,
        stroke: item.color, "stroke-width": 1.5,
      }));
      legend.appendChild(el("text", {
        x: -18, y: ly + 4,
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
      "<th class=\"num\">Omzet '24</th>" +
      "<th class=\"num\">Omzet '25</th>" +
      "<th class=\"num\">Marge '24</th>" +
      "<th class=\"num\">Marge '25</th>" +
      "<th class=\"num\">Uitloop '25</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    function cellEuro(v) {
      if (v == null) return "<td class=\"num muted\">—</td>";
      return "<td class=\"num\">" + F.euro(v) + "</td>";
    }
    function cellMarge(v) {
      if (v == null) return "<td class=\"num muted\">—</td>";
      var neg = v < 10;
      return "<td class=\"num" + (neg ? " negative" : "") + "\">" + F.percent(v) + "</td>";
    }
    function cellUitloop(v) {
      if (v == null) return "<td class=\"num muted\">—</td>";
      var rood = v >= 50;
      var amber = v >= 15 && v < 50;
      var cls = rood ? " negative" : (amber ? "" : " muted");
      var prefix = v >= 0 ? "+" : "";
      return "<td class=\"num" + cls + "\">" + prefix + Math.round(v) + "%</td>";
    }

    sorted.forEach(function (m) {
      var id = idVan(m.machine);
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", id);
      tr.innerHTML =
        "<td><strong>" + m.machine + "</strong></td>" +
        cellEuro(m.y2024 ? m.y2024.omzet : null) +
        cellEuro(m.y2025 ? m.y2025.omzet : null) +
        cellMarge(m.y2024 ? m.y2024.margePercent : null) +
        cellMarge(m.y2025 ? m.y2025.margePercent : null) +
        cellUitloop(m.y2025 ? m.y2025.engUitloop : null);
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
          a.eind.setAttribute("fill-opacity", isFaded ? 0.12 : (isActive ? 0.75 : 0.55));
          a.eind.setAttribute("stroke-opacity", isFaded ? 0.2 : 0.95);
        }
        if (a.start) {
          a.start.setAttribute("stroke", isActive ? AMBER_500 : a.kleur);
          a.start.setAttribute("stroke-opacity", isFaded ? 0.2 : 0.7);
        }
        if (a.lijn) {
          a.lijn.setAttribute("stroke", isActive ? AMBER_500 : a.kleur);
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
