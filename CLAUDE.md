# Patroon-atlas

> Lees eerst de root [CLAUDE.md](../../CLAUDE.md) voor de gedeelde context (doelgroep, stijl, principes, werkwijze). Dit document bevat alleen wat specifiek is voor deze app.

## Wat dit appje is

Een statische galerij van vier scatterplots over een fictieve machinebouwer (Korver Machinebouw, Helmond). Bedoeld als demo voor maakbedrijven van 50–200 FTE die hun operationele dashboards op orde hebben, maar de stap naar patroon-herkenning nog niet zelf maken.

Het appje is een visueel essay, niet een tool met opslag. Klikbare scatterplots gekoppeld aan een detail-tabel, met per plot een leeswijzer.

## Waarom dit appje bestaat

Een operationeel dashboard beantwoordt vragen die je al hebt — omzet deze maand, voorraad nu, doorlooptijd vorige week. Scatterplots doen iets anders: ze stellen vragen die je nog niet had door twee dimensies tegen elkaar uit te zetten en groepen zichtbaar te maken die in een tabel verstopt blijven.

Voor de doelgroep (BI-persoon-aanwezig, geavanceerdere analyse afwezig) is dit precies het niveau dat tastbaar moet worden: zie wat scatterplots kunnen, vergelijkbaar met wat in een Power BI-rapport haalbaar is, met dezelfde data die ze al hebben.

## De vier plots

| Nr | Pad | Vraag | Status |
|---|---|---|---|
| 01 | `klanten.html` | Welke projecten verdienen, en welke kosten je geld? (omzet × marge, bubble = uren) | klaar |
| 02 | `doorlooptijd.html` | Welke projecten lopen structureel uit? (geplande × werkelijke doorlooptijd) | klaar |
| 03 | `fases.html` | Waar lekken de uren binnen een project? (per fase: geschat × werkelijk) | klaar |
| 04 | `migratie.html` | Welke klanten zijn anders dan vorig jaar? (2024 → 2025 met pijltjes) | klaar |

Plot 4 is de wow-plot: kwadrant-migratie over twee jaren is moeilijk in standaard dashboards te repliceren en levert het sterkste &ldquo;dat zou ik willen&rdquo;-moment op.

## Stack — bewust statisch

Geen build-step, geen framework, geen package manager.

```
patroon-atlas/
├── index.html               # homepage
├── klanten.html             # plot 1 (klaar)
├── doorlooptijd.html        # plot 2 (klaar)
├── fases.html               # plot 3 (klaar)
├── migratie.html            # plot 4 (klaar)
└── assets/
    ├── tokens.css           # DMT design-tokens, getrimd uit bvbv-canvas
    ├── styles.css           # paginastijlen specifiek voor patroon-atlas
    ├── data.js              # alle projecten als JS-object op window.PA
    ├── format.js            # euro/percent/uren-formattering (nl-NL)
    ├── kwadrant-plot.js     # plot 1 — vanilla JS, inline SVG, hover-coupling
    ├── doorlooptijd-plot.js # plot 2 — diagonaal y = x als leeshulp
    ├── fases-plot.js        # plot 3 — drie fase-records per project, kleur per fase
    └── migratie-plot.js     # plot 4 — pijlen tussen 2024- en 2025-aggregaten per klant
```

Alle scripts attachen aan `window.PA`. Geen ES modules (werkt zo ook op `file://`). Geen externe charting library — SVG wordt met `document.createElementNS` opgebouwd. Voor 4 plots is dat ~250 regels per plot en geeft volledige controle over kleur, kwadrant-overlays en pijltjes (nodig voor plot 4).

## Hosting

GitHub Pages of elke statische host. Werkt ook op `file://` voor lokale review. Wordt **niet** via Docker gedraaid (zit niet in `docker-compose.yml`).

## Inspiratiebronnen

- [Tabular Editor — Building better scatterplots in Power BI](https://tabulareditor.com/blog/building-better-scatterplots-in-power-bi-reports): de kwadrant-strategie als &ldquo;decision map&rdquo;, met de belangrijke caveat dat de grenslijn een leeshulp is, geen wet.
- [SQLBI — Using scatterplots to find details in reports](https://www.sqlbi.com/articles/using-scatterplots-to-find-details-in-reports/): scatterplot als visuele index die je via crossfilter naar een detail-tabel leidt. Dat is het hoofdmechaniek hier.
- [bvbv-canvas](https://github.com/thijsleufkens/bvbv-canvas): static-HTML-pattern en de DMT design-tokens (kleuren, Roboto).

## Wat dit appje expliciet NIET doet

Naast de gedeelde &ldquo;wat appjes niet zijn&rdquo;-lijst uit de root CLAUDE.md, specifiek voor deze app:

- Geen opslag. Geen accounts. Geen notities. Het is een leesbare demo, geen logboek.
- Geen filters of dropdowns. Geen tijdkiezers. Per pagina één plot, één tabel, één leeswijzer.
- Geen tooltip-cards die over de plot zweven. De detail-tabel doet dat werk — rustiger en consistent.
- Geen export, geen delen-knop, geen rapport-PDF.
- Geen framework. Voor het volgende plot: schrijf gewoon een nieuw `<plot-naam>-plot.js` naast `kwadrant-plot.js` dat hetzelfde `window.PA.X(opts)`-patroon volgt.

## Demo-data

Korver Machinebouw, ~120 FTE, special-machinebouwer voor de voedingsmiddelenindustrie. Project-organisatie met drie fasen: engineering, assemblage, inbedrijfstelling.

- 12 fictieve klanten (Brouwer Sauzen, De Vegter Vleeswaren, Hoogland Zuivel, ...)
- 13 projecten in 2025, 12 in 2024
- Project-codes: K2024-XXX, K2025-XXX
- Machine-typen: Vulstation, Sleevemachine, Trayloader, Stretchwikkelaar, Etiketteermachine, Verpakkingslijn, Inpakrobot
- Bedragen €72k tot €420k, marges −3% tot +28%

Alle data zit in `assets/data.js` als een vast object op `window.PA.projecten`.

## Vervolg

Alle vier de plots staan. Elke plot heeft een eigen `<plot-naam>-plot.js`, registreert zich op `window.PA.<naam>Plot`, en volgt hetzelfde patroon: vanilla SVG, hover-koppeling met de tabel, kleuren uit het DMT-palet. Volgend werk zit niet in nieuwe plots maar in inhoudelijke aanscherping: scherpere kwadrant-labels, betere mobiele layout, of een vijfde plot als er een nieuwe vraag bij komt.
