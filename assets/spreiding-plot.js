// Spreiding-bubble-matrix — vanilla JS, inline SVG.
// Klant × machine als categorische scatter. Eén bubble per project,
// jaar = open (2024) of gevuld (2025), kleur = marge-band.

window.PA = window.PA || {};

(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";

  function scaleSqrt(domain, range) {
    var d1 = Math.sqrt(domain[1]);
    var r0 = range[0], r1 = range[1];
    return function (v) {
      var t = Math.sqrt(Math.max(0, v)) / d1;
      return r0 + t * (r1 - r0);
    };
  }

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

  function uniqueOrderedBy(projecten, fieldName, sortValueFn) {
    var totaal = {};
    projecten.forEach(function (p) {
      var k = p[fieldName];
      if (!totaal[k]) totaal[k] = 0;
      totaal[k] += sortValueFn(p);
    });
    return Object.keys(totaal).sort(function (a, b) {
      return totaal[b] - totaal[a];
    });
  }

  function render(opts) {
    var container = opts.container;
    var tabel = opts.tabel;
    var projecten = opts.projecten;

    var W = 760, H = 560;
    var margin = { top: 24, right: 28, bottom: 136, left: 180 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var INK = "#1D0C0C";
    var SLATE = "#727272";
    var INK_300 = "#B8B0AC";
    var INK_50 = "#F3ECE0";
    var AMBER = "#F2B969";
    var AMBER_500 = "#C98634";
    var POSITIVE = "#3F7D4E";
    var NEGATIVE = "#A2382B";

    // Klanten gegroepeerd op sub-sector, binnen sub-sector op omzet.
    var subsectorMap = window.PA.klantSubsector || {};
    var subsectorVolgorde = window.PA.subsectorVolgorde || [];
    var subsectorKleur = window.PA.subsectorKleur || {};
    var klantenOpOmzet = uniqueOrderedBy(projecten, "klant", function (p) { return p.omzet; });
    var klanten = klantenOpOmzet.slice().sort(function (a, b) {
      var sa = subsectorMap[a] || "Overig";
      var sb = subsectorMap[b] || "Overig";
      if (sa !== sb) {
        var ia = subsectorVolgorde.indexOf(sa);
        var ib = subsectorVolgorde.indexOf(sb);
        if (ia === -1) ia = 99;
        if (ib === -1) ib = 99;
        return ia - ib;
      }
      return klantenOpOmzet.indexOf(a) - klantenOpOmzet.indexOf(b);
    });
    // Machines gesorteerd op totale omzet (grootste links).
    var machines = uniqueOrderedBy(projecten, "machine", function (p) { return p.omzet; });

    var omzetVals = projecten.map(function (p) { return p.omzet; });
    var maxOmzet = Math.max.apply(null, omzetVals);

    // Categorical positionering: midden van elke cel.
    var cellW = iw / machines.length;
    var cellH = ih / klanten.length;
    var klantIndex = {}, machineIndex = {};
    klanten.forEach(function (k, i) { klantIndex[k] = i; });
    machines.forEach(function (m, i) { machineIndex[m] = i; });

    function xc(machine) { return cellW * (machineIndex[machine] + 0.5); }
    function yc(klant)   { return cellH * (klantIndex[klant]   + 0.5); }

    var r = scaleSqrt([0, maxOmzet], [5, 16]);

    function margeKleur(margePercent) {
      if (margePercent < 10) return NEGATIVE;
      if (margePercent >= 20) return POSITIVE;
      return INK;
    }

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Bubble-matrix: klant × machine, één bubble per project",
    });
    container.appendChild(svg);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Lichte rij-banding voor leesbaarheid.
    klanten.forEach(function (k, i) {
      if (i % 2 === 0) {
        g.appendChild(el("rect", {
          x: 0, y: i * cellH,
          width: iw, height: cellH,
          fill: INK_50, "fill-opacity": 0.5,
        }));
      }
    });

    // As-lijnen onder/links
    g.appendChild(el("line", { x1: 0, y1: ih, x2: iw, y2: ih, stroke: INK_300 }));
    g.appendChild(el("line", { x1: 0, y1: 0, x2: 0, y2: ih, stroke: INK_300 }));

    // Klant-labels (y-as) met sub-sector-kleurmarker links
    klanten.forEach(function (k) {
      var sub = subsectorMap[k] || "Overig";
      var kleur = subsectorKleur[sub] || INK;
      g.appendChild(el("text", {
        x: -22, y: yc(k) + 4,
        "text-anchor": "end",
        fill: INK,
        "font-size": 12,
        "font-family": "Roboto, sans-serif",
      }, k));
      g.appendChild(el("rect", {
        x: -14, y: yc(k) - 4,
        width: 8, height: 8,
        fill: kleur,
        rx: 1, ry: 1,
      }));
    });

    // Horizontale separator-lijntjes tussen sub-sectoren over de plot
    var prevSub = null;
    klanten.forEach(function (k, i) {
      var sub = subsectorMap[k] || "Overig";
      if (prevSub !== null && sub !== prevSub) {
        g.appendChild(el("line", {
          x1: 0, y1: i * cellH, x2: iw, y2: i * cellH,
          stroke: INK_300, "stroke-width": 1, "stroke-opacity": 0.6,
        }));
      }
      prevSub = sub;
    });

    // Sub-sector legenda onderaan
    var legendY = ih + 56;
    var legendX = 0;
    subsectorVolgorde.forEach(function (sub) {
      var kleur = subsectorKleur[sub] || INK;
      g.appendChild(el("rect", {
        x: legendX, y: legendY,
        width: 8, height: 8,
        fill: kleur, rx: 1, ry: 1,
      }));
      var label = el("text", {
        x: legendX + 14, y: legendY + 7,
        "text-anchor": "start",
        fill: SLATE,
        "font-size": 10,
        "font-family": "Roboto, sans-serif",
      }, sub);
      g.appendChild(label);
      legendX += 14 + sub.length * 6 + 16;
    });

    // Machine-labels (x-as) — geroteerd onder
    machines.forEach(function (m) {
      var x = xc(m);
      g.appendChild(el("text", {
        x: x, y: ih + 12,
        "text-anchor": "end",
        transform: "rotate(-35 " + x + " " + (ih + 12) + ")",
        fill: INK,
        "font-size": 11,
        "font-family": "Roboto, sans-serif",
      }, m));
    });

    // Bubbles — één per project. 2024 = open, 2025 = gevuld.
    var circlesById = {};
    projecten.forEach(function (p) {
      var kleur = margeKleur(p.margePercent);
      var isOpen = p.jaar === 2024;
      var c = el("circle", {
        class: "point",
        "data-id": p.id,
        cx: xc(p.machine),
        cy: yc(p.klant),
        r: r(p.omzet),
        fill: isOpen ? "white" : kleur,
        "fill-opacity": isOpen ? 0.92 : 0.55,
        stroke: kleur,
        "stroke-width": 1.4,
        "stroke-opacity": 0.9,
      });
      g.appendChild(c);
      circlesById[p.id] = { el: c, kleur: kleur, jaar: p.jaar };
    });

    // ----- Tabel -----
    var rowsById = {};
    var sorted = projecten.slice().sort(function (a, b) {
      if (a.klant !== b.klant) return a.klant.localeCompare(b.klant);
      return b.jaar - a.jaar;
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
      "<th>Machine</th>" +
      "<th class=\"num\">Omzet</th>" +
      "<th class=\"num\">Marge</th>" +
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

    sorted.forEach(function (p) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", p.id);
      tr.innerHTML =
        "<td><strong>" + p.id + "</strong></td>" +
        "<td>" + p.klant + "</td>" +
        "<td>" + p.machine + "</td>" +
        "<td class=\"num\">" + fmtOmzet(p.omzet) + "</td>" +
        "<td class=\"num" + (p.margePercent < 10 ? " negative" : "") + "\">" +
        F.percent(p.margePercent) + "</td>";
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
        var isOpen = c.jaar === 2024;
        c.el.setAttribute("fill", isActive ? AMBER : (isOpen ? "white" : c.kleur));
        c.el.setAttribute("stroke", isActive ? AMBER_500 : c.kleur);
        c.el.setAttribute("stroke-width", isActive ? 2.2 : 1.4);
        c.el.setAttribute("fill-opacity", isFaded ? 0.15 : (isOpen ? 0.92 : 0.55));
        c.el.setAttribute("stroke-opacity", isFaded ? 0.25 : 0.9);
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

  window.PA.spreidingPlot = render;
})();
