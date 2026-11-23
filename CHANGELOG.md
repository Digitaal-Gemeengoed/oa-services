# Wijzigingen

## 0.7.2 — 2026-11-23

- oa-contract 0.15.0.

## 0.7.1 — 2026-11-23

- oa-contract 0.14.0.

## 0.7.0 — 2026-11-20

- Toegankelijkheid: de regel "meer dan één kop 1" vervalt; een document met meerdere hoofdstukken heeft meerdere koppen 1.
- Nieuw: meer dan één regel met het opmaakprofiel Titel geeft een waarschuwing (WCAG 2.2, 2.4.2) met het herstel "Maak hier kop 1 van".
- oa-contract 0.13.0.

## 0.6.5 — 2026-11-20

- oa-contract 0.12.0.

## 0.6.4 — 2026-11-19

- oa-contract 0.11.0.

## 0.6.3 — 2026-11-19

- oa-contract 0.10.0.

## 0.6.2 — 2026-11-19

- Hangt af van oa-contract 0.9.0 (geen wijziging in de diensten zelf).

## 0.6.1 — 2026-11-18

- Een adres (straat met huisnummer, postcode met plaats) loopt niet meer door in de volgende cel of alinea. In een rekenblad werd bijvoorbeeld de woonplaats "Spaarnedijk" met het telefoonnummer in de cel ernaast als straat met huisnummer gezien.

## 0.6.0 — 2026-11-18

Anonimiseren vindt meer, vooral in tabellen en rekenbladen.

- **Kolomkoppen.** Onder een bekende kop (Achternaam, Voorletters, Naam, BSN, Geboortedatum, Adres, Postcode, Woonplaats, Telefoon, E-mail, IBAN, Kenteken…) is elke cel dat persoonsgegeven, ook een losse achternaam die het taalmodel zonder zin niet herkent.
- **Doorzetten.** Een gevonden waarde wordt ook voorgesteld op de andere plekken waar hij letterlijk staat.
- **BSN** in elke schrijfwijze (`1234.56.782`, `123 456 782`), alleen met een geldige elfproef.
- **Postcodes** met SA, SD of SS worden niet meer overgeslagen.
- **Geboortedatum**: na "geboren op", "geboortedatum" of "geb.", en in een kolom Geboortedatum. Staat standaard aan.
- Gemeten op een nagebouwd register van 120 rijen (verzonnen gegevens): achternamen 0 → 120, volledige namen 0 → 120, BSN 60 → 120, geboortedata 0 → 120, postcodes 72 → 120, voorletters 80 → 120, adressen 90 → 120.

## 0.5.4 — 2026-11-10

Hangt af van oa-contract 0.8.0; verder niets veranderd.

## 0.5.3 — 2026-11-10

Hangt af van oa-contract 0.7.0; verder niets veranderd.

## 0.5.2 — 2026-11-09

Hangt af van oa-contract 0.6.0; verder niets veranderd.

## 0.5.1 — 2026-11-09

Hangt af van oa-contract 0.5.0 (metadatamodellen); verder niets veranderd.

## 0.5.0 — 2026-11-09

**Toegankelijkheid van het bestand zelf** via [oa-wcag](https://github.com/Digitaal-Gemeengoed/oa-wcag) (34 controles voor docx, xlsx en pptx): titel en taal, contrast, tekstafstand, leesvolgorde en titels van dia's, alt-tekst van grafieken en groepen, tabellen, lijsten, formuliervelden.

- `POST /toegankelijkheid` neemt naast `inhoud` (html) ook `bestand` aan. Met `WCAG_URL` (en `WCAG_DIENSTSLEUTEL`) gaat het bestand naar oa-wcag; zonder blijft alles zoals het was.
- Samenvoegen: wat de html-controle al vond (en de assistent kan herstellen) telt niet nog eens; titel en taal komen alleen uit het bestand. Regels heten WCAG 2.2 (4.1.1 is daarin vervallen en blijft een advies). Elke bevinding zegt waar zij vandaan komt (`bron`).
- Kan oa-wcag het niet (odt, storing, onleesbaar bestand), dan een advies en gewoon de controle van de html.

## 0.4.3 — 2026-11-09

`/gezondheid` noemt de versie van de diensten (voor de overzichtspagina).

## 0.4.2 — 2026-11-09

Volgt oa-contract 0.4.0.

## 0.4.1 — 2026-11-09

De plaatshouders in de geanonimiseerde weergave volgen het contract: `[PERSOON]`, `[ADRES]`, `[BSN]` …

## 0.4.0 — 2026-11-09

**Anonimiseren.** `POST /anonimiseren` zoekt persoonsgegevens in de html en geeft de platte tekst, de blokken (met plek) en de treffers terug; `POST /anonimiseren/toepassen` schermt de gekozen treffers af en geeft de html en de aantallen per soort terug. Leest en rekent alleen.

- De herkenning doet OpenAnonymiser van Conduction (Presidio, spaCy `nl_core_news_lg`, Nederlandse patronen), intern bereikbaar via `OPENANONYMISER_URL`. Zonder adres of bij storing: 503, niet stilletjes minder.
- Erbij: eigen patronen voor adressen (straat met huisnummer, postcode met plaats), de aanhef ("heer", "mevrouw") uit namen, en overlap weg (het langste en zekerste wint).
- Standaard afgeschermd: naam, adres, BSN, IBAN, telefoon, e-mail, kenteken, zaaknummer.
- Tests met een nagebootste herkenning; met `OPENANONYMISER_TEST_URL` ook tegen een echte OpenAnonymiser.

## 0.3.0 — 2026-11-08

Rekenbladen en presentaties. De adapter levert ze als secties (`<section data-oa="blad">` met de bladnaam als `<h2>`, `<section data-oa="dia">` met de titel als `<h2>`). Nieuwe regels: dia zonder titel (WCAG 2.4.2, met een vraag om de titel), dubbele titels, bladen met een standaardnaam (Blad1, Sheet1). Plekken noemen het blad of de dia. Voor bladen en dia's geen kopstructuur van een tekstdocument, en in een blad geen eis van een kopregel.

## 0.2.2 — 2026-11-08

Typefout uit 0.2.1 hersteld (de build faalde).

## 0.2.1 — 2026-11-08

Een onderstreepte link geeft niet langer het advies "onderstreepte tekst lijkt op een link".

## 0.1.0 — 2026-11-07

Fase 1 van het werkende prototype: contract, minimaal platform, integratielaag met twee ingangen, assistentkern, paneel en een demo-werkomgeving met de modules metadateren en toegankelijkheid.
