// MT-chart: engineering-uitloop per productlijn, met tolerantie-lijn op 10%.
// Eén boodschap: welke productlijnen vragen calculatie-aanpassing op
// engineering-uren, en met welk percentage.

window.PA = window.PA || {};

(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";
  var TOLERANTIE_PCT = 10;

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

  function aggregeer(projecten) {
    var perType = {};
    projecten.forEach(function (p) {
      if (!perType[p.machine]) {
        perType[p.machine] = { machine: p.machine, geschat: 0, werkelijk: 0, projectCount: 0 };
      }
      perType[p.machine].projectCount += 1;
      p.fases.forEach(function (f) {
        if (f.fase === "engineering") {
          perType[p.machine].geschat += f.geschat;
          perType[p.machine].werkelijk += f.werkelijk;
        }
      });
    });
    var types = Object.keys(perType).map(function (k) {
      var t = perType[k];
      t.diff = t.werkelijk - t.geschat;
      t.pct = t.geschat === 0 ? 0 : (t.diff / t.geschat) * 100;
      return t;
    });
    types.sort(function (a, b) { return b.pct - a.pct; });
    return types;
  }

  function formatPct(v) {
    var r = Math.round(v);
    var s = r.toString();
    if (s.charAt(0) === "-") s = "−" + s.slice(1);
    return (v > 0 ? "+" : "") + s + "%";
  }

  function render(opts) {
    var container = opts.container;
    var tabel = opts.tabel;
    var projecten = opts.projecten;

    var types = aggregeer(projecten);

    var INK = "#1D0C0C";
    var SLATE = "#727272";
    var INK_300 = "#B8B0AC";
    var AMBER_300 = "#F2B969";
    var AMBER_500 = "#C98634";
    var NEGATIVE = "#A2382B";

    var W = 720, H = 480;
    var margin = { top: 40, right: 80, bottom: 56, left: 168 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var maxPct = types.reduce(function (m, t) { return Math.max(m, t.pct); }, 0);
    var step = maxPct > 100 ? 25 : 20;
    var domainMax = Math.ceil((maxPct * 1.05) / step) * step;
    var x = scaleLinear([0, domainMax], [0, iw]);

    var barHeight = Math.min(26, ih / types.length - 8);
    var rowStep = ih / types.length;

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Engineering-uitloop per productlijn, met tolerantie-lijn",
    });
    container.appendChild(svg);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // X-as
    g.appendChild(el("line", {
      x1: 0, y1: ih, x2: iw, y2: ih, stroke: INK_300,
    }));
    for (var v = 0; v <= domainMax + 0.1; v += step) {
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
      }, v + "%"));
    }

    g.appendChild(el("text", {
      x: iw / 2, y: ih + 44,
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Uitloop in engineering-uren over 2024 + 2025 (% van geschat)"));

    // Tolerantie-lijn op 10%
    var tolX = x(TOLERANTIE_PCT);
    g.appendChild(el("line", {
      x1: tolX, y1: -16, x2: tolX, y2: ih,
      stroke: INK, "stroke-width": 1, "stroke-dasharray": "4 4",
    }));
    g.appendChild(el("text", {
      x: tolX, y: -22,
      "text-anchor": "middle",
      fill: INK,
      "font-size": 11,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Tolerantie: 10%"));

    // Bars
    types.forEach(function (t, i) {
      var cy = i * rowStep + (rowStep - barHeight) / 2;
      var boven = t.pct > TOLERANTIE_PCT;
      var w = Math.max(0, x(Math.max(0, t.pct)));
      var color = boven ? (t.pct > 70 ? NEGATIVE : AMBER_500) : AMBER_300;

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
        x: 0, y: cy,
        width: w, height: barHeight,
        fill: color,
        "fill-opacity": boven ? 0.85 : 0.45,
      }));

      // Waarde-label rechts van bar
      g.appendChild(el("text", {
        x: w + 8, y: cy + barHeight / 2 + 4,
        "text-anchor": "start",
        fill: INK,
        "font-size": 12,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
      }, formatPct(t.pct)));
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
      "<th class=\"num\">Geschat</th>" +
      "<th class=\"num\">Werkelijk</th>" +
      "<th class=\"num\">Uitloop</th>" +
      "<th>Aanbeveling</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    types.forEach(function (t) {
      var boven = t.pct > TOLERANTIE_PCT;
      var advies = boven
        ? "Calculatie +" + Math.round(t.pct / 5) * 5 + "%"
        : "Binnen tolerantie";
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td><strong>" + t.machine + "</strong></td>" +
        "<td class=\"num muted\">" + F.uren(t.geschat) + "</td>" +
        "<td class=\"num\">" + F.uren(t.werkelijk) + "</td>" +
        "<td class=\"num\"><strong>" + formatPct(t.pct) + "</strong></td>" +
        "<td>" + advies + "</td>";
      tbody.appendChild(tr);
    });
  }

  window.PA.mtKalibratiePlot = render;
})();
