# oa-services

**Assistent-services** van de Office Assistent achter de lezende ingang. Lezen en rekenen, nooit vastleggen: deze dienst heeft geen database en geen opslag.

> Onderdeel van het werkende prototype van de Office Assistent. Een prototype, geen product.

## Toegankelijkheid beoordelen

`POST /toegankelijkheid` beoordeelt een html-document en geeft bevindingen terug met een plek en, waar het kan, een voorstel:

| Controle | Norm | Voorstel |
|---|---|---|
| Afbeelding zonder alternatieve tekst | WCAG 2.2 1.1.1 | vraagt de medewerker om een tekst |
| Eerste kop is geen kop 1; overgeslagen kopniveau; meer dan één kop 1 | WCAG 2.2 1.3.1 | vervanging met het juiste niveau |
| Vette alinea die eruitziet als een kop | WCAG 2.2 1.3.1 | vervanging door een kop |
| Tabel zonder kopcellen | WCAG 2.2 1.3.1 | vervanging met een kopregel |
| Alinea die begint met een opsommingsteken | WCAG 2.2 1.3.1 | advies |
| Vage linktekst ("hier", "lees meer"), link zonder tekst | WCAG 2.2 2.4.4 | vraagt een nieuwe linktekst |
| Lege kop; lang stuk zonder koppen | WCAG 2.2 2.4.6 | advies |
| Onderstreepte tekst | WCAG 2.2 1.3.1 | advies |

Een plek is een pad van elementindices, bijvoorbeeld `body/4/0`. De adapter vertaalt het naar wat de medewerker ziet. Andere formaten dan html volgen later.

Alleen de integratielaag mag de dienst aanroepen (gedeelde dienstsleutel).

## Anonimiseren

`POST /anonimiseren` zoekt persoonsgegevens in een html-document. Het antwoord bevat de platte tekst (per blok, gescheiden door een lege regel), waar elk blok in het document staat, en de treffers: soort, tekst, positie, zekerheid en bron (model of patroon). `POST /anonimiseren/toepassen` krijgt de treffers die de medewerker heeft gekozen en geeft de html terug met die gegevens vervangen door `[naam]`, `[adres]`, `[BSN]` enzovoort, met de opmaak intact. Vastleggen doet het platform, na bevestiging.

De herkenning komt van [OpenAnonymiser](https://github.com/ConductionNL/anonymiq-light) van Conduction (EUPL-1.2): Presidio met spaCy `nl_core_news_lg` en Nederlandse patronen. Deze dienst roept het aan op `OPENANONYMISER_URL` en vult aan wat een taalmodel op losse cellen en notaties mist:

- **Eigen patronen**: adressen (straat met huisnummer, postcode met plaats, ook met de letters SA, SD en SS), het BSN in elke schrijfwijze (`123456782`, `1234.56.782`, `123 456 782`) maar alleen als de elfproef klopt, en een geboortedatum na "geboren op", "geboortedatum" of "geb.".
- **Kolomkoppen**: in een tabel of rekenblad is elke cel onder een bekende kop dat persoonsgegeven, ook een losse achternaam als "Bos". De koprij is de eerste rij (van de eerste vijf) met zo'n kop. Bekende koppen: (volledige) naam, achternaam, voornaam, voorletters, tussenvoegsel, naam aanvrager/indiener/klant…; BSN; geboortedatum; adres, straat, postcode; woonplaats; telefoon; e-mail; IBAN, rekeningnummer; kenteken. Een kop als "Naam document" of "Projectnaam" telt niet. Staan er in een cel al plaatshouders, dan alleen de stukken ertussen.
- **Doorzetten**: een gevonden waarde wordt ook voorgesteld op elke andere plek waar hij letterlijk staat (heel woord, hoofdlettergevoelig), bijvoorbeeld een achternaam uit de kolom in een alinea verderop.

Verder haalt de dienst de aanhef uit namen en ruimt overlap op.

| Soort | Standaard afgeschermd |
|---|---|
| naam, adres, BSN, IBAN, telefoon, e-mail, kenteken, zaaknummer, geboortedatum | ja |
| plaats, organisatie, datum, documentnummer, rijbewijs, KvK, btw, IP-adres | nee (de medewerker kan ze aanzetten) |

## Gebruik

```
npm run build
DIENSTEN_DIENSTSLEUTEL=... OPENANONYMISER_URL=http://localhost:8080 npm start      # poort 4200
npm test
```

## Licentie

© 2026 Gemeente Haarlem. EUPL 1.2, zie `LICENSE`.

Gemaakt door Erik Hoekstra, programma-architect en senior consultant, afdeling i-Ontwikkeling, Gemeente Haarlem, met assistentie van Claude (Anthropic).
