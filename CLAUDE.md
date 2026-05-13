# Patroon-atlas

> Lees eerst de root [CLAUDE.md](../../CLAUDE.md) voor de gedeelde context (doelgroep, stijl, principes, werkwijze). Dit document bevat alleen wat specifiek is voor deze app.

## Wat dit appje is

Een statische galerij van zeven scatterplots over een fictieve machinebouwer (Korver Machinebouw, Helmond). Bedoeld als demo voor maakbedrijven van 50–200 FTE die hun operationele dashboards op orde hebben, maar de stap naar patroon-herkenning nog niet zelf maken.

Het appje is een visueel essay, niet een tool met opslag. Klikbare scatterplots gekoppeld aan een detail-tabel, met per plot een leeswijzer.

## Waarom dit appje bestaat

Een operationeel dashboard beantwoordt vragen die je al hebt — omzet deze maand, voorraad nu, doorlooptijd vorige week. Scatterplots doen iets anders: ze stellen vragen die je nog niet had door twee dimensies tegen elkaar uit te zetten en groepen zichtbaar te maken die in een tabel verstopt blijven.

Voor de doelgroep (BI-persoon-aanwezig, geavanceerdere analyse afwezig) is dit precies het niveau dat tastbaar moet worden: zie wat scatterplots kunnen, vergelijkbaar met wat in een Power BI-rapport haalbaar is, met dezelfde data die ze al hebben.

## De zeven plots

| Nr | Pad | Niveau | Vraag |
|---|---|---|---|
| 01 | `klanten.html` | project | Welke projecten verdienen, en welke kosten je geld? (omzet × marge, bubble = uren) |
| 02 | `doorlooptijd.html` | project | Welke projecten lopen structureel uit? (geplande × werkelijke doorlooptijd) |
| 03 | `fases.html` | fase | Waar lekken de uren binnen een project? (per fase: geschat × werkelijk) |
| 04 | `migratie.html` | klant | Welke klanten zijn anders dan vorig jaar? (2024 → 2025 met pijltjes) |
| 05 | `producten.html` | productlijn | Welke productlijnen renderen, en welke kosten je structureel geld? (marge × engineering-uitloop per machinetype) |
| 06 | `spreiding.html` | klant × productlijn | Hoe zit de klant-machine-portefeuille in elkaar? (bubble-matrix, jaar = open/gevuld) |
| 07 | `leercurve.html` | productlijn | Leren we van onze fouten per productlijn? (2024 → 2025 per machinetype) |

Plot 4 en 7 zijn de wow-plots: kwadrant-migratie over twee jaren — op klant- (4) en op productlijn-niveau (7) — is moeilijk in standaard dashboards te repliceren. Plot 5/6/7 doen wat dashboards specifiek niet doen: aggregeren over meerdere projecten heen om productlijn-patronen zichtbaar te maken.

## Stack — bewust statisch

Geen build-step, geen framework, geen package manager.

```
patroon-atlas/
├── index.html               # homepage
├── klanten.html             # plot 1 — project
├── doorlooptijd.html        # plot 2 — project
├── fases.html               # plot 3 — fase
├── migratie.html            # plot 4 — klant
├── producten.html           # plot 5 — productlijn
├── spreiding.html           # plot 6 — klant × productlijn
├── leercurve.html           # plot 7 — productlijn
└── assets/
    ├── tokens.css           # DMT design-tokens, getrimd uit bvbv-canvas
    ├── styles.css           # paginastijlen specifiek voor patroon-atlas
    ├── data.js              # alle projecten als JS-object op window.PA
    ├── format.js            # euro/percent/uren-formattering (nl-NL)
    ├── kwadrant-plot.js     # plot 1 — vanilla JS, inline SVG, hover-coupling
    ├── doorlooptijd-plot.js # plot 2 — diagonaal y = x als leeshulp
    ├── fases-plot.js        # plot 3 — drie fase-records per project, kleur per fase
    ├── migratie-plot.js     # plot 4 — pijlen tussen 2024- en 2025-aggregaten per klant
    ├── producten-plot.js    # plot 5 — kwadrant per machinetype (marge × engineering-uitloop)
    ├── spreiding-plot.js    # plot 6 — categorische bubble-matrix klant × machine
    └── leercurve-plot.js    # plot 7 — pijlen tussen 2024- en 2025-aggregaten per machinetype
```

Alle scripts attachen aan `window.PA`. Geen ES modules (werkt zo ook op `file://`). Geen externe charting library — SVG wordt met `document.createElementNS` opgebouwd. Voor 7 plots is dat ~250-350 regels per plot en geeft volledige controle over kleur, kwadrant-overlays en pijltjes (nodig voor plot 4 en 7).

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
- Bedragen €504k tot €2,94M per project, marges −3% tot +28%

Alle data zit in `assets/data.js` als een vast object op `window.PA.projecten`.

## Vervolg

Alle zeven plots staan, op drie aggregatie-niveaus:

- **Project-/fase-/klant-niveau** (plot 1–4) — diagnostiek voor individuele cases.
- **Productlijn-niveau** (plot 5, 7) — aggregeert over meerdere projecten heen om structurele patronen per machinetype te tonen.
- **Klant × productlijn-niveau** (plot 6) — kruistabel met jaar-onderscheid.

Elke plot heeft een eigen `<plot-naam>-plot.js`, registreert zich op `window.PA.<naam>Plot`, en volgt hetzelfde patroon: vanilla SVG, hover-koppeling met de tabel, kleuren uit het DMT-palet. Tijdreeksen (cumulatieve marge per maand etc.) zitten bewust niet in deze atlas — dat is dashboard-territorium en zou de positionering verwateren.
