# Patroon-atlas

> Lees eerst de root [CLAUDE.md](../../CLAUDE.md) voor de gedeelde context (doelgroep, stijl, principes, werkwijze). Dit document bevat alleen wat specifiek is voor deze app.

## Wat dit appje is

Een statische galerij van vier scatterplots over een fictieve machinebouwer (Korver Machinebouw, Helmond). Demo voor maakbedrijven van 50–200 fte die hun operationele dashboards op orde hebben, maar de stap naar patroon-herkenning over projecten heen nog niet zelf maken.

Klikbare scatterplots gekoppeld aan een detail-tabel, per pagina één plot, één tabel, één leeswijzer, plus een sectie "Hoe je dit in het MT brengt" die laat zien hoe je van patroon naar aanbeveling beweegt.

## Waarom dit appje bestaat

Een operationeel dashboard beantwoordt vragen die je al hebt: omzet deze maand, voorraad nu, doorlooptijd vorige week. Scatterplots doen iets anders: ze stellen vragen die je nog niet had door twee dimensies tegen elkaar uit te zetten en groepen zichtbaar te maken die in een tabel verstopt blijven.

Voor de doelgroep (BI-aanwezig, geavanceerdere analyse afwezig) is dit precies het niveau dat tastbaar moet worden: zie wat scatterplots ontsluiten, vergelijkbaar met wat in een Power BI-rapport haalbaar is, met dezelfde data die ze al hebben.

## De vier plots

| Nr | Pad | Vorm | Niveau | Vraag |
|---|---|---|---|---|
| 1 | `klanten.html` | kwadrant | klant | Welke klanten verdienen, en welke kosten je geld? (kleur = sub-sector) |
| 2 | `producten.html` | arrow-kwadrant | productlijn | Welke productlijnen renderen, en welke bewegen de verkeerde kant op? (pijl 2024 → 2025 in marge × engineering-uitloop) |
| 3 | `spreiding.html` | bubble-matrix | klant × productlijn | Hoe ligt de klant-machine-portefeuille? (gegroepeerd per sub-sector) |
| 4 | `migratie.html` | arrow | klant | Welke klanten zijn anders dan vorig jaar? (2024 → 2025 met pijltjes) |

Vier verschillende aggregatieniveaus binnen de scatter-familie. Plot 1 is een klant-kwadrant met sub-sector kleur. Plot 2 is een productlijn-kwadrant met pijl 2024 → 2025 om richting zichtbaar te maken. Plot 3 is een bubble-matrix klant × productlijn met sub-sector groepering. Plot 4 is een klant-arrow tussen twee jaren in omzet × marge ruimte.

## Sub-sector groepering

Vier van de plots gebruiken een sub-sector-indeling over de fictieve klanten:

- **Bakery** (5): Akkermans, Bos, Ravenstein, Veldhuis, Westland
- **Specialty** (3): Den Hartog, Klaver, Smaakhuis
- **Protein** (2): De Vegter, Verlinden
- **Dairy** (2): Hoogland, Vink
- **Sauces** (2): Brouwer, Bremer

Sub-sector zit als mapping in `window.PA.klantSubsector` met bijbehorende kleuren in `window.PA.subsectorKleur`. Gebruikt in `klanten-plot.js` (kleur per punt) en `spreiding-plot.js` (rij-groepering plus marker).

## Stack — bewust statisch

Geen build-step, geen framework, geen package manager.

```
patroon-atlas/
├── index.html                  # landing met 4 tegels
├── klanten.html                # Plot 1 — klant-niveau kwadrant
├── producten.html              # Plot 2 — productlijn kwadrant
├── spreiding.html              # Plot 3 — klant × productlijn matrix
├── migratie.html               # Plot 4 — klant 2024→2025 arrows
└── assets/
    ├── tokens.css              # DMT design-tokens
    ├── styles.css              # paginastijlen
    ├── data.js                 # alle projecten + klant-subsector + UURTARIEF_INTERN
    ├── format.js               # euro/percent/uren-formattering (nl-NL)
    ├── klanten-plot.js         # plot 1
    ├── producten-plot.js       # plot 2
    ├── spreiding-plot.js       # plot 3
    └── migratie-plot.js        # plot 4
```

Alle scripts attachen aan `window.PA`. Geen ES modules (werkt zo ook op `file://`). Geen externe charting library, SVG wordt met `document.createElementNS` opgebouwd.

## Hosting

GitHub Pages of elke statische host. Werkt ook op `file://` voor lokale review.

## Demo-data

Korver Machinebouw, ~85 fte, drie generaties, special-machines voor verpakkingslijnen in food (sauzen, vlees, zuivel, conserven, bakery).

- 14 fictieve klanten (Brouwer Sauzen, De Vegter Vleeswaren, Hoogland Zuivel, ...) over 5 sub-sectoren
- 13 projecten in 2024, 14 in 2025
- Project-codes: K2024-XXX, K2025-XXX
- Machine-typen: Vulstation, Sleevemachine, Trayloader, Stretchwikkelaar, Etiketteermachine, Verpakkingslijn, Inpakrobot
- Bedragen €504k tot €2,94M per project, marges −3% tot +28%

Aanvullende velden per project: `materiaalkostenGeschat` en `materiaalkostenWerkelijk` plus de constante `window.PA.UURTARIEF_INTERN = 60`. Niet gebruikt in huidige plots, maar gehandhaafd voor mogelijk later (bv. een toekomstige marge-erosie decompositie).

Alle data zit in `assets/data.js` als een vast object op `window.PA.projecten`.

## Doelpubliek-toon

CFO of eigenaar van een NL maakbedrijf 50–200 fte. Weet wat marge, doorlooptijd, nacalculatie en ERP betekenen. Niet uitleggen.

Stijl op de pagina's:
- Direct, geen jargon, geen marketing-speak.
- Geen em-dashes in body-tekst, dubbele punten of komma's volstaan.
- Tone: collega-tot-collega.
- "Met je eigen data"-sectie op elke pagina noemt concrete bronsystemen (Exact, AFAS, Ridder, Isah, Plan-de-CAMpagne).
- "Hoe je dit in het MT brengt"-sectie sluit elke pagina af met een concrete aanbeveling die uit het patroon zou rollen. Niet een aparte presenteer-pagina, maar integraal onderdeel van de plot-pagina.

## Wat dit appje expliciet NIET doet

Naast de gedeelde "wat appjes niet zijn"-lijst uit de root CLAUDE.md, specifiek voor deze app:

- Geen opslag, geen accounts, geen notities. Leesbare demo, geen logboek.
- Geen filters of dropdowns, geen tijdkiezers.
- Geen tooltip-cards die over de plot zweven. De detail-tabel doet dat werk.
- Geen tijdreeksen, dat is dashboard-territorium.
- Geen aparte deel 1 / deel 2 indeling. Eén identiteit, scatter-atlas.
- Geen "vraag een demo" of "schedule a call" CTA's tussendoor.
- Geen jargon uit BI-wereld (geen "drill-down", "self-service", "data-driven").
