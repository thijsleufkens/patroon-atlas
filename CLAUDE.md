# Patroon-atlas

> Lees eerst de root [CLAUDE.md](../../CLAUDE.md) voor de gedeelde context (doelgroep, stijl, principes, werkwijze). Dit document bevat alleen wat specifiek is voor deze app.

## Wat dit appje is

Een statische atlas in twee delen voor maakbedrijven van 50–200 fte die hun operationele dashboards op orde hebben, maar de stap naar patroon-herkenning over projecten heen nog niet zelf maken.

Deel 1, **Verkennen**: vier plots die patronen tonen die in standaard dashboards niet zichtbaar worden. Deel 2, **Presenteren**: drie MT-charts die uit de verkenning volgen en een aanbeveling onderbouwen. Het appje is een functionele demo van de volgende stap in analyse-capaciteit, niet een visualisatie-catalogus.

## Waarom dit appje bestaat

Operationele dashboards beantwoorden vragen die je al hebt: omzet deze maand, voorraad nu, doorlooptijd vorige week. De atlas laat zien wat een laag erboven zichtbaar maakt: structurele patronen per productlijn, klant-migratie, marge-erosie ontleed naar materiaal en uren, klant-machine-concentratie. Voor de doelgroep (BI-aanwezig, geavanceerde analyse afwezig) is dit precies het niveau dat tastbaar moet worden.

## De zeven pagina's

### Deel 1, Verkennen (4)

| Pad | Vorm | Vraag |
|---|---|---|
| `uitloop.html` | Heatmap (machinetype × fase) | Welke combinaties van productlijn en fase lopen structureel uit? |
| `erosie.html` | Decompositie-bar per machinetype | Bij welke productlijnen lekt de marge, en zit dat in materiaal of in uren? |
| `spreiding.html` | Bubble-matrix klant × machine | Hoe is de klant-machine-portefeuille opgebouwd, en waar zit afhankelijkheid? |
| `migratie.html` | Arrow-plot per klant | Welke klanten zijn anders dan vorig jaar? |

### Deel 2, Presenteren (3)

| Pad | Vorm | Aanbeveling |
|---|---|---|
| `mt-productlijn.html` | Horizontale delta-bar | Twee productlijnen vragen om een besluit voor 2026 |
| `mt-kalibratie.html` | Horizontale bar met tolerantielijn | Vier productlijnen vragen hogere engineering-calculatie |
| `mt-klant.html` | Pareto (bar + cum-lijn) | Top-3 levert 40% van de omzet, wat als de mix verschuift? |

### Bridges

Elke verkennen-plot heeft een **"Naar het MT met"**-sectie. Elke MT-chart heeft een **"Komt voort uit"**-sectie. Geen 1-op-1 mapping:

- `erosie` → `mt-kalibratie` + `mt-productlijn`
- `uitloop` → `mt-kalibratie` + `mt-productlijn`
- `spreiding` → `mt-klant`
- `migratie` → `mt-klant` + `mt-productlijn`

## Stack — bewust statisch

Geen build-step, geen framework, geen package manager.

```
patroon-atlas/
├── index.html                  # landing met tweedeling Verkennen / Presenteren
├── uitloop.html                # verkennen 1 — heatmap
├── erosie.html                 # verkennen 2 — decompositie-bar
├── spreiding.html              # verkennen 3 — bubble-matrix
├── migratie.html               # verkennen 4 — arrow-plot
├── mt-productlijn.html         # presenteren 1 — bar
├── mt-kalibratie.html          # presenteren 2 — bar met tolerantielijn
├── mt-klant.html               # presenteren 3 — Pareto
└── assets/
    ├── tokens.css              # DMT design-tokens, getrimd uit bvbv-canvas
    ├── styles.css              # paginastijlen
    ├── data.js                 # alle projecten + materiaalkosten + UURTARIEF_INTERN
    ├── format.js               # euro/percent/uren-formattering (nl-NL)
    ├── uitloop-plot.js
    ├── erosie-plot.js
    ├── spreiding-plot.js
    ├── migratie-plot.js
    ├── mt-productlijn-plot.js
    ├── mt-kalibratie-plot.js
    └── mt-klant-plot.js
```

Alle scripts attachen aan `window.PA`. Geen ES modules (werkt zo ook op `file://`). Geen externe charting library, SVG wordt met `document.createElementNS` opgebouwd.

## Hosting

GitHub Pages of elke statische host. Werkt ook op `file://` voor lokale review.

## Inspiratiebronnen

- [Tabular Editor — Building better scatterplots in Power BI](https://tabulareditor.com/blog/building-better-scatterplots-in-power-bi-reports)
- [SQLBI — Using scatterplots to find details in reports](https://www.sqlbi.com/articles/using-scatterplots-to-find-details-in-reports/)
- [bvbv-canvas](https://github.com/thijsleufkens/bvbv-canvas): static-HTML-pattern en DMT design-tokens.

## Wat dit appje expliciet NIET doet

Naast de gedeelde "wat appjes niet zijn"-lijst uit de root CLAUDE.md, specifiek voor deze app:

- Geen opslag, geen accounts, geen notities. Leesbare demo, geen logboek.
- Geen filters of dropdowns, geen tijdkiezers. Per pagina één plot, één tabel, één leeswijzer.
- Geen tooltip-cards die over de plot zweven. De detail-tabel doet dat werk.
- Geen tijdreeksen (cumulatieve marge per maand, trendlijnen). Dat is dashboard-territorium en zou de positionering verwateren.
- Geen "vraag een demo" of "schedule a call" CTA's tussendoor. De atlas is inspiratie, niet conversie.
- Geen jargon uit BI-wereld (geen "drill-down", "self-service", "data-driven").
- Geen em-dashes, komma's of dubbele punten volstaan.

## Demo-data

Korver Machinebouw, fictief familiebedrijf in Helmond, drie generaties, ~85 medewerkers. Bouwt verpakkingsmachines voor de Nederlandse voedingsmiddelenindustrie: sauzen, vlees, zuivel, conserven.

- 13 fictieve klanten (Brouwer Sauzen, De Vegter Vleeswaren, Hoogland Zuivel, …)
- 14 projecten in 2025, 13 in 2024
- Project-codes: K2024-XXX, K2025-XXX
- Machine-typen: Vulstation, Sleevemachine, Trayloader, Stretchwikkelaar, Etiketteermachine, Verpakkingslijn, Inpakrobot
- Bedragen €504k tot €2,94M per project, marges −3% tot +28%
- Per project ook `materiaalkostenGeschat` en `materiaalkostenWerkelijk` voor de erosie-plot
- Constante `window.PA.UURTARIEF_INTERN = 60` voor erosie-conversie (loaded rate)

Alle data zit in `assets/data.js` als een vast object op `window.PA.projecten`.

## Doelpubliek-toon

CFO of eigenaar van een NL maakbedrijf 50–200 fte. Weet wat marge, doorlooptijd, nacalculatie en ERP betekenen. Niet uitleggen.

Stijl op de pagina's:
- Direct, geen jargon, geen marketing-speak.
- Geen em-dashes, komma's of dubbele punten volstaan.
- Tone: collega-tot-collega.
- "Met je eigen data"-sectie op elke verkennen-pagina noemt concrete bronsystemen (Exact, AFAS, Ridder, Isah, Plan-de-CAMpagne).
