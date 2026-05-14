// Uitloop-heatmap — machinetype × fase, kleur = uitloop-percentage.
// Aggregeert over alle projecten van een machinetype, gewogen op geschatte uren.
// Hover-koppeling tussen cel en tabel-rij.

window.PA = window.PA || {};

(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";
  var FASE_ORDER = ["engineering", "assemblage", "inbedrijfstelling"];

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

  function aggregeer(projecten) {
    var perType = {};
    projecten.forEach(function (p) {
      if (!perType[p.machine]) {
        perType[p.machine] = {
          machine: p.machine,
          fases: {
            engineering: { geschat: 0, werkelijk: 0 },
            assemblage: { geschat: 0, werkelijk: 0 },
            inbedrijfstelling: { geschat: 0, werkelijk: 0 },
          },
          projectCount: 0,
        };
      }
      perType[p.machine].projectCount += 1;
      p.fases.forEach(function (f) {
        perType[p.machine].fases[f.fase].geschat += f.geschat;
        perType[p.machine].fases[f.fase].werkelijk += f.werkelijk;
      });
    });

    var types = Object.keys(perType).map(function (k) {
      var t = perType[k];
      FASE_ORDER.forEach(function (f) {
        var ag = t.fases[f];
        ag.diff = ag.werkelijk - ag.geschat;
        ag.pct = ag.geschat === 0 ? 0 : (ag.diff / ag.geschat) * 100;
      });
      var sumPct = FASE_ORDER.reduce(function (s, f) { return s + t.fases[f].pct; }, 0);
      t.gemPct = sumPct / FASE_ORDER.length;
      return t;
    });

    types.sort(function (a, b) { return b.gemPct - a.gemPct; });
    return types;
  }

  // Kleurschaal voor uitloop-%. Negatief = mintgroen (meevaller), 0 = cream,
  // oplopend amber tot donker.
  function colorFor(pct) {
    if (pct < -2) return "#DCE9DC";       // licht groen-grijs
    if (pct < 2) return "#FBF3E2";        // cream-licht
    if (pct < 8) return "#FBEBC9";        // amber-50
    if (pct < 20) return "#F8DDA8";       // amber-100
    if (pct < 40) return "#F2B969";       // amber-300
    if (pct < 70) return "#C98634";       // amber-500
    if (pct < 100) return "#A2382B";      // signal-negative
    return "#6E4614";                     // amber-700 (zeer donker)
  }

  // Bepaal tekstkleur in cel op basis van achtergrond.
  function textColorFor(pct) {
    return pct >= 40 ? "#FDF8F0" : "#1D0C0C";
  }

  function formatPct(pct) {
    var rounded = Math.round(pct);
    if (rounded === 0 && pct !== 0) {
      rounded = pct > 0 ? 0 : 0;
    }
    var s = rounded.toString();
    if (s.charAt(0) === "-") s = "−" + s.slice(1);
    return s + "%";
  }

  function render(opts) {
    var container = opts.container;
    var tabel = opts.tabel;
    var projecten = opts.projecten;

    var types = aggregeer(projecten);

    var INK = "#1D0C0C";
    var SLATE = "#727272";
    var INK_300 = "#B8B0AC";

    var W = 720, H = 480;
    var margin = { top: 60, right: 80, bottom: 60, left: 168 };
    var iw = W - margin.left - margin.right;
    var ih = H - margin.top - margin.bottom;

    var cellW = iw / FASE_ORDER.length;
    var cellH = ih / types.length;

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Heatmap: uren-uitloop per machinetype en fase",
    });
    container.appendChild(svg);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Kolom-labels (fases)
    FASE_ORDER.forEach(function (fase, i) {
      g.appendChild(el("text", {
        x: i * cellW + cellW / 2, y: -16,
        "text-anchor": "middle",
        fill: INK,
        "font-size": 12,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
      }, fase.charAt(0).toUpperCase() + fase.slice(1)));
    });
    g.appendChild(el("text", {
      x: iw / 2, y: -38,
      "text-anchor": "middle",
      fill: SLATE,
      "font-size": 11,
      "letter-spacing": "0.08em",
      "font-family": "Roboto, sans-serif",
    }, "FASE"));

    // Rij-labels (machinetypes) en cellen
    var cellsByKey = {};
    types.forEach(function (t, rowIdx) {
      var cy = rowIdx * cellH;

      // Rij-label links
      g.appendChild(el("text", {
        x: -12, y: cy + cellH / 2 + 4,
        "text-anchor": "end",
        fill: INK,
        "font-size": 12,
        "font-weight": 500,
        "font-family": "Roboto, sans-serif",
      }, t.machine));

      FASE_ORDER.forEach(function (fase, colIdx) {
        var ag = t.fases[fase];
        var cx = colIdx * cellW;

        // Cel
        var cellRect = el("rect", {
          x: cx + 2, y: cy + 2,
          width: cellW - 4, height: cellH - 4,
          fill: colorFor(ag.pct),
          rx: 4, ry: 4,
          "data-key": t.machine + "::" + fase,
        });
        g.appendChild(cellRect);

        // Waarde-label in cel
        var cellText = el("text", {
          x: cx + cellW / 2, y: cy + cellH / 2 + 5,
          "text-anchor": "middle",
          fill: textColorFor(ag.pct),
          "font-size": 14,
          "font-weight": 500,
          "font-family": "Roboto, sans-serif",
          "pointer-events": "none",
        }, formatPct(ag.pct));
        g.appendChild(cellText);

        cellsByKey[t.machine + "::" + fase] = { rect: cellRect, text: cellText };
      });
    });

    // Legenda onderaan
    var legendY = ih + 24;
    var legendSteps = [
      { label: "<2%", color: colorFor(0) },
      { label: "2–8%", color: colorFor(5) },
      { label: "8–20%", color: colorFor(14) },
      { label: "20–40%", color: colorFor(30) },
      { label: "40–70%", color: colorFor(55) },
      { label: "≥70%", color: colorFor(80) },
    ];
    var legendW = 50, legendGap = 4;
    var legendStartX = (iw - (legendSteps.length * (legendW + legendGap) - legendGap)) / 2;
    legendSteps.forEach(function (step, i) {
      var lx = legendStartX + i * (legendW + legendGap);
      g.appendChild(el("rect", {
        x: lx, y: legendY,
        width: legendW, height: 12,
        fill: step.color,
        rx: 2, ry: 2,
      }));
      g.appendChild(el("text", {
        x: lx + legendW / 2, y: legendY + 26,
        "text-anchor": "middle",
        fill: SLATE,
        "font-size": 10,
        "font-family": "Roboto, sans-serif",
      }, step.label));
    });

    // ----- Tabel -----
    tabel.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tabel-wrap";
    var table = document.createElement("table");
    table.className = "tabel";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Machinetype</th>" +
      "<th>Fase</th>" +
      "<th class=\"num\">Geschat</th>" +
      "<th class=\"num\">Werkelijk</th>" +
      "<th class=\"num\">Uitloop</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    var rowsByKey = {};
    types.forEach(function (t) {
      FASE_ORDER.forEach(function (fase, idx) {
        var ag = t.fases[fase];
        var tr = document.createElement("tr");
        tr.setAttribute("data-key", t.machine + "::" + fase);
        var typeCell = idx === 0
          ? "<td><strong>" + t.machine + "</strong><div class=\"sub\">" + t.projectCount + " projecten</div></td>"
          : "<td></td>";
        tr.innerHTML =
          typeCell +
          "<td>" + fase + "</td>" +
          "<td class=\"num muted\">" + F.uren(ag.geschat) + "</td>" +
          "<td class=\"num\">" + F.uren(ag.werkelijk) + "</td>" +
          "<td class=\"num\"><strong>" + formatPct(ag.pct) + "</strong></td>";
        tbody.appendChild(tr);
        rowsByKey[t.machine + "::" + fase] = tr;
      });
    });

    // ----- Koppeling -----
    var hoveredKey = null;

    function applyState() {
      var active = hoveredKey;
      Object.keys(cellsByKey).forEach(function (k) {
        var c = cellsByKey[k];
        var isActive = active === k;
        var isFaded = active != null && !isActive;
        c.rect.setAttribute("stroke", isActive ? INK : "transparent");
        c.rect.setAttribute("stroke-width", isActive ? 2 : 0);
        c.rect.setAttribute("fill-opacity", isFaded ? 0.35 : 1);
        c.text.setAttribute("fill-opacity", isFaded ? 0.4 : 1);
      });
      Object.keys(rowsByKey).forEach(function (k) {
        var tr = rowsByKey[k];
        var isActive = active === k;
        var isFaded = active != null && !isActive;
        tr.classList.toggle("is-active", isActive);
        tr.classList.toggle("is-faded", isFaded);
      });
      if (active && rowsByKey[active]) {
        rowsByKey[active].scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    function setHover(key) {
      hoveredKey = key;
      applyState();
    }

    Object.keys(cellsByKey).forEach(function (k) {
      var rect = cellsByKey[k].rect;
      rect.style.cursor = "pointer";
      rect.addEventListener("mouseenter", function () { setHover(k); });
      rect.addEventListener("mouseleave", function () { setHover(null); });
    });

    Object.keys(rowsByKey).forEach(function (k) {
      var tr = rowsByKey[k];
      tr.addEventListener("mouseenter", function () { setHover(k); });
      tr.addEventListener("mouseleave", function () { setHover(null); });
    });
  }

  window.PA.uitloopPlot = render;
})();
