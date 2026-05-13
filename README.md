# Patroon-atlas

Een galerij van vier scatterplots over een fictieve machinebouwer. Bedoeld als demo voor maakbedrijven die hun operationele dashboards op orde hebben, maar de stap naar patroon-herkenning nog niet zelf maken.

Onderdeel van [datawijs-met-thijs](../../README.md).

## Wat het laat zien

Operationele dashboards beantwoorden vragen die je al hebt. Scatterplots stellen vragen die je nog niet had — door twee dimensies tegen elkaar uit te zetten en groepen zichtbaar te maken die in een tabel verstopt blijven.

Vier plots, elk een vraag:

1. **Klanten** — welke projecten verdienen, en welke kosten je geld?
2. **Doorlooptijd** — welke projecten lopen structureel uit?
3. **Projectfases** — waar lekken de uren binnen een project?
4. **Migratie** — welke klanten zijn anders dan vorig jaar?

Plot 1 staat uit; de andere drie zijn voor nu placeholders met de onderliggende vraag en een voorbeeld uit de data.

## Stack

Bewust statisch: vijf HTML-bestanden, één gedeelde `assets/`-map, geen build-step. Volgt de pattern van [bvbv-canvas](https://github.com/thijsleufkens/bvbv-canvas).

| Onderdeel | Keuze |
|---|---|
| Markup | 5 statische HTML-bestanden (index + 4 plots) |
| Styling | Vanilla CSS met DMT design-tokens uit bvbv-canvas |
| Charting | Vanilla JS dat inline SVG genereert — geen library |
| Data | Statisch JS-object in `assets/data.js` |
| Hosting | GitHub Pages, of `python3 -m http.server` lokaal |

Geen Next.js, geen React, geen TypeScript, geen Docker, geen package.json.

## Lokaal draaien

Open `index.html` direct in de browser (werkt op `file://`), of serveer de map:

```bash
cd apps/patroon-atlas
python3 -m http.server 8000
```

Open <http://localhost:8000/>.

## Hosten

GitHub Pages, vanaf de hoofdmap van deze sub-directory. Of elke andere statische host (Netlify drop, Cloudflare Pages, eigen webserver).

## Demo-data

Korver Machinebouw, een fictief familiebedrijf in Helmond dat special machines bouwt voor de voedingsmiddelenindustrie. ~120 FTE, project-organisatie. Alle klantnamen, projectcodes en getallen zijn verzonnen.

## Inspiratiebronnen

- [Tabular Editor — Building better scatterplots in Power BI](https://tabulareditor.com/blog/building-better-scatterplots-in-power-bi-reports)
- [SQLBI — Using scatterplots to find details in reports](https://www.sqlbi.com/articles/using-scatterplots-to-find-details-in-reports/)

## Licentie

[MIT](../../LICENSE).
