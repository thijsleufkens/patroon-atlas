// Demo-data voor patroon-atlas — Korver Machinebouw, Helmond.
// Fictief familiebedrijf, special machines voor de voedingsmiddelenindustrie.
// Alle namen, projectcodes en getallen zijn verzonnen.

window.PA = window.PA || {};

window.PA.projecten = [
  { id: "K2025-101", klant: "Brouwer Sauzen",        machine: "Vulstation M40",        jaar: 2025, omzet: 285000, margePercent: 22,  totaalUren: 2400, geplandeDoorlooptijdWeken: 18, werkelijkeDoorlooptijdWeken: 19,
    fases: [ { fase: "engineering", geschat:  480, werkelijk:  520 },
             { fase: "assemblage",  geschat: 1440, werkelijk: 1480 },
             { fase: "inbedrijfstelling", geschat: 360, werkelijk: 400 } ] },

  { id: "K2025-102", klant: "De Vegter Vleeswaren",  machine: "Sleevemachine S22",     jaar: 2025, omzet: 240000, margePercent:  4,  totaalUren: 2680, geplandeDoorlooptijdWeken: 16, werkelijkeDoorlooptijdWeken: 24,
    fases: [ { fase: "engineering", geschat:  360, werkelijk:  620 },
             { fase: "assemblage",  geschat: 1280, werkelijk: 1380 },
             { fase: "inbedrijfstelling", geschat: 320, werkelijk: 680 } ] },

  { id: "K2025-103", klant: "Hoogland Zuivel",       machine: "Verpakkingslijn L100",  jaar: 2025, omzet: 420000, margePercent: 19,  totaalUren: 3600, geplandeDoorlooptijdWeken: 26, werkelijkeDoorlooptijdWeken: 28,
    fases: [ { fase: "engineering", geschat:  720, werkelijk:  800 },
             { fase: "assemblage",  geschat: 2160, werkelijk: 2200 },
             { fase: "inbedrijfstelling", geschat: 540, werkelijk: 600 } ] },

  { id: "K2025-104", klant: "Westland Bakkerijen",   machine: "Trayloader T15",        jaar: 2025, omzet: 145000, margePercent: 24,  totaalUren: 1200, geplandeDoorlooptijdWeken: 12, werkelijkeDoorlooptijdWeken: 12,
    fases: [ { fase: "engineering", geschat:  200, werkelijk:  200 },
             { fase: "assemblage",  geschat:  760, werkelijk:  760 },
             { fase: "inbedrijfstelling", geschat: 200, werkelijk: 240 } ] },

  { id: "K2025-105", klant: "Bos Snacks",            machine: "Inpakrobot R5",         jaar: 2025, omzet:  95000, margePercent:  8,  totaalUren:  920, geplandeDoorlooptijdWeken: 10, werkelijkeDoorlooptijdWeken: 14,
    fases: [ { fase: "engineering", geschat:  160, werkelijk:  240 },
             { fase: "assemblage",  geschat:  560, werkelijk:  540 },
             { fase: "inbedrijfstelling", geschat: 140, werkelijk: 220 } ] },

  { id: "K2025-106", klant: "Den Hartog Conserven",  machine: "Etiketteermachine E12", jaar: 2025, omzet: 168000, margePercent: 17,  totaalUren: 1380, geplandeDoorlooptijdWeken: 14, werkelijkeDoorlooptijdWeken: 15,
    fases: [ { fase: "engineering", geschat:  240, werkelijk:  260 },
             { fase: "assemblage",  geschat:  880, werkelijk:  900 },
             { fase: "inbedrijfstelling", geschat: 220, werkelijk: 220 } ] },

  { id: "K2025-107", klant: "Verlinden Vis",         machine: "Stretchwikkelaar W8",   jaar: 2025, omzet: 110000, margePercent: -3,  totaalUren: 1480, geplandeDoorlooptijdWeken: 11, werkelijkeDoorlooptijdWeken: 19,
    fases: [ { fase: "engineering", geschat:  160, werkelijk:  360 },
             { fase: "assemblage",  geschat:  680, werkelijk:  760 },
             { fase: "inbedrijfstelling", geschat: 160, werkelijk: 360 } ] },

  { id: "K2025-108", klant: "Akkermans Suikerwerk",  machine: "Vulstation M60",        jaar: 2025, omzet: 340000, margePercent: 16,  totaalUren: 2900, geplandeDoorlooptijdWeken: 22, werkelijkeDoorlooptijdWeken: 23,
    fases: [ { fase: "engineering", geschat:  560, werkelijk:  600 },
             { fase: "assemblage",  geschat: 1740, werkelijk: 1780 },
             { fase: "inbedrijfstelling", geschat: 440, werkelijk: 520 } ] },

  { id: "K2025-109", klant: "Ravenstein Banket",     machine: "Trayloader T15",        jaar: 2025, omzet: 132000, margePercent: 21,  totaalUren: 1080, geplandeDoorlooptijdWeken: 11, werkelijkeDoorlooptijdWeken: 11,
    fases: [ { fase: "engineering", geschat:  180, werkelijk:  180 },
             { fase: "assemblage",  geschat:  680, werkelijk:  700 },
             { fase: "inbedrijfstelling", geschat: 180, werkelijk: 200 } ] },

  { id: "K2025-110", klant: "Vink Diepvries",        machine: "Verpakkingslijn L100",  jaar: 2025, omzet: 395000, margePercent:  7,  totaalUren: 3800, geplandeDoorlooptijdWeken: 24, werkelijkeDoorlooptijdWeken: 32,
    fases: [ { fase: "engineering", geschat:  640, werkelijk:  920 },
             { fase: "assemblage",  geschat: 2240, werkelijk: 2380 },
             { fase: "inbedrijfstelling", geschat: 480, werkelijk: 500 } ] },

  { id: "K2025-111", klant: "Smaakhuis Groothandel", machine: "Etiketteermachine E12", jaar: 2025, omzet:  88000, margePercent: 12,  totaalUren:  780, geplandeDoorlooptijdWeken:  9, werkelijkeDoorlooptijdWeken: 10,
    fases: [ { fase: "engineering", geschat:  140, werkelijk:  160 },
             { fase: "assemblage",  geschat:  500, werkelijk:  500 },
             { fase: "inbedrijfstelling", geschat: 120, werkelijk: 120 } ] },

  { id: "K2025-112", klant: "Klaver Kruiden",        machine: "Inpakrobot R5",         jaar: 2025, omzet:  76000, margePercent: 28,  totaalUren:  640, geplandeDoorlooptijdWeken:  8, werkelijkeDoorlooptijdWeken:  8,
    fases: [ { fase: "engineering", geschat:  100, werkelijk:  100 },
             { fase: "assemblage",  geschat:  420, werkelijk:  420 },
             { fase: "inbedrijfstelling", geschat: 120, werkelijk: 120 } ] },

  { id: "K2025-113", klant: "Brouwer Sauzen",        machine: "Etiketteermachine E12", jaar: 2025, omzet: 156000, margePercent: 15,  totaalUren: 1320, geplandeDoorlooptijdWeken: 13, werkelijkeDoorlooptijdWeken: 14,
    fases: [ { fase: "engineering", geschat:  220, werkelijk:  240 },
             { fase: "assemblage",  geschat:  840, werkelijk:  860 },
             { fase: "inbedrijfstelling", geschat: 220, werkelijk: 220 } ] },

  { id: "K2024-091", klant: "Brouwer Sauzen",        machine: "Vulstation M40",        jaar: 2024, omzet: 268000, margePercent: 20,  totaalUren: 2280, geplandeDoorlooptijdWeken: 18, werkelijkeDoorlooptijdWeken: 19, fases: [] },
  { id: "K2024-088", klant: "De Vegter Vleeswaren",  machine: "Sleevemachine S22",     jaar: 2024, omzet: 215000, margePercent: 11,  totaalUren: 2100, geplandeDoorlooptijdWeken: 16, werkelijkeDoorlooptijdWeken: 18, fases: [] },
  { id: "K2024-082", klant: "Hoogland Zuivel",       machine: "Trayloader T15",        jaar: 2024, omzet: 138000, margePercent: 22,  totaalUren: 1140, geplandeDoorlooptijdWeken: 12, werkelijkeDoorlooptijdWeken: 12, fases: [] },
  { id: "K2024-085", klant: "Westland Bakkerijen",   machine: "Trayloader T15",        jaar: 2024, omzet: 142000, margePercent: 25,  totaalUren: 1180, geplandeDoorlooptijdWeken: 12, werkelijkeDoorlooptijdWeken: 12, fases: [] },
  { id: "K2024-079", klant: "Bos Snacks",            machine: "Inpakrobot R5",         jaar: 2024, omzet: 102000, margePercent: 14,  totaalUren:  880, geplandeDoorlooptijdWeken: 10, werkelijkeDoorlooptijdWeken: 11, fases: [] },
  { id: "K2024-077", klant: "Den Hartog Conserven",  machine: "Etiketteermachine E12", jaar: 2024, omzet: 152000, margePercent: 16,  totaalUren: 1260, geplandeDoorlooptijdWeken: 14, werkelijkeDoorlooptijdWeken: 14, fases: [] },
  { id: "K2024-073", klant: "Verlinden Vis",         machine: "Stretchwikkelaar W8",   jaar: 2024, omzet: 124000, margePercent:  9,  totaalUren: 1240, geplandeDoorlooptijdWeken: 11, werkelijkeDoorlooptijdWeken: 14, fases: [] },
  { id: "K2024-071", klant: "Akkermans Suikerwerk",  machine: "Vulstation M60",        jaar: 2024, omzet: 320000, margePercent: 17,  totaalUren: 2780, geplandeDoorlooptijdWeken: 22, werkelijkeDoorlooptijdWeken: 22, fases: [] },
  { id: "K2024-068", klant: "Ravenstein Banket",     machine: "Trayloader T15",        jaar: 2024, omzet: 128000, margePercent: 19,  totaalUren: 1080, geplandeDoorlooptijdWeken: 11, werkelijkeDoorlooptijdWeken: 12, fases: [] },
  { id: "K2024-064", klant: "Vink Diepvries",        machine: "Sleevemachine S22",     jaar: 2024, omzet: 198000, margePercent: 13,  totaalUren: 1840, geplandeDoorlooptijdWeken: 15, werkelijkeDoorlooptijdWeken: 17, fases: [] },
  { id: "K2024-062", klant: "Smaakhuis Groothandel", machine: "Etiketteermachine E12", jaar: 2024, omzet:  94000, margePercent: 14,  totaalUren:  820, geplandeDoorlooptijdWeken:  9, werkelijkeDoorlooptijdWeken: 10, fases: [] },
  { id: "K2024-059", klant: "Klaver Kruiden",        machine: "Inpakrobot R5",         jaar: 2024, omzet:  72000, margePercent: 26,  totaalUren:  620, geplandeDoorlooptijdWeken:  8, werkelijkeDoorlooptijdWeken:  8, fases: [] },
];
