# Patroon-atlas

Een statische galerij van vier scatterplots over een fictieve machinebouwer.
Bedoeld als demo voor maakbedrijven met operationele dashboards op orde,
die merken dat dezelfde grafieken niet meer nieuwe inzichten opleveren
maar het knaagt dat er over projecten heen een patroon moet zitten.

Onderdeel van [datawijs-met-thijs](../../README.md).

## Wat het laat zien

Operationele dashboards beantwoorden vragen die je al hebt: omzet deze
maand, voorraad nu, doorlooptijd vorige week. Scatterplots doen iets
anders: ze stellen vragen die je nog niet had door twee dimensies tegen
elkaar uit te zetten en groepen zichtbaar te maken die in een tabel
verstopt blijven.

Vier plots op vier aggregatieniveaus, in vier verschillende vormen:

1. **Klanten** (kwadrant op klant-niveau): omzet × marge per klant,
   geaggregeerd over alle projecten, kleur per sub-sector.
2. **Producten** (kwadrant op productlijn-niveau): marge × engineering-
   uitloop per machinetype, bubble = totale omzet van het type.
3. **Spreiding** (bubble-matrix klant × machinetype): klant-product-
   portefeuille met sub-sector groepering, één bubble per project.
4. **Migratie** (arrow per klant): pijl tussen 2024 en 2025 in
   omzet × marge ruimte.

Elke detailpagina sluit af met een sectie **"Hoe je dit in het MT brengt"**
die een concrete aanbeveling formuleert die uit het patroon zou kunnen
volgen.

## Stack

Bewust statisch: vijf HTML-bestanden, één gedeelde `assets/`-map, geen
build-step. Volgt de pattern van
[bvbv-canvas](https://github.com/thijsleufkens/bvbv-canvas).

| Onderdeel | Keuze |
|---|---|
| Markup | 5 statische HTML-bestanden (index + 4 plots) |
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
generaties, 85 medewerkers, bouwt verpakkingsmachines voor de Nederlandse
voedingsmiddelenindustrie: sauzen, vlees, zuivel, conserven, bakery.
Twee jaar projectdata: veertien klanten in vijf sub-sectoren, acht
productlijnen, zevenentwintig projecten. Alle namen, projectcodes en
getallen zijn verzonnen.

## Inspiratiebronnen

- [Tabular Editor — Building better scatterplots in Power BI](https://tabulareditor.com/blog/building-better-scatterplots-in-power-bi-reports)
- [SQLBI — Using scatterplots to find details in reports](https://www.sqlbi.com/articles/using-scatterplots-to-find-details-in-reports/)

## Licentie

[MIT](../../LICENSE).
