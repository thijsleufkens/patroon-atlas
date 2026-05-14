// MT-chart: Pareto klant-concentratie. Verticale bars per klant aflopend
// op omzet, plus cumulatieve % als lijn. Eén boodschap: hoeveel hangt aan
// de top.

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

  function formatEuroTick(v) {
    if (v === 0) return "€ 0";
    if (v >= 1000000) {
      var m = v / 1000000;
      var s = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace(".", ",");
      return "€ " + s + "M";
    }
    return "€ " + Math.round(v / 1000) + "k";
  }

  function aggregeer(projecten) {
    var perKlant = {};
    projecten.forEach(function (p) {
      if (!perKlant[p.klant]) {
        perKlant[p.klant] = { klant: p.klant, omzet: 0, projectCount: 0 };
      }
      perKlant[p.klant].omzet += p.omzet;
      perKlant[p.klant].projectCount += 1;
    });
    var klanten = Object.keys(perKlant).map(function (k) { return perKlant[k]; });
    klanten.sort(function (a, b) { return b.omzet - a.omzet; });
    var totaal = klanten.reduce(function (s, k) { return s + k.omzet; }, 0);
    var cum = 0;
    klanten.forEach(function (k) {
      cum += k.omzet;
      k.cumPct = (cum / totaal) * 100;
      k.aandeel = (k.omzet / totaal) * 100;
    });
    return { klanten: klanten, totaal: totaal };
  }

  function render(opts) {
    var container = opts.container;
    var tabel = opts.tabel;
    var projecten = opts.projecten;

    var ag = aggregeer(projecten);
    var klanten = ag.klanten;
    var TOP_N = 3;

    var INK = "#1D0C0C";
    var SLATE = "#727272";
    var INK_300 = "#B8B0AC";
    var AMBER_300 = "#F2B969";
    var AMBER_500 = "#C98634";

    var W = 720, H = 480;
    var margin = { top: 40, right: 60, bottom: 84, left: 64 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var maxOmzet = klanten[0].omzet;
    var yStep = maxOmzet > 4000000 ? 1000000 : 500000;
    var yMax = niceMax(maxOmzet * 1.05, yStep);
    var yLeft = scaleLinear([0, yMax], [ih, 0]);
    var yRight = scaleLinear([0, 100], [ih, 0]);

    var bandWidth = iw / klanten.length;
    var barWidth = bandWidth * 0.7;
    var barInset = (bandWidth - barWidth) / 2;

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Pareto: cumulatieve omzet per klant",
    });
    container.appendChild(svg);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Linker y-as (€)
    g.appendChild(el("line", {
      x1: 0, y1: 0, x2: 0, y2: ih, stroke: INK_300,
    }));
    for (var v = 0; v <= yMax + 0.1; v += yStep) {
      var py = yLeft(v);
      g.appendChild(el("line", {
        x1: 0, y1: py, x2: -5, y2: py, stroke: INK_300,
      }));
      g.appendChild(el("text", {
        x: -10, y: py + 3,
        "text-anchor": "end",
        fill: SLATE,
        "font-size": 11,
        "font-family": "Roboto, sans-serif",
      }, formatEuroTick(v)));
    }
    g.appendChild(el("text", {
      x: -56, y: ih / 2,
      transform: "rotate(-90, -56, " + (ih / 2) + ")",
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Omzet"));

    // Rechter y-as (%)
    g.appendChild(el("line", {
      x1: iw, y1: 0, x2: iw, y2: ih, stroke: INK_300,
    }));
    [0, 25, 50, 75, 100].forEach(function (v) {
      var py = yRight(v);
      g.appendChild(el("line", {
        x1: iw, y1: py, x2: iw + 5, y2: py, stroke: INK_300,
      }));
      g.appendChild(el("text", {
        x: iw + 10, y: py + 3,
        "text-anchor": "start",
        fill: SLATE,
        "font-size": 11,
        "font-family": "Roboto, sans-serif",
      }, v + "%"));
    });

    // Horizontale grid op 80%
    g.appendChild(el("line", {
      x1: 0, y1: yRight(80), x2: iw, y2: yRight(80),
      stroke: INK_300, "stroke-opacity": 0.5, "stroke-dasharray": "2 4",
    }));
    g.appendChild(el("text", {
      x: -8, y: yRight(80) - 4,
      "text-anchor": "end",
      fill: SLATE,
      "font-size": 10,
      "font-family": "Roboto, sans-serif",
    }, "80%"));

    // Bars
    klanten.forEach(function (k, i) {
      var cx = i * bandWidth + barInset;
      var py = yLeft(k.omzet);
      var h = ih - py;
      var isTop = i < TOP_N;
      g.appendChild(el("rect", {
        x: cx, y: py,
        width: barWidth, height: h,
        fill: isTop ? AMBER_500 : AMBER_300,
        "fill-opacity": isTop ? 0.9 : 0.65,
      }));

      // Klant-naam onder bar (geroteerd)
      var tx = i * bandWidth + bandWidth / 2;
      g.appendChild(el("text", {
        x: tx, y: ih + 14,
        transform: "rotate(-35, " + tx + ", " + (ih + 14) + ")",
        "text-anchor": "end",
        fill: SLATE,
        "font-size": 10,
        "font-family": "Roboto, sans-serif",
      }, k.klant));
    });

    // Cum-% lijn
    var pathD = klanten.map(function (k, i) {
      var cx = i * bandWidth + bandWidth / 2;
      var cy = yRight(k.cumPct);
      return (i === 0 ? "M" : "L") + cx + " " + cy;
    }).join(" ");
    g.appendChild(el("path", {
      d: pathD,
      fill: "none",
      stroke: INK,
      "stroke-width": 2,
    }));
    klanten.forEach(function (k, i) {
      var cx = i * bandWidth + bandWidth / 2;
      var cy = yRight(k.cumPct);
      g.appendChild(el("circle", {
        cx: cx, cy: cy, r: 3.5, fill: INK,
      }));
      if (i === TOP_N - 1 || i === klanten.length - 1 || i === Math.floor(klanten.length / 2)) {
        g.appendChild(el("text", {
          x: cx + 6, y: cy - 6,
          "text-anchor": "start",
          fill: INK,
          "font-size": 11,
          "font-weight": 500,
          "font-family": "Roboto, sans-serif",
        }, Math.round(k.cumPct) + "%"));
      }
    });

    // Annotatie top-N
    var topEndX = TOP_N * bandWidth;
    g.appendChild(el("line", {
      x1: topEndX, y1: 0, x2: topEndX, y2: ih,
      stroke: INK, "stroke-opacity": 0.4, "stroke-dasharray": "3 3",
    }));

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
      "<th class=\"num\">Aandeel</th>" +
      "<th class=\"num\">Cumulatief</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    klanten.forEach(function (k, i) {
      var tr = document.createElement("tr");
      var isTop = i < TOP_N;
      tr.innerHTML =
        "<td>" + (isTop ? "<strong>" + k.klant + "</strong>" : k.klant) +
        "<div class=\"sub\">" + k.projectCount + " project" + (k.projectCount === 1 ? "" : "en") + "</div></td>" +
        "<td class=\"num\">" + F.euro(k.omzet) + "</td>" +
        "<td class=\"num muted\">" + Math.round(k.aandeel) + "%</td>" +
        "<td class=\"num\"><strong>" + Math.round(k.cumPct) + "%</strong></td>";
      tbody.appendChild(tr);
    });
  }

  window.PA.mtKlantPlot = render;
})();
