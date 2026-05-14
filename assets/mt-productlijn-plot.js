// MT-chart: marge-bijdrage per productlijn, 2024 vs 2025.
// Horizontale bars per machinetype met delta (2025 - 2024). Eén boodschap:
// welke productlijnen leverden in 2025 minder marge dan in 2024.

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

  function formatEuro(v) {
    var abs = Math.abs(v);
    var sign = v < 0 ? "−" : "+";
    if (abs >= 1000000) {
      var m = abs / 1000000;
      var s = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace(".", ",");
      return sign + "€ " + s + "M";
    }
    return sign + "€ " + Math.round(abs / 1000) + "k";
  }

  function formatEuroTick(v) {
    if (v === 0) return "€ 0";
    var abs = Math.abs(v);
    var sign = v < 0 ? "−" : "";
    if (abs >= 1000000) {
      var m = abs / 1000000;
      var s = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace(".", ",");
      return sign + "€ " + s + "M";
    }
    return sign + "€ " + Math.round(abs / 1000) + "k";
  }

  function niceStep(maxAbs) {
    if (maxAbs > 800000) return 250000;
    if (maxAbs > 400000) return 100000;
    if (maxAbs > 150000) return 50000;
    return 25000;
  }

  function aggregeer(projecten) {
    var perType = {};
    projecten.forEach(function (p) {
      if (!perType[p.machine]) {
        perType[p.machine] = { machine: p.machine, marge2024: 0, marge2025: 0 };
      }
      var marge = p.omzet * (p.margePercent / 100);
      if (p.jaar === 2024) perType[p.machine].marge2024 += marge;
      if (p.jaar === 2025) perType[p.machine].marge2025 += marge;
    });
    var types = Object.keys(perType).map(function (k) {
      var t = perType[k];
      t.delta = t.marge2025 - t.marge2024;
      return t;
    });
    // Oplopend op delta — meest negatieve bovenaan.
    types.sort(function (a, b) { return a.delta - b.delta; });
    return types;
  }

  function render(opts) {
    var container = opts.container;
    var tabel = opts.tabel;
    var projecten = opts.projecten;

    var types = aggregeer(projecten);

    var INK = "#1D0C0C";
    var SLATE = "#727272";
    var INK_300 = "#B8B0AC";
    var AMBER_500 = "#C98634";
    var POSITIVE = "#3F7D4E";
    var NEGATIVE = "#A2382B";

    var W = 720, H = 480;
    var margin = { top: 28, right: 80, bottom: 56, left: 168 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var maxAbs = types.reduce(function (m, t) { return Math.max(m, Math.abs(t.delta)); }, 0);
    var step = niceStep(maxAbs);
    var domainMax = Math.ceil((maxAbs * 1.1) / step) * step;
    var x = scaleLinear([-domainMax, domainMax], [0, iw]);
    var zeroX = x(0);

    var barHeight = Math.min(28, ih / types.length - 8);
    var rowStep = ih / types.length;

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Marge-bijdrage delta per productlijn, 2025 minus 2024",
    });
    container.appendChild(svg);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // X-as
    g.appendChild(el("line", {
      x1: 0, y1: ih, x2: iw, y2: ih, stroke: INK_300,
    }));
    for (var v = -domainMax; v <= domainMax + 1; v += step) {
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
    }

    // Nul-lijn
    g.appendChild(el("line", {
      x1: zeroX, y1: 0, x2: zeroX, y2: ih,
      stroke: INK_300, "stroke-width": 1,
    }));

    g.appendChild(el("text", {
      x: iw / 2, y: ih + 44,
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Verschil in marge-bijdrage 2025 versus 2024 (€)"));

    // Bars
    types.forEach(function (t, i) {
      var cy = i * rowStep + (rowStep - barHeight) / 2;
      var x0 = Math.min(zeroX, x(t.delta));
      var w = Math.abs(x(t.delta) - zeroX);
      var color = t.delta < 0 ? NEGATIVE : POSITIVE;

      // Type-naam
      g.appendChild(el("text", {
        x: -12, y: cy + barHeight / 2 + 4,
        "text-anchor": "end",
        fill: INK,
        "font-size": 12,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
      }, t.machine));

      g.appendChild(el("rect", {
        x: x0, y: cy,
        width: w, height: barHeight,
        fill: color,
        "fill-opacity": 0.85,
      }));

      // Waarde-label aan de buitenkant van de bar
      var labelX = t.delta < 0 ? x0 - 8 : x0 + w + 8;
      var anchor = t.delta < 0 ? "end" : "start";
      g.appendChild(el("text", {
        x: labelX, y: cy + barHeight / 2 + 4,
        "text-anchor": anchor,
        fill: INK,
        "font-size": 12,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
      }, formatEuro(t.delta)));
    });

    // ----- Tabel -----
    tabel.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tabel-wrap";
    var table = document.createElement("table");
    table.className = "tabel";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Productlijn</th>" +
      "<th class=\"num\">2024</th>" +
      "<th class=\"num\">2025</th>" +
      "<th class=\"num\">Verschil</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    // Tabel: gesorteerd zoals plot (meest negatieve bovenaan)
    types.forEach(function (t) {
      var tr = document.createElement("tr");
      var neg = t.delta < 0;
      tr.innerHTML =
        "<td><strong>" + t.machine + "</strong></td>" +
        "<td class=\"num muted\">" + F.euro(t.marge2024) + "</td>" +
        "<td class=\"num muted\">" + F.euro(t.marge2025) + "</td>" +
        "<td class=\"num" + (neg ? " negative" : "") + "\"><strong>" +
        (neg ? "−" : "+") + F.euro(Math.abs(t.delta)) + "</strong></td>";
      tbody.appendChild(tr);
    });
  }

  window.PA.mtProductlijnPlot = render;
})();
