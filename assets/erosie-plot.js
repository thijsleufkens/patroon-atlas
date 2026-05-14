// Erosie-plot — horizontale gestapelde bar per machinetype.
// Toont marge-erosie als materiaal-variantie + uren-variantie, gesorteerd
// op totale erosie. Hover-koppeling tussen bar en tabel.

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

  function niceMax(v, step) {
    return Math.ceil(v / step) * step;
  }

  function ticks(min, max, step) {
    var t = [];
    var start = Math.ceil(min / step) * step;
    for (var v = start; v <= max + 0.0001; v += step) t.push(v);
    return t;
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

  function formatEuroShort(v) {
    if (Math.abs(v) >= 1000) {
      return "€ " + Math.round(v / 1000) + "k";
    }
    return "€ " + Math.round(v);
  }

  // Aggregeer projecten naar machinetype-niveau.
  function aggregeer(projecten, tarief) {
    var perType = {};
    projecten.forEach(function (p) {
      if (!perType[p.machine]) {
        perType[p.machine] = {
          machine: p.machine,
          projecten: [],
          materiaalVariantie: 0,
          urenVariantie: 0,
          urenOverschrijding: 0,
          omzet: 0,
        };
      }
      var matVar = p.materiaalkostenWerkelijk - p.materiaalkostenGeschat;
      var urenGeschat = p.fases.reduce(function (s, f) { return s + f.geschat; }, 0);
      var urenWerkelijk = p.fases.reduce(function (s, f) { return s + f.werkelijk; }, 0);
      var urenDiff = urenWerkelijk - urenGeschat;
      var urenVar = urenDiff * tarief;

      perType[p.machine].projecten.push({
        id: p.id, klant: p.klant, jaar: p.jaar, omzet: p.omzet,
        materiaalVariantie: matVar,
        urenVariantie: urenVar,
        urenOverschrijding: urenDiff,
      });
      perType[p.machine].materiaalVariantie += matVar;
      perType[p.machine].urenVariantie += urenVar;
      perType[p.machine].urenOverschrijding += urenDiff;
      perType[p.machine].omzet += p.omzet;
    });

    var types = Object.keys(perType).map(function (k) {
      var t = perType[k];
      t.totaal = t.materiaalVariantie + t.urenVariantie;
      return t;
    });

    // Sorteer aflopend op totale erosie.
    types.sort(function (a, b) { return b.totaal - a.totaal; });
    return types;
  }

  function render(opts) {
    var container = opts.container;
    var tabel = opts.tabel;
    var projecten = opts.projecten;
    var tarief = window.PA.UURTARIEF_INTERN || 60;

    var types = aggregeer(projecten, tarief);

    var INK = "#1D0C0C";
    var SLATE = "#727272";
    var INK_300 = "#B8B0AC";
    var AMBER_300 = "#F2B969";
    var AMBER_500 = "#C98634";

    var W = 720, H = 480;
    var margin = { top: 32, right: 80, bottom: 56, left: 168 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var barHeight = Math.min(32, ih / types.length - 8);
    var rowStep = ih / types.length;

    var maxTotaal = types.reduce(function (m, t) {
      return Math.max(m, t.totaal);
    }, 0);
    var xStep = maxTotaal > 800000 ? 250000 : maxTotaal > 400000 ? 100000 : 50000;
    var xMax = niceMax(maxTotaal * 1.05, xStep);
    var x = scaleLinear([0, xMax], [0, iw]);

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Marge-erosie per machinetype, opgedeeld in materiaal- en uren-variantie",
    });
    container.appendChild(svg);

    // Legenda — rechtsboven
    var legend = el("g", { transform: "translate(" + (margin.left) + ", 4)" });
    svg.appendChild(legend);
    legend.appendChild(el("rect", {
      x: 0, y: 0, width: 12, height: 12, fill: AMBER_500,
    }));
    legend.appendChild(el("text", {
      x: 18, y: 10, fill: INK,
      "font-size": 12, "font-family": "Roboto, sans-serif",
    }, "Materiaal-variantie"));
    legend.appendChild(el("rect", {
      x: 158, y: 0, width: 12, height: 12, fill: INK,
    }));
    legend.appendChild(el("text", {
      x: 176, y: 10, fill: INK,
      "font-size": 12, "font-family": "Roboto, sans-serif",
    }, "Uren-variantie"));

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // X-as (boven of onder?). Onder voelt natuurlijker.
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
      }, formatEuroTick(v)));
      // Lichte verticale gridlijn
      if (v > 0) {
        g.appendChild(el("line", {
          x1: px, y1: 0, x2: px, y2: ih,
          stroke: INK_300, "stroke-opacity": 0.3, "stroke-dasharray": "2 4",
        }));
      }
    });
    g.appendChild(el("text", {
      x: iw / 2, y: ih + 44,
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Totale marge-erosie (€) over alle projecten in 2024 + 2025"));

    // Bars per type
    var barsByType = {};
    types.forEach(function (t, i) {
      var cy = i * rowStep + (rowStep - barHeight) / 2;

      // Type-naam (links)
      g.appendChild(el("text", {
        x: -12, y: cy + barHeight / 2 + 4,
        "text-anchor": "end",
        fill: INK,
        "font-size": 12,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
      }, t.machine));

      // Materiaal-segment
      var matWidth = Math.max(0, x(t.materiaalVariantie) - x(0));
      var matRect = el("rect", {
        x: 0, y: cy,
        width: matWidth, height: barHeight,
        fill: AMBER_500,
        "data-machine": t.machine,
        "data-segment": "materiaal",
      });
      g.appendChild(matRect);

      // Uren-segment (na het materiaal-segment)
      var urenWidth = Math.max(0, x(t.urenVariantie) - x(0));
      var urenRect = el("rect", {
        x: matWidth, y: cy,
        width: urenWidth, height: barHeight,
        fill: INK,
        "data-machine": t.machine,
        "data-segment": "uren",
      });
      g.appendChild(urenRect);

      // Totaal-label rechts van bar
      var totaalLabel = el("text", {
        x: x(t.totaal) + 8, y: cy + barHeight / 2 + 4,
        "text-anchor": "start",
        fill: INK,
        "font-size": 12,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
        "data-machine": t.machine,
      }, formatEuroShort(t.totaal));
      g.appendChild(totaalLabel);

      barsByType[t.machine] = {
        mat: matRect, uren: urenRect, label: totaalLabel,
      };
    });

    // ----- Tabel -----
    tabel.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tabel-wrap";
    var table = document.createElement("table");
    table.className = "tabel";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Project</th>" +
      "<th>Klant</th>" +
      "<th class=\"num\">Mat.var.</th>" +
      "<th class=\"num\">Uren-var.</th>" +
      "<th class=\"num\">Totaal</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    var rowsByMachine = {};
    types.forEach(function (t) {
      rowsByMachine[t.machine] = [];

      // Type-header row
      var trH = document.createElement("tr");
      trH.className = "tabel-group";
      trH.innerHTML =
        "<td colspan=\"2\"><strong>" + t.machine + "</strong>" +
        " <span class=\"sub\" style=\"display:inline-block;margin-left:6px\">" +
        t.projecten.length + " projecten</span></td>" +
        "<td class=\"num\">" + F.euro(t.materiaalVariantie) + "</td>" +
        "<td class=\"num\">" + F.euro(t.urenVariantie) + "</td>" +
        "<td class=\"num\"><strong>" + F.euro(t.totaal) + "</strong></td>";
      tbody.appendChild(trH);
      rowsByMachine[t.machine].push(trH);

      // Project-rows (gesorteerd op jaar en id)
      var sorted = t.projecten.slice().sort(function (a, b) {
        if (a.jaar !== b.jaar) return b.jaar - a.jaar;
        return a.id.localeCompare(b.id);
      });
      sorted.forEach(function (p) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td><strong>" + p.id + "</strong><div class=\"sub\">" + p.jaar + "</div></td>" +
          "<td>" + p.klant + "</td>" +
          "<td class=\"num muted\">" + F.euro(p.materiaalVariantie) + "</td>" +
          "<td class=\"num muted\">" + F.euro(p.urenVariantie) + "</td>" +
          "<td class=\"num\">" + F.euro(p.materiaalVariantie + p.urenVariantie) + "</td>";
        tbody.appendChild(tr);
        rowsByMachine[t.machine].push(tr);
      });
    });

    // ----- Koppeling -----
    var hoveredMachine = null;

    function applyState() {
      var active = hoveredMachine;
      Object.keys(barsByType).forEach(function (m) {
        var b = barsByType[m];
        var isActive = active === m;
        var isFaded = active != null && !isActive;
        b.mat.setAttribute("fill-opacity", isFaded ? 0.25 : 1);
        b.uren.setAttribute("fill-opacity", isFaded ? 0.25 : 1);
        b.label.setAttribute("fill-opacity", isFaded ? 0.4 : 1);
      });
      Object.keys(rowsByMachine).forEach(function (m) {
        rowsByMachine[m].forEach(function (tr) {
          var isActive = active === m;
          var isFaded = active != null && !isActive;
          tr.classList.toggle("is-active", isActive);
          tr.classList.toggle("is-faded", isFaded);
        });
      });
      if (active && rowsByMachine[active] && rowsByMachine[active][0]) {
        rowsByMachine[active][0].scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    function setHover(machine) {
      hoveredMachine = machine;
      applyState();
    }

    // Listeners op bar-segmenten en labels
    Object.keys(barsByType).forEach(function (m) {
      var b = barsByType[m];
      [b.mat, b.uren, b.label].forEach(function (n) {
        n.style.cursor = "pointer";
        n.addEventListener("mouseenter", function () { setHover(m); });
        n.addEventListener("mouseleave", function () { setHover(null); });
      });
    });

    // Listeners op tabelrijen
    Object.keys(rowsByMachine).forEach(function (m) {
      rowsByMachine[m].forEach(function (tr) {
        tr.addEventListener("mouseenter", function () { setHover(m); });
        tr.addEventListener("mouseleave", function () { setHover(null); });
      });
    });
  }

  window.PA.erosiePlot = render;
})();
