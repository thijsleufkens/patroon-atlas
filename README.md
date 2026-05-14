# Patroon-atlas

Een statische atlas in twee delen voor maakbedrijven die hun operationele
dashboards op orde hebben en merken dat dezelfde grafieken niet meer nieuwe
inzichten opleveren, maar dat het knaagt dat er over projecten heen iets
moet zitten.

Onderdeel van [datawijs-met-thijs](../../README.md).

## Wat het laat zien

Vier verkennings-plots die patronen over projecten heen tonen, plus drie
MT-charts die uit die patronen volgen. Bedoeld om te laten zien hoe de
volgende stap in analyse-capaciteit eruit kan zien als operationele
rapportage al staat.

### Deel 1, Verkennen

Vier plots, elk in een andere vorm, elk een vraag die in een standaard
dashboard niet staat.

1. **Uitloop** (heatmap) — welke combinaties van productlijn en fase lopen
   structureel uit?
2. **Erosie** (decompositie-bar) — bij welke productlijnen lekt de marge,
   en zit dat in materiaal of in uren?
3. **Spreiding** (bubble-matrix) — hoe is de klant-machine-portefeuille
   opgebouwd, en waar zit afhankelijkheid?
4. **Migratie** (arrow-plot) — welke klanten zijn anders dan vorig jaar?

### Deel 2, Presenteren

Drie MT-charts die een aanbeveling onderbouwen, voortgekomen uit de
verkenning. Basis-vormen, één boodschap per chart.

1. **Productlijn-besluit** (bar) — twee productlijnen vragen om een
   go/no-go voor 2026.
2. **Uren-kalibratie** (bar met tolerantielijn) — vier productlijnen
   vragen hogere engineering-calculatie.
3. **Klant-concentratie** (Pareto) — top-3 levert 40% van de omzet, wat
   als de mix verschuift?

Elke verkennings-plot heeft een **"Naar het MT met"**-sectie die naar
één of twee MT-charts linkt. Elke MT-chart heeft een **"Komt voort uit"**
die terugverwijst.

## Stack

Bewust statisch: acht HTML-bestanden, één gedeelde `assets/`-map, geen
build-step. Volgt de pattern van
[bvbv-canvas](https://github.com/thijsleufkens/bvbv-canvas).

| Onderdeel | Keuze |
|---|---|
| Markup | 8 statische HTML-bestanden (index + 4 verkennen + 3 presenteren) |
| Styling | Vanilla CSS met DMT design-tokens uit bvbv-canvas |
| Charting | Vanilla JS dat inline SVG genereert, geen library |
| Data | Statisch JS-object in `assets/data.js` |
| Hosting | GitHub Pages, of `python3 -m http.server` lokaal |

Geen Next.js, geen React, geen TypeScript, geen Docker, geen package.json.

## Lokaal draaien

Open `index.html` direct in de browser (werkt op `file://`), of serveer
de map:

```bash
cd apps/patroon-atlas
python3 -m http.server 8000
```

Open <http://localhost:8000/>.

## Hosten

GitHub Pages, vanaf de hoofdmap van deze sub-directory. Of elke andere
statische host (Netlify drop, Cloudflare Pages, eigen webserver).

## Demo-data

Korver Machinebouw, een fictieve special-machinebouwer in Helmond. Drie
generaties, 85 medewerkers, bouwt verpakkingsmachines voor de
Nederlandse voedingsmiddelenindustrie: sauzen, vlees, zuivel, conserven.
Twee jaar projectdata: dertien klanten, acht productlijnen, vijfentwintig
projecten. Alle namen, projectcodes en getallen zijn verzonnen.

## Inspiratiebronnen

- [Tabular Editor — Building better scatterplots in Power BI](https://tabulareditor.com/blog/building-better-scatterplots-in-power-bi-reports)
- [SQLBI — Using scatterplots to find details in reports](https://www.sqlbi.com/articles/using-scatterplots-to-find-details-in-reports/)

## Licentie

[MIT](../../LICENSE).
