// Demo-data voor patroon-atlas — Korver Machinebouw, Helmond.
// Fictief familiebedrijf, special machines voor de voedingsmiddelenindustrie.
// Alle namen, projectcodes en getallen zijn verzonnen.

window.PA = window.PA || {};

window.PA.projecten = [
  { id: "K2025-101", klant: "Brouwer Sauzen",        machine: "Vulstation M40",        jaar: 2025, omzet: 1995000, margePercent: 22,  totaalUren: 16800, geplandeDoorlooptijdWeken: 18, werkelijkeDoorlooptijdWeken: 19,
    fases: [ { fase: "engineering",        geschat:  3360, werkelijk:  3640 },
             { fase: "assemblage",         geschat: 10080, werkelijk: 10360 },
             { fase: "inbedrijfstelling",  geschat:  2520, werkelijk:  2800 } ] },

  { id: "K2025-102", klant: "De Vegter Vleeswaren",  machine: "Sleevemachine S22",     jaar: 2025, omzet: 1680000, margePercent:  4,  totaalUren: 18760, geplandeDoorlooptijdWeken: 16, werkelijkeDoorlooptijdWeken: 24,
    fases: [ { fase: "engineering",        geschat:  2520, werkelijk:  4340 },
             { fase: "assemblage",         geschat:  8960, werkelijk:  9660 },
             { fase: "inbedrijfstelling",  geschat:  2240, werkelijk:  4760 } ] },

  { id: "K2025-103", klant: "Hoogland Zuivel",       machine: "Verpakkingslijn L100",  jaar: 2025, omzet: 2940000, margePercent: 23,  totaalUren: 25200, geplandeDoorlooptijdWeken: 26, werkelijkeDoorlooptijdWeken: 28,
    fases: [ { fase: "engineering",        geschat:  5040, werkelijk:  5600 },
             { fase: "assemblage",         geschat: 15120, werkelijk: 15400 },
             { fase: "inbedrijfstelling",  geschat:  3780, werkelijk:  4200 } ] },

  { id: "K2025-104", klant: "Westland Bakkerijen",   machine: "Trayloader T15",        jaar: 2025, omzet: 1015000, margePercent: 24,  totaalUren:  8400, geplandeDoorlooptijdWeken: 12, werkelijkeDoorlooptijdWeken: 12,
    fases: [ { fase: "engineering",        geschat:  1400, werkelijk:  1400 },
             { fase: "assemblage",         geschat:  5320, werkelijk:  5320 },
             { fase: "inbedrijfstelling",  geschat:  1400, werkelijk:  1680 } ] },

  { id: "K2025-105", klant: "Bos Snacks",            machine: "Inpakrobot R5",         jaar: 2025, omzet:  665000, margePercent:  8,  totaalUren:  6440, geplandeDoorlooptijdWeken: 10, werkelijkeDoorlooptijdWeken: 14,
    fases: [ { fase: "engineering",        geschat:  1120, werkelijk:  1680 },
             { fase: "assemblage",         geschat:  3920, werkelijk:  3220 },
             { fase: "inbedrijfstelling",  geschat:   980, werkelijk:  1540 } ] },

  { id: "K2025-106", klant: "Den Hartog Conserven",  machine: "Etiketteermachine E12", jaar: 2025, omzet: 1176000, margePercent: 17,  totaalUren:  9660, geplandeDoorlooptijdWeken: 14, werkelijkeDoorlooptijdWeken: 15,
    fases: [ { fase: "engineering",        geschat:  1680, werkelijk:  1820 },
             { fase: "assemblage",         geschat:  6160, werkelijk:  6300 },
             { fase: "inbedrijfstelling",  geschat:  1540, werkelijk:  1540 } ] },

  { id: "K2025-107", klant: "Verlinden Vis",         machine: "Stretchwikkelaar W8",   jaar: 2025, omzet:  770000, margePercent: -3,  totaalUren: 10360, geplandeDoorlooptijdWeken: 11, werkelijkeDoorlooptijdWeken: 19,
    fases: [ { fase: "engineering",        geschat:  1120, werkelijk:  2520 },
             { fase: "assemblage",         geschat:  4760, werkelijk:  5320 },
             { fase: "inbedrijfstelling",  geschat:  1120, werkelijk:  2520 } ] },

  { id: "K2025-108", klant: "Akkermans Suikerwerk",  machine: "Vulstation M60",        jaar: 2025, omzet: 2380000, margePercent: 19,  totaalUren: 20300, geplandeDoorlooptijdWeken: 22, werkelijkeDoorlooptijdWeken: 23,
    fases: [ { fase: "engineering",        geschat:  3920, werkelijk:  4200 },
             { fase: "assemblage",         geschat: 12180, werkelijk: 12460 },
             { fase: "inbedrijfstelling",  geschat:  3080, werkelijk:  3640 } ] },

  { id: "K2025-109", klant: "Ravenstein Banket",     machine: "Trayloader T15",        jaar: 2025, omzet:  924000, margePercent: 21,  totaalUren:  7560, geplandeDoorlooptijdWeken: 11, werkelijkeDoorlooptijdWeken: 11,
    fases: [ { fase: "engineering",        geschat:  1260, werkelijk:  1260 },
             { fase: "assemblage",         geschat:  4760, werkelijk:  4900 },
             { fase: "inbedrijfstelling",  geschat:  1260, werkelijk:  1400 } ] },

  { id: "K2025-110", klant: "Vink Diepvries",        machine: "Verpakkingslijn L100",  jaar: 2025, omzet: 2765000, margePercent:  7,  totaalUren: 26600, geplandeDoorlooptijdWeken: 24, werkelijkeDoorlooptijdWeken: 32,
    fases: [ { fase: "engineering",        geschat:  4480, werkelijk:  6440 },
             { fase: "assemblage",         geschat: 15680, werkelijk: 16660 },
             { fase: "inbedrijfstelling",  geschat:  3360, werkelijk:  3500 } ] },

  { id: "K2025-111", klant: "Smaakhuis Groothandel", machine: "Etiketteermachine E12", jaar: 2025, omzet:  616000, margePercent: 12,  totaalUren:  5460, geplandeDoorlooptijdWeken:  9, werkelijkeDoorlooptijdWeken: 10,
    fases: [ { fase: "engineering",        geschat:   980, werkelijk:  1120 },
             { fase: "assemblage",         geschat:  3500, werkelijk:  3500 },
             { fase: "inbedrijfstelling",  geschat:   840, werkelijk:   840 } ] },

  { id: "K2025-112", klant: "Klaver Kruiden",        machine: "Inpakrobot R5",         jaar: 2025, omzet:  532000, margePercent: 28,  totaalUren:  4480, geplandeDoorlooptijdWeken:  8, werkelijkeDoorlooptijdWeken:  8,
    fases: [ { fase: "engineering",        geschat:   700, werkelijk:   700 },
             { fase: "assemblage",         geschat:  2940, werkelijk:  2940 },
             { fase: "inbedrijfstelling",  geschat:   840, werkelijk:   840 } ] },

  { id: "K2025-113", klant: "Brouwer Sauzen",        machine: "Etiketteermachine E12", jaar: 2025, omzet: 1092000, margePercent: 15,  totaalUren:  9240, geplandeDoorlooptijdWeken: 13, werkelijkeDoorlooptijdWeken: 14,
    fases: [ { fase: "engineering",        geschat:  1540, werkelijk:  1680 },
             { fase: "assemblage",         geschat:  5880, werkelijk:  6020 },
             { fase: "inbedrijfstelling",  geschat:  1540, werkelijk:  1540 } ] },

  { id: "K2025-114", klant: "Veldhuis Banket",       machine: "Trayloader T15",        jaar: 2025, omzet:  700000, margePercent: 18,  totaalUren:  5880, geplandeDoorlooptijdWeken: 11, werkelijkeDoorlooptijdWeken: 11,
    fases: [ { fase: "engineering",        geschat:   980, werkelijk:  1120 },
             { fase: "assemblage",         geschat:  3640, werkelijk:  3640 },
             { fase: "inbedrijfstelling",  geschat:  1120, werkelijk:  1120 } ] },

  { id: "K2024-091", klant: "Brouwer Sauzen",        machine: "Vulstation M40",        jaar: 2024, omzet: 1876000, margePercent: 20,  totaalUren: 15960, geplandeDoorlooptijdWeken: 18, werkelijkeDoorlooptijdWeken: 19,
    fases: [ { fase: "engineering",        geschat:  3200, werkelijk:  3300 },
             { fase: "assemblage",         geschat:  9560, werkelijk:  9760 },
             { fase: "inbedrijfstelling",  geschat:  2400, werkelijk:  2900 } ] },

  { id: "K2024-088", klant: "De Vegter Vleeswaren",  machine: "Sleevemachine S22",     jaar: 2024, omzet: 1505000, margePercent: 11,  totaalUren: 14700, geplandeDoorlooptijdWeken: 16, werkelijkeDoorlooptijdWeken: 18,
    fases: [ { fase: "engineering",        geschat:  2000, werkelijk:  3300 },
             { fase: "assemblage",         geschat:  7000, werkelijk:  7500 },
             { fase: "inbedrijfstelling",  geschat:  1800, werkelijk:  3900 } ] },

  { id: "K2024-082", klant: "Hoogland Zuivel",       machine: "Trayloader T15",        jaar: 2024, omzet:  966000, margePercent: 22,  totaalUren:  7980, geplandeDoorlooptijdWeken: 12, werkelijkeDoorlooptijdWeken: 12,
    fases: [ { fase: "engineering",        geschat:  1300, werkelijk:  1300 },
             { fase: "assemblage",         geschat:  5000, werkelijk:  5040 },
             { fase: "inbedrijfstelling",  geschat:  1300, werkelijk:  1640 } ] },

  { id: "K2024-085", klant: "Westland Bakkerijen",   machine: "Trayloader T15",        jaar: 2024, omzet:  994000, margePercent: 25,  totaalUren:  8260, geplandeDoorlooptijdWeken: 12, werkelijkeDoorlooptijdWeken: 12,
    fases: [ { fase: "engineering",        geschat:  1350, werkelijk:  1350 },
             { fase: "assemblage",         geschat:  5200, werkelijk:  5200 },
             { fase: "inbedrijfstelling",  geschat:  1400, werkelijk:  1710 } ] },

  { id: "K2024-079", klant: "Bos Snacks",            machine: "Inpakrobot R5",         jaar: 2024, omzet:  714000, margePercent: 14,  totaalUren:  6160, geplandeDoorlooptijdWeken: 10, werkelijkeDoorlooptijdWeken: 11,
    fases: [ { fase: "engineering",        geschat:  1000, werkelijk:  1500 },
             { fase: "assemblage",         geschat:  3700, werkelijk:  3520 },
             { fase: "inbedrijfstelling",  geschat:   900, werkelijk:  1140 } ] },

  { id: "K2024-077", klant: "Den Hartog Conserven",  machine: "Etiketteermachine E12", jaar: 2024, omzet: 1064000, margePercent: 16,  totaalUren:  8820, geplandeDoorlooptijdWeken: 14, werkelijkeDoorlooptijdWeken: 14,
    fases: [ { fase: "engineering",        geschat:  1500, werkelijk:  1600 },
             { fase: "assemblage",         geschat:  5700, werkelijk:  5820 },
             { fase: "inbedrijfstelling",  geschat:  1400, werkelijk:  1400 } ] },

  { id: "K2024-076", klant: "Bremer Frisdrank",      machine: "Vulstation M40",        jaar: 2024, omzet: 1610000, margePercent: 15,  totaalUren: 13860, geplandeDoorlooptijdWeken: 17, werkelijkeDoorlooptijdWeken: 18,
    fases: [ { fase: "engineering",        geschat:  2800, werkelijk:  2900 },
             { fase: "assemblage",         geschat:  8400, werkelijk:  8460 },
             { fase: "inbedrijfstelling",  geschat:  2100, werkelijk:  2500 } ] },

  { id: "K2024-073", klant: "Verlinden Vis",         machine: "Stretchwikkelaar W8",   jaar: 2024, omzet:  868000, margePercent:  9,  totaalUren:  8680, geplandeDoorlooptijdWeken: 11, werkelijkeDoorlooptijdWeken: 14,
    fases: [ { fase: "engineering",        geschat:  1000, werkelijk:  2200 },
             { fase: "assemblage",         geschat:  4000, werkelijk:  4400 },
             { fase: "inbedrijfstelling",  geschat:  1000, werkelijk:  2080 } ] },

  { id: "K2024-071", klant: "Akkermans Suikerwerk",  machine: "Vulstation M60",        jaar: 2024, omzet: 2240000, margePercent: 17,  totaalUren: 19460, geplandeDoorlooptijdWeken: 22, werkelijkeDoorlooptijdWeken: 22,
    fases: [ { fase: "engineering",        geschat:  3800, werkelijk:  4000 },
             { fase: "assemblage",         geschat: 11800, werkelijk: 11960 },
             { fase: "inbedrijfstelling",  geschat:  3000, werkelijk:  3500 } ] },

  { id: "K2024-068", klant: "Ravenstein Banket",     machine: "Trayloader T15",        jaar: 2024, omzet:  896000, margePercent: 19,  totaalUren:  7560, geplandeDoorlooptijdWeken: 11, werkelijkeDoorlooptijdWeken: 12,
    fases: [ { fase: "engineering",        geschat:  1250, werkelijk:  1260 },
             { fase: "assemblage",         geschat:  4700, werkelijk:  4860 },
             { fase: "inbedrijfstelling",  geschat:  1300, werkelijk:  1440 } ] },

  { id: "K2024-064", klant: "Vink Diepvries",        machine: "Sleevemachine S22",     jaar: 2024, omzet: 1386000, margePercent: 13,  totaalUren: 12880, geplandeDoorlooptijdWeken: 15, werkelijkeDoorlooptijdWeken: 17,
    fases: [ { fase: "engineering",        geschat:  1800, werkelijk:  3080 },
             { fase: "assemblage",         geschat:  6300, werkelijk:  6700 },
             { fase: "inbedrijfstelling",  geschat:  1500, werkelijk:  3100 } ] },

  { id: "K2024-062", klant: "Smaakhuis Groothandel", machine: "Etiketteermachine E12", jaar: 2024, omzet:  658000, margePercent: 14,  totaalUren:  5740, geplandeDoorlooptijdWeken:  9, werkelijkeDoorlooptijdWeken: 10,
    fases: [ { fase: "engineering",        geschat:  1000, werkelijk:  1140 },
             { fase: "assemblage",         geschat:  3700, werkelijk:  3700 },
             { fase: "inbedrijfstelling",  geschat:   900, werkelijk:   900 } ] },

  { id: "K2024-059", klant: "Klaver Kruiden",        machine: "Inpakrobot R5",         jaar: 2024, omzet:  504000, margePercent: 26,  totaalUren:  4340, geplandeDoorlooptijdWeken:  8, werkelijkeDoorlooptijdWeken:  8,
    fases: [ { fase: "engineering",        geschat:   700, werkelijk:   700 },
             { fase: "assemblage",         geschat:  2800, werkelijk:  2800 },
             { fase: "inbedrijfstelling",  geschat:   840, werkelijk:   840 } ] },
];
