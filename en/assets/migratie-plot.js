// Migratie-scatterplot — vanilla JS, inline SVG.
// Toont per klant een pijl van 2024 naar 2025 in (omzet × marge),
// met dezelfde kwadrant-leeshulp als plot 1. Aggregeert op klant: omzet =
// som, marge = omzet-gewogen gemiddelde.

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
  function formatEuroTick(v) {
    if (v === 0) return "€ 0";
    if (v >= 1000000) {
      var m = v / 1000000;
      var s = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1);
      return "€ " + s + "M";
    }
    return "€ " + Math.round(v / 1000) + "k";
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

  // Som omzet per klant/jaar; marge = omzet-gewogen gemiddelde.
  function aggregeerKlantJaar(projecten) {
    var bins = {};
    projecten.forEach(function (p) {
      var key = p.klant + "||" + p.jaar;
      if (!bins[key]) {
        bins[key] = {
          klant: p.klant, jaar: p.jaar,
          omzet: 0, uren: 0, margeOmzet: 0,
        };
      }
      bins[key].omzet += p.omzet;
      bins[key].uren += p.totaalUren;
      bins[key].margeOmzet += p.margePercent * p.omzet;
    });
    var out = [];
    Object.keys(bins).forEach(function (k) {
      var b = bins[k];
      out.push({
        klant: b.klant, jaar: b.jaar,
        omzet: b.omzet,
        totaalUren: b.uren,
        margePercent: b.omzet > 0 ? b.margeOmzet / b.omzet : 0,
      });
    });
    return out;
  }

  // Klant-overzicht — splits in paren (beide jaren), verloren (alleen 2024)
  // en nieuw (alleen 2025).
  function klantenOverzicht(aggregaten) {
    var perKlant = {};
    aggregaten.forEach(function (a) {
      perKlant[a.klant] = perKlant[a.klant] || {};
      perKlant[a.klant][a.jaar] = a;
    });
    var paren = [], verloren = [], nieuw = [];
    Object.keys(perKlant).forEach(function (k) {
      var rec = perKlant[k];
      if (rec[2024] && rec[2025]) {
        paren.push({ klant: k, voor: rec[2024], na: rec[2025] });
      } else if (rec[2024]) {
        verloren.push({ klant: k, voor: rec[2024] });
      } else if (rec[2025]) {
        nieuw.push({ klant: k, na: rec[2025] });
      }
    });
    return { paren: paren, verloren: verloren, nieuw: nieuw };
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

    var aggregaten = aggregeerKlantJaar(projecten);
    var overzicht = klantenOverzicht(aggregaten);
    var paren = overzicht.paren;
    var idVan = function (k) { return "klant:" + k; };

    // Domein uit alle aggregaten (beide jaren), zodat de pijlen niet wegvallen.
    var omzetVals = aggregaten.map(function (a) { return a.omzet; });
    var margeVals = aggregaten.map(function (a) { return a.margePercent; });
    var xStep = 500000;
    var yStep = 5;
    var xMax = niceMax(Math.max.apply(null, omzetVals) * 1.05, xStep);
    var yMin = niceMin(Math.min(0, Math.min.apply(null, margeVals) - 2), yStep);
    var yMax = niceMax(Math.max.apply(null, margeVals) + 2, yStep);

    var x = scaleLinear([0, xMax], [0, iw]);
    var y = scaleLinear([yMin, yMax], [ih, 0]);

    // Mediaan op 2025-positie — "waar staan we nu" als leeshulp.
    var na2025 = paren.map(function (p) { return p.na; });
    var xMed = median(na2025.map(function (a) { return a.omzet; }));
    var yMed = median(na2025.map(function (a) { return a.margePercent; }));

    container.innerHTML = "";
    var svg = el("svg", {
      class: "plot",
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": "Scatterplot: migratie van klanten tussen 2024 en 2025 (omzet × marge)",
    });
    container.appendChild(svg);

    var g = el("g", { transform: "translate(" + margin.left + "," + margin.top + ")" });
    svg.appendChild(g);

    // Kwadrant-tints (zelfde leeshulp als plot 1, op basis van 2025-mediaan).
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
    label("groot & gezond",     iw - 8, 14,      "end");
    label("klein & gezond",     8,      14,      "start");
    label("groot & marge-arm",  iw - 8, ih - 8,  "end");
    label("klein & marge-arm",  8,      ih - 8,  "start");

    // X-as
    g.appendChild(el("line", { x1: 0, y1: ih, x2: iw, y2: ih, stroke: INK_300 }));
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
    });
    g.appendChild(el("text", {
      x: iw / 2, y: ih + 44,
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Omzet per klant"));

    // Y-as
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
      }, Math.round(v) + "%"));
    });
    g.appendChild(el("text", {
      x: -ih / 2, y: -52,
      transform: "rotate(-90)",
      "text-anchor": "middle",
      fill: INK,
      "font-size": 12,
      "font-weight": 500,
      "font-family": "Roboto, sans-serif",
    }, "Marge (omzet-gewogen)"));

    // ----- Pijlen + endpoints per klant -----
    // Groepeer per klant: open cirkel (2024), pijl, gevulde cirkel (2025).
    // Pijl-kleur volgt richting van marge-verandering.
    var DREMPEL_PP = 3;
    function pijlKleur(margeDelta) {
      if (margeDelta >  DREMPEL_PP) return POSITIVE;
      if (margeDelta < -DREMPEL_PP) return NEGATIVE;
      return SLATE;
    }

    var groupById = {};

    paren.forEach(function (paar) {
      var id = idVan(paar.klant);
      var x1 = x(paar.voor.omzet);
      var y1 = y(paar.voor.margePercent);
      var x2 = x(paar.na.omzet);
      var y2 = y(paar.na.margePercent);
      var dx = x2 - x1, dy = y2 - y1;
      var len = Math.sqrt(dx * dx + dy * dy);
      var margeDelta = paar.na.margePercent - paar.voor.margePercent;
      var kleur = pijlKleur(margeDelta);

      var grp = el("g", {
        class: "migratie",
        "data-id": id,
      });

      // Pijl-lijn — eindigt iets vóór het 2025-punt zodat de kop niet
      // door de cirkel snijdt. Voor punten die bijna samenvallen tekenen
      // we geen lijn maar wel de twee cirkels.
      var POINT_R_NA = 6;
      if (len > POINT_R_NA + 2) {
        var t = (len - POINT_R_NA - 1) / len;
        var ex = x1 + dx * t;
        var ey = y1 + dy * t;
        grp.appendChild(el("line", {
          x1: x1, y1: y1, x2: ex, y2: ey,
          stroke: kleur, "stroke-width": 1.5, "stroke-opacity": 0.7,
        }));

        // Arrowhead — driehoek aan ex/ey, gericht langs dx/dy.
        var ang = Math.atan2(dy, dx);
        var head = 7;
        var bx = ex - Math.cos(ang) * head;
        var by = ey - Math.sin(ang) * head;
        var perp = ang + Math.PI / 2;
        var px1 = bx + Math.cos(perp) * head * 0.45;
        var py1 = by + Math.sin(perp) * head * 0.45;
        var px2 = bx - Math.cos(perp) * head * 0.45;
        var py2 = by - Math.sin(perp) * head * 0.45;
        grp.appendChild(el("polygon", {
          points: ex + "," + ey + " " + px1 + "," + py1 + " " + px2 + "," + py2,
          fill: kleur, "fill-opacity": 0.8,
        }));
      }

      // 2024 — open cirkel (alleen rand)
      grp.appendChild(el("circle", {
        cx: x1, cy: y1, r: 4,
        fill: "white", "fill-opacity": 0.9,
        stroke: kleur, "stroke-width": 1.2, "stroke-opacity": 0.7,
      }));
      // 2025 — gevulde cirkel
      grp.appendChild(el("circle", {
        cx: x2, cy: y2, r: POINT_R_NA,
        fill: kleur, "fill-opacity": 0.6,
        stroke: kleur, "stroke-width": 1, "stroke-opacity": 0.9,
      }));

      g.appendChild(grp);
      groupById[id] = { el: grp, kleur: kleur, soort: "paar" };
    });

    // Verloren klanten — alleen 2024, geen pijl. Subtiele open cirkel met
    // dashed rand, om visueel onderscheid te maken met paar-startpunten.
    overzicht.verloren.forEach(function (rec) {
      var id = idVan(rec.klant);
      var cx = x(rec.voor.omzet), cy = y(rec.voor.margePercent);
      var grp = el("g", { class: "migratie", "data-id": id });
      grp.appendChild(el("circle", {
        cx: cx, cy: cy, r: 5,
        fill: "white", "fill-opacity": 0.9,
        stroke: INK_300, "stroke-width": 1.2, "stroke-opacity": 0.9,
        "stroke-dasharray": "2 2",
      }));
      g.appendChild(grp);
      groupById[id] = { el: grp, kleur: INK_300, soort: "verloren" };
    });

    // Nieuwe klanten — alleen 2025, geen pijl. Gevulde cirkel met amber-rand
    // als signaal "dit is een nieuwe entry, geen 2025-helft van een paar".
    overzicht.nieuw.forEach(function (rec) {
      var id = idVan(rec.klant);
      var cx = x(rec.na.omzet), cy = y(rec.na.margePercent);
      var grp = el("g", { class: "migratie", "data-id": id });
      grp.appendChild(el("circle", {
        cx: cx, cy: cy, r: 6,
        fill: SLATE, "fill-opacity": 0.55,
        stroke: AMBER_500, "stroke-width": 2, "stroke-opacity": 0.95,
      }));
      g.appendChild(grp);
      groupById[id] = { el: grp, kleur: SLATE, soort: "nieuw" };
    });

    // ----- Tabel -----
    var rowsById = {};
    var sorted = paren.slice().sort(function (a, b) {
      var da = Math.abs(a.na.margePercent - a.voor.margePercent);
      var db = Math.abs(b.na.margePercent - b.voor.margePercent);
      return db - da;
    });

    tabel.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tabel-wrap";
    var table = document.createElement("table");
    table.className = "tabel";
    table.innerHTML =
      "<thead><tr>" +
      "<th>Klant</th>" +
      "<th class=\"num\">Omzet '25</th>" +
      "<th class=\"num\">Δ omzet</th>" +
      "<th class=\"num\">Marge '25</th>" +
      "<th class=\"num\">Δ marge</th>" +
      "</tr></thead>" +
      "<tbody></tbody>";
    wrap.appendChild(table);
    tabel.appendChild(wrap);
    var tbody = table.querySelector("tbody");
    var F = window.PA.format;

    function deltaTekst(v, suffix) {
      if (v === 0) return "0" + (suffix || "");
      var sign = v > 0 ? "+" : "−";
      return sign + Math.abs(Math.round(v)) + (suffix || "");
    }
    function deltaEuroTekst(v) {
      if (v === 0) return "€ 0";
      var sign = v > 0 ? "+€ " : "−€ ";
      var abs = Math.abs(v);
      if (abs >= 1000000) {
        var m = abs / 1000000;
        var s = m >= 10 ? m.toFixed(0) : m.toFixed(1);
        return sign + s + "M";
      }
      return sign + Math.round(abs / 1000) + "k";
    }

    sorted.forEach(function (paar) {
      var id = idVan(paar.klant);
      var omzetDelta = paar.na.omzet - paar.voor.omzet;
      var margeDelta = paar.na.margePercent - paar.voor.margePercent;
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", id);
      tr.innerHTML =
        "<td><strong>" + paar.klant + "</strong></td>" +
        "<td class=\"num\">" + F.euro(paar.na.omzet) + "</td>" +
        "<td class=\"num\">" + deltaEuroTekst(omzetDelta) + "</td>" +
        "<td class=\"num\">" + F.percent(paar.na.margePercent) + "</td>" +
        "<td class=\"num" + (margeDelta < -DREMPEL_PP ? " negative" : "") + "\">" +
        deltaTekst(margeDelta, "pp") + "</td>";
      tbody.appendChild(tr);
      rowsById[id] = tr;
    });

    overzicht.verloren.forEach(function (rec) {
      var id = idVan(rec.klant);
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", id);
      tr.innerHTML =
        "<td><strong>" + rec.klant + "</strong>" +
        "<div class=\"sub\">niet teruggekeerd in 2025</div></td>" +
        "<td class=\"num muted\">" + F.euro(rec.voor.omzet) + " ('24)</td>" +
        "<td class=\"num muted\">—</td>" +
        "<td class=\"num muted\">" + F.percent(rec.voor.margePercent) + " ('24)</td>" +
        "<td class=\"num muted\">—</td>";
      tbody.appendChild(tr);
      rowsById[id] = tr;
    });

    overzicht.nieuw.forEach(function (rec) {
      var id = idVan(rec.klant);
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", id);
      tr.innerHTML =
        "<td><strong>" + rec.klant + "</strong>" +
        "<div class=\"sub\">nieuw in 2025</div></td>" +
        "<td class=\"num\">" + F.euro(rec.na.omzet) + "</td>" +
        "<td class=\"num muted\">—</td>" +
        "<td class=\"num\">" + F.percent(rec.na.margePercent) + "</td>" +
        "<td class=\"num muted\">—</td>";
      tbody.appendChild(tr);
      rowsById[id] = tr;
    });

    // ----- Koppeling -----
    var hoveredId = null;
    var selectedId = null;
    function activeId() { return hoveredId || selectedId; }

    function applyState() {
      var active = activeId();
      Object.keys(groupById).forEach(function (id) {
        var grp = groupById[id];
        var isActive = active === id;
        var isFaded = active != null && !isActive;
        grp.el.setAttribute("opacity", isFaded ? 0.18 : 1);
        // Pijl en endpoint krijgen amber-accent bij activeren.
        var children = grp.el.childNodes;
        for (var i = 0; i < children.length; i++) {
          var c = children[i];
          if (!c.setAttribute) continue;
          if (isActive) {
            if (c.tagName === "line") {
              c.setAttribute("stroke", AMBER_500);
              c.setAttribute("stroke-width", 2);
            } else if (c.tagName === "polygon") {
              c.setAttribute("fill", AMBER_500);
            } else if (c.tagName === "circle") {
              // Tweede cirkel = 2025 (gevuld). Eerste = 2024 (open).
              if (c.getAttribute("fill") === "white") {
                c.setAttribute("stroke", AMBER_500);
              } else {
                c.setAttribute("fill", AMBER);
                c.setAttribute("stroke", AMBER_500);
              }
            }
          } else {
            // Reset naar baseline. Verloren en nieuw hebben afwijkende
            // baseline-strokes, dus per soort terugzetten.
            if (c.tagName === "line") {
              c.setAttribute("stroke", grp.kleur);
              c.setAttribute("stroke-width", 1.5);
            } else if (c.tagName === "polygon") {
              c.setAttribute("fill", grp.kleur);
            } else if (c.tagName === "circle") {
              if (grp.soort === "nieuw") {
                if (c.getAttribute("fill") === AMBER) c.setAttribute("fill", SLATE);
                c.setAttribute("stroke", AMBER_500);
              } else if (grp.soort === "verloren") {
                c.setAttribute("stroke", INK_300);
              } else {
                if (c.getAttribute("fill") === AMBER) {
                  c.setAttribute("fill", grp.kleur);
                }
                if (c.getAttribute("stroke") === AMBER_500) {
                  c.setAttribute("stroke", grp.kleur);
                }
              }
            }
          }
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

    Object.keys(groupById).forEach(function (id) {
      var grp = groupById[id].el;
      grp.style.cursor = "pointer";
      grp.addEventListener("mouseenter", function () { setHover(id); });
      grp.addEventListener("mouseleave", function () { setHover(null); });
      grp.addEventListener("click", function (e) {
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

  window.PA.migratiePlot = render;
})();
